import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text
} from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import * as React from 'react';

import { APP_NAME } from '@workspace/common/app';

export interface AdminPurchaseNotificationEmailProps {
  customerName: string;
  customerEmail: string;
  organizationName: string;
  orderNumber: string;
  totalAmount: number;
  paymentAmount: number;
  remainingBalance: number;
  orderItems: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  eventYear: {
    name: string;
    year: number;
  };
  isFullPayment: boolean;
  adminDashboardUrl: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const AdminPurchaseNotificationEmail = ({
  customerName = 'John Doe',
  customerEmail = 'john@acme.com',
  organizationName = 'Acme Corp',
  orderNumber = 'ORD-12345',
  totalAmount = 150.00,
  paymentAmount = 150.00,
  remainingBalance = 0,
  orderItems = [
    { name: 'Team Registration', quantity: 1, unitPrice: 100.00, totalPrice: 100.00 },
    { name: 'Tent Rental', quantity: 1, unitPrice: 50.00, totalPrice: 50.00 }
  ],
  eventYear = { name: 'Summer Sports Festival', year: 2025 },
  isFullPayment = true,
  adminDashboardUrl = 'https://sportsfest.com/admin'
}: AdminPurchaseNotificationEmailProps) => (
  <Html>
    <Head />
    <Preview>
      New {isFullPayment ? 'Purchase' : 'Payment'}: {organizationName} - {formatCurrency(paymentAmount)}
    </Preview>
    <Tailwind>
      <Body className="bg-white my-auto mx-auto font-sans px-2">
        <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
          <Section className="mt-[32px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              💰 New {isFullPayment ? 'Purchase' : 'Payment'} Alert
            </Heading>
          </Section>

          <Text className="text-black text-[14px] leading-[24px]">
            A new {isFullPayment ? 'purchase has been completed' : 'payment has been received'} on {APP_NAME}.
          </Text>

          {/* Customer Info */}
          <Section className="bg-[#f6f9fc] rounded-[4px] p-[20px] my-[32px]">
            <Heading className="text-black text-[18px] font-semibold mt-0 mb-[16px]">
              Customer Information
            </Heading>
            <Text className="text-[14px] text-gray-600 mt-0 mb-[8px]">
              <strong>Customer:</strong> {customerName}
            </Text>
            <Text className="text-[14px] text-gray-600 mt-0 mb-[8px]">
              <strong>Email:</strong> {customerEmail}
            </Text>
            <Text className="text-[14px] text-gray-600 mt-0 mb-[16px]">
              <strong>Organization:</strong> {organizationName}
            </Text>
          </Section>

          {/* Order Details */}
          <Section className="bg-[#fff8dc] rounded-[4px] p-[20px] my-[32px]">
            <Heading className="text-black text-[18px] font-semibold mt-0 mb-[16px]">
              Order Details
            </Heading>
            <Text className="text-[14px] text-gray-600 mt-0 mb-[8px]">
              <strong>Order Number:</strong> {orderNumber}
            </Text>
            <Text className="text-[14px] text-gray-600 mt-0 mb-[16px]">
              <strong>Event:</strong> {eventYear.name} {eventYear.year}
            </Text>

            {/* Order Items */}
            <div className="border-t border-gray-200 pt-[16px]">
              <Text className="text-[14px] font-semibold text-black mb-[8px]">Items Purchased:</Text>
              {orderItems.map((item, index) => (
                <div key={index} className="flex justify-between mb-[4px]">
                  <div className="text-[14px] text-black">
                    {item.name} x {item.quantity}
                  </div>
                  <div className="text-[14px] text-black font-medium">
                    {formatCurrency(item.totalPrice)}
                  </div>
                </div>
              ))}
            </div>

            <Hr className="my-[16px]" />

            {/* Payment Summary */}
            <div className="flex justify-between mb-[8px]">
              <div className="text-[14px] font-semibold text-black">Order Total:</div>
              <div className="text-[14px] font-semibold text-black">{formatCurrency(totalAmount)}</div>
            </div>
            <div className="flex justify-between mb-[8px]">
              <div className="text-[14px] text-green-600 font-semibold">Payment Received:</div>
              <div className="text-[14px] text-green-600 font-bold text-[16px]">{formatCurrency(paymentAmount)}</div>
            </div>
            {remainingBalance > 0 && (
              <div className="flex justify-between">
                <div className="text-[14px] text-orange-600">Outstanding Balance:</div>
                <div className="text-[14px] text-orange-600 font-medium">{formatCurrency(remainingBalance)}</div>
              </div>
            )}
          </Section>

          {isFullPayment ? (
            <Section className="bg-[#d4edda] border border-[#c3e6cb] rounded-[4px] p-[16px] my-[24px]">
              <Text className="text-[14px] text-[#155724] font-medium m-0">
                ✅ This order is now fully paid and confirmed!
              </Text>
            </Section>
          ) : (
            <Section className="bg-[#fff3cd] border border-[#ffeaa7] rounded-[4px] p-[16px] my-[24px]">
              <Text className="text-[14px] text-[#856404] font-medium m-0">
                ⏳ Partial payment received. Outstanding balance: {formatCurrency(remainingBalance)}
              </Text>
            </Section>
          )}

          <Section className="text-center mt-[32px] mb-[32px]">
            <Button
              className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
              href={adminDashboardUrl}
            >
              View in Admin Dashboard
            </Button>
          </Section>

          <Text className="text-black text-[14px] leading-[24px]">
            This notification was sent automatically when a payment was processed.
          </Text>

          <Text className="text-black text-[14px] leading-[24px]">
            - {APP_NAME} System
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default AdminPurchaseNotificationEmail;