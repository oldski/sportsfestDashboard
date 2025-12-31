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

export interface SponsorshipInvoiceEmailProps {
  recipientName: string;
  organizationName: string;
  invoiceNumber: string;
  baseAmount: number;
  processingFee: number;
  totalAmount: number;
  description?: string;
  eventYearName: string;
  paymentUrl: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const SponsorshipInvoiceEmail = ({
  recipientName = 'John Doe',
  organizationName = 'Acme Corp',
  invoiceNumber = 'SPO-INV-12345',
  baseAmount = 10000,
  processingFee = 290.30,
  totalAmount = 10290.30,
  description = 'Gold Sponsorship',
  eventYearName = 'SportsFest 2025',
  paymentUrl = 'https://sportsfest.com/pay/12345'
}: SponsorshipInvoiceEmailProps) => (
  <Html>
    <Head />
    <Preview>
      Sponsorship Invoice {invoiceNumber} - {formatCurrency(totalAmount)} for {eventYearName}
    </Preview>
    <Tailwind>
      <Body className="bg-white my-auto mx-auto font-sans px-2">
        <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[500px]">
          <Section className="mt-[32px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Sponsorship Invoice
            </Heading>
          </Section>

          <Text className="text-black text-[14px] leading-[24px]">
            Hi {recipientName},
          </Text>

          <Text className="text-black text-[14px] leading-[24px]">
            You have received a sponsorship invoice for <strong>{organizationName}</strong> for {eventYearName}.
          </Text>

          <Section className="bg-[#f6f9fc] rounded-[8px] p-[24px] my-[24px]">
            <Text className="text-[14px] text-gray-600 m-0 mb-[8px]">
              <strong>Invoice Number:</strong> {invoiceNumber}
            </Text>
            {description && (
              <Text className="text-[14px] text-gray-600 m-0 mb-[16px]">
                <strong>Description:</strong> {description}
              </Text>
            )}

            <Hr className="border-gray-300 my-[16px]" />

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 0', fontSize: '14px', color: '#374151' }}>
                    Sponsorship Amount
                  </td>
                  <td style={{ padding: '8px 0', fontSize: '14px', color: '#374151', textAlign: 'right' }}>
                    {formatCurrency(baseAmount)}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', fontSize: '14px', color: '#6b7280' }}>
                    Processing Fee (2.9% + $0.30)
                  </td>
                  <td style={{ padding: '8px 0', fontSize: '14px', color: '#6b7280', textAlign: 'right' }}>
                    {formatCurrency(processingFee)}
                  </td>
                </tr>
              </tbody>
            </table>

            <Hr className="border-gray-300 my-[16px]" />

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 0', fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>
                    Total Due
                  </td>
                  <td style={{ padding: '8px 0', fontSize: '16px', fontWeight: 'bold', color: '#111827', textAlign: 'right' }}>
                    {formatCurrency(totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section className="text-center mt-[32px] mb-[32px]">
            <Button
              className="bg-[#000000] rounded-[8px] text-white text-[14px] font-semibold no-underline text-center px-[24px] py-[12px]"
              href={paymentUrl}
            >
              Pay Now - {formatCurrency(totalAmount)}
            </Button>
          </Section>

          <Text className="text-gray-500 text-[12px] leading-[20px] text-center">
            Click the button above to complete your payment securely via Stripe.
          </Text>

          <Hr className="border-gray-200 my-[24px]" />

          <Text className="text-black text-[14px] leading-[24px]">
            Thank you for your sponsorship support!
          </Text>

          <Text className="text-black text-[14px] leading-[24px]">
            Best regards,
            <br />
            The {APP_NAME} Team
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default SponsorshipInvoiceEmail;
