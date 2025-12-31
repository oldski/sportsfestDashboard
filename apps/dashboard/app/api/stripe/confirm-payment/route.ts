import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@workspace/auth';
import { db, eq, and, sql } from '@workspace/database/client';
import {
  orderTable,
  orderPaymentTable,
  orderInvoiceTable,
  orderItemTable,
  productTable,
  companyTeamTable,
  organizationTable,
  userTable,
  eventYearTable,
  couponTable,
  OrderStatus,
  PaymentStatus,
  PaymentType,
  ProductType
} from '@workspace/database/schema';
import { stripe } from '~/lib/stripe';
import { sendPurchaseConfirmationEmail } from '@workspace/email/send-purchase-confirmation-email';
import { sendAdminPurchaseNotificationEmail } from '@workspace/email/send-admin-purchase-notification-email';
import { confirmInventorySale, confirmTentSale } from '~/lib/inventory-management';

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  orderId: string;
  isFreeOrder?: boolean;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  orderId: string;
  orderStatus: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Starting confirm-payment route');
    const session = await auth();

    const body: ConfirmPaymentRequest = await request.json();
    const { paymentIntentId, orderId, isFreeOrder } = body;

    console.log('📋 Confirm payment request:', { paymentIntentId, orderId, isFreeOrder });

    // Validate input
    if (!paymentIntentId || !orderId) {
      console.error('❌ Missing required fields:', { paymentIntentId, orderId });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let paymentIntent: any = null;
    let paymentAmount = 0;

    // Handle free orders differently
    if (isFreeOrder && paymentIntentId === 'free_order') {
      console.log('🆓 Processing free order completion');
      paymentAmount = 0;
    } else {
      // Retrieve the payment intent from Stripe for paid orders
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        return NextResponse.json(
          { error: 'Payment not successful' },
          { status: 400 }
        );
      }

      paymentAmount = paymentIntent.amount / 100; // Convert from cents
    }

    // Get the order
    console.log('🔍 Fetching order with ID:', orderId);
    const [order] = await db
      .select()
      .from(orderTable)
      .where(eq(orderTable.id, orderId));

    if (!order) {
      console.error('❌ Order not found for ID:', orderId);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    console.log('✅ Found order:', { id: order.id, status: order.status, totalAmount: order.totalAmount });

    // Skip payment verification for free orders
    if (!isFreeOrder) {
      // Verify the payment intent belongs to this order
      // For order completion payments or sponsorship payments, we may have a different payment intent ID
      const isOrderCompletionPayment = paymentIntent.metadata?.paymentType === 'balance_completion';
      const isSponsorshipPayment = paymentIntent.metadata?.paymentType === 'sponsorship';
      const isOriginalPayment = order.stripePaymentIntentId === paymentIntentId;


      if (!isOriginalPayment && !isOrderCompletionPayment && !isSponsorshipPayment) {
        return NextResponse.json(
          { error: 'Payment intent does not belong to this order' },
          { status: 400 }
        );
      }

      // For order completion or sponsorship payments, verify the order ID in metadata matches
      if ((isOrderCompletionPayment || isSponsorshipPayment) && paymentIntent.metadata?.orderId !== orderId) {
        return NextResponse.json(
          { error: 'Payment intent order mismatch' },
          { status: 400 }
        );
      }
    }

    // Determine payment type and new order status
    
    let paymentType: PaymentType;
    let newOrderStatus: OrderStatus;

    if (isFreeOrder) {
      // Free order with 100% coupon discount
      paymentType = PaymentType.BALANCE_PAYMENT;
      newOrderStatus = OrderStatus.FULLY_PAID;
    } else if (paymentIntent.metadata?.paymentType === 'balance_completion' || paymentIntent.metadata?.paymentType === 'sponsorship') {
      // This is a balance completion or sponsorship payment
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
    console.log('💳 Creating payment record for orderId:', orderId);
    if (isFreeOrder) {
      const couponData = order.metadata && typeof order.metadata === 'object'
        ? (order.metadata as any).appliedCoupon
        : null;

      console.log('🆓 Free order coupon data:', couponData);

      await db.insert(orderPaymentTable).values({
        orderId,
        type: paymentType,
        status: PaymentStatus.COMPLETED,
        amount: paymentAmount,
        stripePaymentIntentId: 'free_order',
        stripeChargeId: 'coupon_discount',
        paymentMethodType: 'coupon',
        processedAt: new Date(),
        metadata: {
          freeOrder: true,
          couponApplied: couponData,
        }
      });
      console.log('✅ Payment record created for free order');
    } else {
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
    }

    // Update order status and payment info
    // For completion payments, also update the payment intent ID
    const updateFields: any = {
      status: newOrderStatus,
      updatedAt: new Date(),
    };

    if (isFreeOrder) {
      updateFields.stripePaymentIntentId = 'free_order';
    } else if (paymentIntent.metadata?.paymentType === 'balance_completion' || paymentIntent.metadata?.paymentType === 'sponsorship') {
      updateFields.stripePaymentIntentId = paymentIntentId;
    }

    console.log('📝 Updating order with fields:', updateFields);
    await db
      .update(orderTable)
      .set(updateFields)
      .where(eq(orderTable.id, orderId));
    console.log('✅ Order updated successfully');

    // Create or update invoice
    console.log('📄 Creating invoice for order:', { orderId, paymentAmount, orderTotal: order.totalAmount, isFreeOrder });
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const currentPaidAmount = paymentAmount;

    // For free orders, the balance owed should be 0 since the order total is already discounted
    const balanceOwed = isFreeOrder ? 0 : (order.totalAmount - currentPaidAmount);
    
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

      console.log('📄 Creating new invoice with status:', invoiceStatus, 'balanceOwed:', balanceOwed);

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
        stripeInvoiceId: isFreeOrder ? 'free_order' : paymentIntentId,
        notes: isFreeOrder
          ? `Free order completed with 100% coupon discount (${order.metadata?.appliedCoupon?.code || 'Unknown coupon'})`
          : `Payment of ${paymentAmount.toFixed(2)} received via ${paymentIntent.payment_method_types[0]}`
      });

      console.log('✅ Invoice created successfully');
    }

    // Confirm inventory sales - move from reserved to sold
    // Only confirm sales when payment is fully completed
    if (newOrderStatus === OrderStatus.FULLY_PAID || newOrderStatus === OrderStatus.DEPOSIT_PAID) {
      try {
        // Get order items with product details to confirm their inventory
        const orderItems = await db
          .select({
            productId: orderItemTable.productId,
            quantity: orderItemTable.quantity,
            productType: productTable.type
          })
          .from(orderItemTable)
          .innerJoin(productTable, eq(orderItemTable.productId, productTable.id))
          .where(eq(orderItemTable.orderId, orderId));

        // Confirm inventory sale for each item
        for (const item of orderItems) {
          if (item.productType === ProductType.TENT_RENTAL) {
            // Handle tent sales with quota tracking
            const tentResult = await confirmTentSale(
              item.productId,
              order.organizationId,
              order.eventYearId,
              item.quantity
            );
            if (!tentResult.success) {
              console.warn(`Failed to confirm tent sale for product ${item.productId}:`, tentResult.error);
              // Continue with other items even if one fails
            } else {
              console.log(`✅ Tent sale confirmed: ${item.quantity} tents, ${tentResult.remainingAllowed} remaining for org`);
            }
          } else {
            // Handle regular inventory confirmation
            const result = await confirmInventorySale(item.productId, item.quantity);
            if (!result.success) {
              console.warn(`Failed to confirm inventory sale for product ${item.productId}:`, result.error);
              // Continue with other items even if one fails
            }
          }
        }
        console.log('✅ Inventory sales confirmed successfully');
      } catch (inventoryError) {
        console.error('Error confirming inventory sales:', inventoryError);
        // Don't fail the payment confirmation if inventory confirmation fails
        // The cron job will eventually clean up any remaining reservations
      }
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

    // Mark coupon as used if this was a coupon order
    if (order.metadata?.appliedCoupon?.id) {
      try {
        const couponId = order.metadata.appliedCoupon.id;
        console.log('🎟️ Marking coupon as used:', couponId);

        await db
          .update(couponTable)
          .set({
            currentUses: sql`${couponTable.currentUses} + 1`,
            updatedAt: new Date()
          })
          .where(eq(couponTable.id, couponId));

        console.log('✅ Coupon usage incremented successfully');
      } catch (couponError) {
        console.error('❌ Error updating coupon usage:', couponError);
        // Don't fail the payment confirmation if coupon update fails
      }
    }

    // Send email notifications
    try {
      // If no session, try to get user info from Stripe metadata
      let userInfo: { email: string | null; name: string | null } | null = session?.user ? {
        email: session.user.email || null,
        name: session.user.name || null
      } : null;

      if (!userInfo && paymentIntent.metadata?.userId) {
        // Try to get user from database using Stripe metadata
        const [dbUser] = await db
          .select({
            email: userTable.email,
            name: userTable.name
          })
          .from(userTable)
          .where(eq(userTable.id, paymentIntent.metadata.userId))
          .limit(1);

        if (dbUser) {
          userInfo = {
            email: dbUser.email,
            name: dbUser.name
          };
        }
      }

      await sendEmailNotifications({
        orderId,
        paymentAmount,
        userInfo
      });
      console.log('✅ Email notifications completed successfully');
    } catch (emailError) {
      console.error('❌ Error sending email notifications:', emailError);
      // Don't fail the payment confirmation if email sending fails
    }

    const response: ConfirmPaymentResponse = {
      success: true,
      orderId,
      orderStatus: newOrderStatus,
    };

    console.log('✅ Confirm payment completed successfully:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('🚨 CRITICAL ERROR in confirm-payment route:', error);
    console.error('🚨 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('🚨 Error message:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to confirm payment', details: error instanceof Error ? error.message : 'Unknown error' },
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

/**
 * Sends email notifications for completed payments
 */
async function sendEmailNotifications({
  orderId,
  paymentAmount,
  userInfo
}: {
  orderId: string;
  paymentAmount: number;
  userInfo: { email: string | null; name: string | null } | null;
}): Promise<void> {
  // Get order details with related data
  const [orderData] = await db
    .select({
      orderNumber: orderTable.orderNumber,
      totalAmount: orderTable.totalAmount,
      organizationId: orderTable.organizationId,
      organizationName: organizationTable.name,
      eventYearName: eventYearTable.name,
      eventYearYear: eventYearTable.year,
      metadata: orderTable.metadata,
    })
    .from(orderTable)
    .innerJoin(organizationTable, eq(orderTable.organizationId, organizationTable.id))
    .innerJoin(eventYearTable, eq(orderTable.eventYearId, eventYearTable.id))
    .where(eq(orderTable.id, orderId));

  if (!orderData) {
    console.error('❌ Could not find order data for email notifications for orderId:', orderId);
    return;
  }

  // Add customer info from userInfo
  const customerEmail = userInfo?.email || 'unknown@example.com';
  const customerName = userInfo?.name || 'Unknown User';

  // Get order items
  const orderItems = await db
    .select({
      productName: productTable.name,
      quantity: orderItemTable.quantity,
      unitPrice: orderItemTable.unitPrice,
      totalPrice: orderItemTable.totalPrice,
    })
    .from(orderItemTable)
    .innerJoin(productTable, eq(orderItemTable.productId, productTable.id))
    .where(eq(orderItemTable.orderId, orderId));

  // Calculate remaining balance
  const remainingBalance = orderData.totalAmount - paymentAmount;
  const isFullPayment = remainingBalance <= 0;

  // Get coupon information from order metadata
  const appliedCoupon = orderData.metadata?.appliedCoupon || undefined;
  const couponDiscount = orderData.metadata?.couponDiscount || 0;
  const originalTotal = orderData.metadata?.originalTotal || orderData.totalAmount;

  console.log('📧 Email coupon data:', { appliedCoupon, couponDiscount, originalTotal });
  console.log('📧 Full metadata:', JSON.stringify(orderData.metadata, null, 2));

  const emailData = {
    customerName: customerName,
    customerEmail: customerEmail,
    organizationName: orderData.organizationName,
    orderNumber: orderData.orderNumber,
    totalAmount: orderData.totalAmount,
    originalTotal,
    paymentAmount,
    remainingBalance: Math.max(0, remainingBalance),
    orderItems: orderItems.map(item => ({
      name: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice
    })),
    eventYear: {
      name: orderData.eventYearName,
      year: orderData.eventYearYear
    },
    isFullPayment,
    appliedCoupon,
    couponDiscount,
    orderUrl: `${process.env.NEXT_PUBLIC_APP_URL}/organizations/${orderData.organizationId}/registration/orders?openOrder=${orderId}`
  };

  // Send customer confirmation email
  const finalEmailData = {
    ...emailData,
    recipient: customerEmail
  };
  console.log('📧 Final email data being sent:', {
    appliedCoupon: finalEmailData.appliedCoupon,
    couponDiscount: finalEmailData.couponDiscount,
    originalTotal: finalEmailData.originalTotal,
    totalAmount: finalEmailData.totalAmount
  });

  await sendPurchaseConfirmationEmail(finalEmailData);
  console.log('✅ Customer confirmation email sent successfully');

  // Get super admin emails
  const superAdmins = await db
    .select({
      email: userTable.email,
    })
    .from(userTable)
    .where(eq(userTable.isSportsFestAdmin, true));

  const validAdminEmails = superAdmins.map(admin => admin.email).filter((email): email is string => email !== null);

  if (validAdminEmails.length > 0) {
    // Send admin notification emails
    await sendAdminPurchaseNotificationEmail({
      ...emailData,
      adminDashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin`,
      recipients: validAdminEmails
    });
    console.log('✅ Admin notification emails sent successfully');
  }
}