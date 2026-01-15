import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@workspace/auth';
import { db, eq, and, sql } from '@workspace/database/client';
import {
  orderTable,
  orderPaymentTable,
  organizationTable,
  OrderStatus
} from '@workspace/database/schema';
import { stripe, STRIPE_CONFIG, SPONSORSHIP_CONFIG } from '~/lib/stripe';

export type SponsorshipPaymentMethodType = 'card' | 'us_bank_account';

export interface CompleteOrderPaymentRequest {
  orderId: string;
  // For sponsorships: which payment method was selected (affects fee calculation)
  paymentMethodType?: SponsorshipPaymentMethodType;
}

export interface CompleteOrderPaymentResponse {
  clientSecret: string;
  orderId: string;
  remainingAmount: number;
  // For sponsorships: the breakdown of the payment
  sponsorshipDetails?: {
    baseAmount: number;
    processingFee: number;
    totalAmount: number;
    paymentMethodType: SponsorshipPaymentMethodType;
  };
}


export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Order completion payment API called');
    
    const session = await auth();
    if (!session?.user) {
      console.error('❌ Authentication failed - no session');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', session.user.id);

    const body: CompleteOrderPaymentRequest = await request.json();
    const { orderId, paymentMethodType } = body;

    console.log('📥 Request body:', body);

    if (!orderId) {
      console.error('❌ Missing order ID');
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get the order with organization info
    const [orderResult] = await db
      .select({
        order: {
          id: orderTable.id,
          orderNumber: orderTable.orderNumber,
          organizationId: orderTable.organizationId,
          totalAmount: orderTable.totalAmount,
          status: orderTable.status,
          stripePaymentIntentId: orderTable.stripePaymentIntentId,
          isSponsorship: orderTable.isSponsorship,
          metadata: orderTable.metadata
        },
        organization: {
          id: organizationTable.id,
          name: organizationTable.name,
          slug: organizationTable.slug
        }
      })
      .from(orderTable)
      .innerJoin(organizationTable, eq(orderTable.organizationId, organizationTable.id))
      .where(eq(orderTable.id, orderId));

    if (!orderResult) {
      console.error('❌ Order not found:', orderId);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const { order, organization } = orderResult;
    console.log('✅ Order found:', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: order.totalAmount,
      isSponsorship: order.isSponsorship,
      organizationName: organization.name
    });

    // Verify the user has access to this organization
    // This would typically check user permissions - simplified for now
    if (!session.user.id) {
      return NextResponse.json(
        { error: 'User access verification failed' },
        { status: 403 }
      );
    }

    // Check if order is eligible for payment completion
    if (order.status === OrderStatus.FULLY_PAID) {
      return NextResponse.json(
        { error: 'Order is already fully paid' },
        { status: 400 }
      );
    }

    // Allow pending sponsorship orders (they need first payment via this flow)
    const isPendingSponsorship = order.status === OrderStatus.PENDING && order.isSponsorship;

    if (order.status === OrderStatus.PENDING && !order.isSponsorship) {
      return NextResponse.json(
        { error: 'Order has no payments yet - use the regular checkout flow' },
        { status: 400 }
      );
    }

    if (order.status !== OrderStatus.DEPOSIT_PAID && !isPendingSponsorship) {
      return NextResponse.json(
        { error: 'Order is not eligible for payment completion' },
        { status: 400 }
      );
    }

    // Get existing payments to calculate remaining amount
    const totalPaid = await db
      .select({
        totalPaid: sql<number>`COALESCE(SUM(amount), 0)`
      })
      .from(orderPaymentTable)
      .where(eq(orderPaymentTable.orderId, orderId))
      .then(result => result[0]?.totalPaid || 0);

    // For sponsorships, calculate amount based on payment method
    let paymentAmount: number;
    let sponsorshipDetails: CompleteOrderPaymentResponse['sponsorshipDetails'] | undefined;

    if (order.isSponsorship) {
      // Validate payment method type is provided for sponsorships
      if (!paymentMethodType) {
        return NextResponse.json(
          { error: 'Payment method type is required for sponsorship payments' },
          { status: 400 }
        );
      }

      // Get base amount from order metadata
      const orderMetadata = order.metadata as any;
      const baseAmount = orderMetadata?.sponsorship?.baseAmount;

      if (!baseAmount || baseAmount <= 0) {
        console.error('❌ Invalid sponsorship base amount:', baseAmount);
        return NextResponse.json(
          { error: 'Invalid sponsorship configuration' },
          { status: 400 }
        );
      }

      // Calculate amount based on payment method
      if (paymentMethodType === 'card') {
        // Card payment: include processing fee
        const processingFee = SPONSORSHIP_CONFIG.calculateProcessingFee(baseAmount);
        paymentAmount = SPONSORSHIP_CONFIG.calculateTotalWithFee(baseAmount);
        sponsorshipDetails = {
          baseAmount,
          processingFee,
          totalAmount: paymentAmount,
          paymentMethodType: 'card'
        };
      } else {
        // Bank payment: no processing fee
        paymentAmount = baseAmount;
        sponsorshipDetails = {
          baseAmount,
          processingFee: 0,
          totalAmount: baseAmount,
          paymentMethodType: 'us_bank_account'
        };
      }

      console.log('💳 Sponsorship payment calculation:', {
        baseAmount,
        paymentMethodType,
        paymentAmount,
        sponsorshipDetails
      });
    } else {
      // Non-sponsorship: use standard remaining amount calculation
      paymentAmount = order.totalAmount - totalPaid;
    }

    if (paymentAmount <= 0) {
      return NextResponse.json(
        { error: 'No remaining balance on this order' },
        { status: 400 }
      );
    }

    console.log('💳 Creating payment intent for order completion:', {
      orderId,
      organizationName: organization.name,
      totalAmount: order.totalAmount,
      totalPaid,
      paymentAmount,
      isSponsorship: order.isSponsorship,
      paymentMethodType
    });

    // Determine which payment methods to allow
    // For sponsorships, only allow the selected method
    // For regular orders, allow all configured methods
    const allowedPaymentMethods = order.isSponsorship && paymentMethodType
      ? [paymentMethodType]
      : [...STRIPE_CONFIG.paymentMethodTypes];

    // Always create a new Stripe Payment Intent for order completion
    // This ensures compatibility with the Payment Element which requires automatic confirmation
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(paymentAmount * 100), // Convert to cents
      currency: STRIPE_CONFIG.currency,
      payment_method_types: allowedPaymentMethods,
      capture_method: STRIPE_CONFIG.captureMethod,
      confirmation_method: STRIPE_CONFIG.confirmationMethod,
      metadata: {
        orderId,
        organizationId: organization.id,
        organizationSlug: organization.slug,
        paymentType: order.isSponsorship ? 'sponsorship' : 'balance_completion',
        isSponsorship: order.isSponsorship ? 'true' : 'false',
        userId: session.user.id,
        // Store sponsorship payment details for later invoice update
        ...(sponsorshipDetails && {
          sponsorshipBaseAmount: sponsorshipDetails.baseAmount.toString(),
          sponsorshipProcessingFee: sponsorshipDetails.processingFee.toString(),
          sponsorshipPaymentMethod: sponsorshipDetails.paymentMethodType,
        }),
      },
    });

    console.log('✅ Payment intent ready for order completion:', paymentIntent.id);

    // Note: We don't update the order's stripePaymentIntentId here because:
    // 1. The original payment intent ID should remain for the initial payment
    // 2. This new payment intent is specifically for the balance completion
    // 3. The payment confirmation webhook will handle recording this payment

    const response: CompleteOrderPaymentResponse = {
      clientSecret: paymentIntent.client_secret!,
      orderId,
      remainingAmount: paymentAmount,
      ...(sponsorshipDetails && { sponsorshipDetails }),
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error creating payment intent for order completion:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}