import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@workspace/auth';
import { db, eq, and } from '@workspace/database/client';
import { 
  orderTable, 
  orderPaymentTable,
  orderInvoiceTable,
  orderItemTable,
  productTable,
  companyTeamTable,
  OrderStatus,
  PaymentStatus,
  PaymentType,
  ProductType
} from '@workspace/database/schema';
import { stripe } from '~/lib/stripe';

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  orderId: string;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  orderId: string;
  orderStatus: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body: ConfirmPaymentRequest = await request.json();
    const { paymentIntentId, orderId } = body;

    // Validate input
    if (!paymentIntentId || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not successful' },
        { status: 400 }
      );
    }

    // Get the order
    const [order] = await db
      .select()
      .from(orderTable)
      .where(eq(orderTable.id, orderId));

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify the payment intent belongs to this order
    // For order completion payments, we may have a different payment intent ID
    const isOrderCompletionPayment = paymentIntent.metadata?.paymentType === 'balance_completion';
    const isOriginalPayment = order.stripePaymentIntentId === paymentIntentId;
    
    console.log('🔍 Payment confirmation details:', {
      orderId,
      paymentIntentId,
      orderPaymentIntentId: order.stripePaymentIntentId,
      isOrderCompletionPayment,
      isOriginalPayment,
      paymentIntentMetadata: paymentIntent.metadata
    });
    
    if (!isOriginalPayment && !isOrderCompletionPayment) {
      return NextResponse.json(
        { error: 'Payment intent does not belong to this order' },
        { status: 400 }
      );
    }
    
    // For order completion payments, verify the order ID in metadata matches
    if (isOrderCompletionPayment && paymentIntent.metadata?.orderId !== orderId) {
      return NextResponse.json(
        { error: 'Payment intent order mismatch' },
        { status: 400 }
      );
    }

    // Determine payment type and new order status
    const paymentAmount = paymentIntent.amount / 100; // Convert from cents
    
    let paymentType: PaymentType;
    let newOrderStatus: OrderStatus;
    
    if (isOrderCompletionPayment) {
      // This is a balance completion payment
      paymentType = PaymentType.BALANCE_PAYMENT;
      newOrderStatus = OrderStatus.FULLY_PAID;
    } else {
      // This is an original payment (could be deposit or full)
      const isDepositPayment = paymentAmount < order.totalAmount;
      paymentType = isDepositPayment ? PaymentType.DEPOSIT_PAYMENT : PaymentType.BALANCE_PAYMENT;
      
      if (isDepositPayment) {
        newOrderStatus = OrderStatus.DEPOSIT_PAID;
      } else if (paymentAmount === order.totalAmount) {
        newOrderStatus = OrderStatus.FULLY_PAID;
      } else {
        newOrderStatus = OrderStatus.CONFIRMED;
      }
    }

    // Create payment record
    await db.insert(orderPaymentTable).values({
      orderId,
      type: paymentType,
      status: PaymentStatus.COMPLETED,
      amount: paymentAmount,
      stripePaymentIntentId: paymentIntentId,
      stripeChargeId: paymentIntent.latest_charge as string,
      paymentMethodType: paymentIntent.payment_method_types[0],
      processedAt: new Date(),
      metadata: {
        stripePaymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
        }
      }
    });

    // Update order status and payment info
    // For completion payments, also update the payment intent ID
    const updateFields: any = {
      status: newOrderStatus,
      updatedAt: new Date(),
    };
    
    if (isOrderCompletionPayment) {
      updateFields.stripePaymentIntentId = paymentIntentId;
    }
    
    await db
      .update(orderTable)
      .set(updateFields)
      .where(eq(orderTable.id, orderId));

    // Create or update invoice
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const currentPaidAmount = paymentAmount;
    const balanceOwed = order.totalAmount - currentPaidAmount;
    
    // Check if invoice already exists for this order
    const [existingInvoice] = await db
      .select({ id: orderInvoiceTable.id, paidAmount: orderInvoiceTable.paidAmount })
      .from(orderInvoiceTable)
      .where(eq(orderInvoiceTable.orderId, orderId));

    if (existingInvoice) {
      // Update existing invoice
      const newPaidAmount = existingInvoice.paidAmount + paymentAmount;
      const newBalanceOwed = order.totalAmount - newPaidAmount;
      const invoiceStatus = newBalanceOwed <= 0 ? 'paid' : 'sent';

      await db
        .update(orderInvoiceTable)
        .set({
          paidAmount: newPaidAmount,
          balanceOwed: newBalanceOwed,
          status: invoiceStatus,
          paidAt: newBalanceOwed <= 0 ? new Date() : undefined,
          updatedAt: new Date()
        })
        .where(eq(orderInvoiceTable.id, existingInvoice.id));
    } else {
      // Create new invoice
      const invoiceStatus = balanceOwed <= 0 ? 'paid' : 'sent';
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30); // 30 days from now

      await db.insert(orderInvoiceTable).values({
        orderId,
        invoiceNumber,
        totalAmount: order.totalAmount,
        paidAmount: currentPaidAmount,
        balanceOwed,
        status: invoiceStatus,
        dueDate: balanceOwed > 0 ? dueDate : undefined,
        paidAt: balanceOwed <= 0 ? new Date() : undefined,
        sentAt: new Date(),
        stripeInvoiceId: paymentIntentId, // Using payment intent ID as reference
        notes: `Payment of ${paymentAmount.toFixed(2)} received via ${paymentIntent.payment_method_types[0]}`
      });
    }

    // Create company teams for team registration products 
    // Only create teams when the order becomes fully paid (either initial full payment or completion payment)
    if (newOrderStatus === OrderStatus.FULLY_PAID) {
      try {
        await createCompanyTeamsForOrder(orderId, order.organizationId, order.eventYearId);
      } catch (teamError) {
        console.error('Error creating company teams:', teamError);
        // Don't fail the payment confirmation if team creation fails
        // This can be handled manually later if needed
      }
    }

    const response: ConfirmPaymentResponse = {
      success: true,
      orderId,
      orderStatus: newOrderStatus,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}

/**
 * Creates company teams for team registration products in an order
 */
async function createCompanyTeamsForOrder(
  orderId: string, 
  organizationId: string, 
  eventYearId: string
): Promise<void> {
  // Get order items with product details
  const orderItems = await db
    .select({
      quantity: orderItemTable.quantity,
      productType: productTable.type,
      productName: productTable.name
    })
    .from(orderItemTable)
    .innerJoin(productTable, eq(orderItemTable.productId, productTable.id))
    .where(eq(orderItemTable.orderId, orderId));

  // Filter for team registration products
  const teamRegistrationItems = orderItems.filter(
    item => item.productType === ProductType.TEAM_REGISTRATION
  );

  if (teamRegistrationItems.length === 0) {
    return; // No team registration products in this order
  }

  // Get existing teams for this organization and event year
  const existingTeams = await db
    .select({ 
      teamNumber: companyTeamTable.teamNumber,
      createdAt: companyTeamTable.createdAt 
    })
    .from(companyTeamTable)
    .where(
      and(
        eq(companyTeamTable.organizationId, organizationId),
        eq(companyTeamTable.eventYearId, eventYearId)
      )
    )
    .orderBy(companyTeamTable.teamNumber);

  // Calculate total teams that should exist based on all paid team registration products for this org/event year
  const totalTeamsNeeded = teamRegistrationItems.reduce((sum, item) => sum + item.quantity, 0);
  
  // If we already have the right number of teams, don't create more
  if (existingTeams.length >= totalTeamsNeeded) {
    console.log(`✅ Company teams already exist for organization ${organizationId}:`, 
      existingTeams.map(t => `Team ${t.teamNumber}`).join(', ')
    );
    return;
  }

  const existingTeamNumbers = new Set(existingTeams.map(team => team.teamNumber));
  let nextTeamNumber = 1;

  // Calculate how many additional teams to create
  const totalTeamsToCreate = totalTeamsNeeded - existingTeams.length;

  // Create company teams
  const teamsToCreate = [];
  for (let i = 0; i < totalTeamsToCreate; i++) {
    // Find next available team number
    while (existingTeamNumbers.has(nextTeamNumber)) {
      nextTeamNumber++;
    }

    teamsToCreate.push({
      organizationId,
      eventYearId,
      teamNumber: nextTeamNumber,
      name: `Team ${nextTeamNumber}`,
      isPaid: true
    });

    existingTeamNumbers.add(nextTeamNumber);
    nextTeamNumber++;
  }

  // Insert all teams at once
  if (teamsToCreate.length > 0) {
    await db.insert(companyTeamTable).values(teamsToCreate);
    
    console.log(`✅ Created ${teamsToCreate.length} company team(s) for organization ${organizationId}:`, 
      teamsToCreate.map(t => t.name).join(', ')
    );
  }
}