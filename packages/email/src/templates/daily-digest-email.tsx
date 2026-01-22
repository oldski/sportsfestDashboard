import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column
} from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';

type NewSignUp = {
  name: string | null;
  email: string | null;
  createdAt: Date;
};

type NewOrganization = {
  name: string;
  slug: string;
  ownerName: string | null;
  ownerEmail: string | null;
  createdAt: Date;
};

type OrderSummary = {
  orderNumber: string;
  organizationName: string;
  status: string;
  totalAmount: number;
};

type OrdersByStatus = {
  status: string;
  count: number;
  totalAmount: number;
  orders: OrderSummary[];
};

export type DailyDigestEmailProps = {
  periodStart: Date;
  periodEnd: Date;
  newSignUps: {
    count: number;
    users: NewSignUp[];
  };
  newOrganizations: {
    count: number;
    organizations: NewOrganization[];
  };
  orders: {
    totalCount: number;
    totalRevenue: number;
    byStatus: OrdersByStatus[];
  };
  dashboardUrl: string;
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pending',
    payment_processing: 'Payment Processing',
    confirmed: 'Confirmed',
    deposit_paid: 'Deposit Paid',
    fully_paid: 'Fully Paid',
    cancelled: 'Cancelled',
    refunded: 'Refunded'
  };
  return labels[status] || status;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: '#f59e0b',
    payment_processing: '#f59e0b',
    confirmed: '#10b981',
    deposit_paid: '#3b82f6',
    fully_paid: '#10b981',
    cancelled: '#ef4444',
    refunded: '#6b7280'
  };
  return colors[status] || '#6b7280';
}

export function DailyDigestEmail({
  periodStart,
  periodEnd,
  newSignUps,
  newOrganizations,
  orders,
  dashboardUrl
}: DailyDigestEmailProps): React.JSX.Element {
  const hasActivity = newSignUps.count > 0 || newOrganizations.count > 0 || orders.totalCount > 0;
  const needsAttention = orders.byStatus.some(
    (s) => (s.status === 'pending' || s.status === 'payment_processing') && s.count > 0
  );

  return (
    <Html>
      <Head />
      <Preview>
        {`SportsFest Daily Digest - ${newSignUps.count} sign-ups, ${newOrganizations.count} new orgs, ${orders.totalCount} orders`}
      </Preview>
      <Tailwind>
        <Body className="m-auto bg-[#f6f9fc] px-2 py-8 font-sans">
          <Container className="mx-auto max-w-[600px]">
            {/* Header */}
            <Section className="rounded-t-lg bg-[#1a1a2e] px-8 py-6 text-center">
              <Heading className="m-0 text-2xl font-bold text-white">
                SportsFest Daily Digest
              </Heading>
              <Text className="m-0 mt-2 text-sm text-gray-300">
                {formatDate(periodStart)} - {formatDate(periodEnd)}
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="rounded-b-lg bg-white px-8 py-6">
              {needsAttention && (
                <Section className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <Text className="m-0 font-semibold text-amber-800">
                    Attention Required
                  </Text>
                  <Text className="m-0 mt-1 text-sm text-amber-700">
                    There are orders pending or processing payment that may need review.
                  </Text>
                </Section>
              )}

              {!hasActivity ? (
                <Text className="text-center text-gray-500">
                  No activity in the last 24 hours.
                </Text>
              ) : (
                <>
                  {/* Summary Cards */}
                  <Section className="mb-6">
                    <Row>
                      <Column className="w-1/3 pr-2">
                        <Section className="rounded-lg bg-blue-50 p-4 text-center">
                          <Text className="m-0 text-3xl font-bold text-blue-600">
                            {newSignUps.count}
                          </Text>
                          <Text className="m-0 text-xs text-blue-800">
                            New Sign-ups
                          </Text>
                        </Section>
                      </Column>
                      <Column className="w-1/3 px-1">
                        <Section className="rounded-lg bg-green-50 p-4 text-center">
                          <Text className="m-0 text-3xl font-bold text-green-600">
                            {newOrganizations.count}
                          </Text>
                          <Text className="m-0 text-xs text-green-800">
                            New Organizations
                          </Text>
                        </Section>
                      </Column>
                      <Column className="w-1/3 pl-2">
                        <Section className="rounded-lg bg-purple-50 p-4 text-center">
                          <Text className="m-0 text-3xl font-bold text-purple-600">
                            {formatCurrency(orders.totalRevenue)}
                          </Text>
                          <Text className="m-0 text-xs text-purple-800">
                            Revenue ({orders.totalCount} orders)
                          </Text>
                        </Section>
                      </Column>
                    </Row>
                  </Section>

                  {/* New Sign-ups */}
                  {newSignUps.count > 0 && (
                    <Section className="mb-6">
                      <Heading className="m-0 mb-3 text-lg font-semibold text-gray-800">
                        New Sign-ups ({newSignUps.count})
                      </Heading>
                      <Section className="rounded-lg border border-gray-200">
                        {newSignUps.users.slice(0, 10).map((user, index) => (
                          <Section
                            key={index}
                            className={`px-4 py-3 ${index !== newSignUps.users.length - 1 && index !== 9 ? 'border-b border-gray-100' : ''}`}
                          >
                            <Text className="m-0 text-sm font-medium text-gray-800">
                              {user.name || 'No name provided'}
                            </Text>
                            <Text className="m-0 text-xs text-gray-500">
                              {user.email}
                            </Text>
                          </Section>
                        ))}
                        {newSignUps.count > 10 && (
                          <Section className="bg-gray-50 px-4 py-2 text-center">
                            <Text className="m-0 text-xs text-gray-500">
                              +{newSignUps.count - 10} more sign-ups
                            </Text>
                          </Section>
                        )}
                      </Section>
                    </Section>
                  )}

                  {/* New Organizations */}
                  {newOrganizations.count > 0 && (
                    <Section className="mb-6">
                      <Heading className="m-0 mb-3 text-lg font-semibold text-gray-800">
                        New Organizations ({newOrganizations.count})
                      </Heading>
                      <Section className="rounded-lg border border-gray-200">
                        {newOrganizations.organizations.slice(0, 10).map((org, index) => (
                          <Section
                            key={index}
                            className={`px-4 py-3 ${index !== newOrganizations.organizations.length - 1 && index !== 9 ? 'border-b border-gray-100' : ''}`}
                          >
                            <Text className="m-0 text-sm font-medium text-gray-800">
                              {org.name}
                            </Text>
                            <Text className="m-0 text-xs text-gray-500">
                              Owner: {org.ownerName || 'Unknown'} ({org.ownerEmail || 'No email'})
                            </Text>
                          </Section>
                        ))}
                        {newOrganizations.count > 10 && (
                          <Section className="bg-gray-50 px-4 py-2 text-center">
                            <Text className="m-0 text-xs text-gray-500">
                              +{newOrganizations.count - 10} more organizations
                            </Text>
                          </Section>
                        )}
                      </Section>
                    </Section>
                  )}

                  {/* Orders by Status */}
                  {orders.totalCount > 0 && (
                    <Section className="mb-6">
                      <Heading className="m-0 mb-3 text-lg font-semibold text-gray-800">
                        Orders by Status
                      </Heading>
                      {orders.byStatus
                        .filter((s) => s.count > 0)
                        .map((statusGroup, index) => (
                          <Section
                            key={index}
                            className="mb-3 rounded-lg border border-gray-200"
                          >
                            <Section
                              className="flex items-center justify-between px-4 py-3"
                              style={{ borderLeft: `4px solid ${getStatusColor(statusGroup.status)}` }}
                            >
                              <Text className="m-0 text-sm font-semibold text-gray-800">
                                {getStatusLabel(statusGroup.status)} ({statusGroup.count})
                              </Text>
                              <Text className="m-0 text-sm font-medium text-gray-600">
                                {formatCurrency(statusGroup.totalAmount)}
                              </Text>
                            </Section>
                            {statusGroup.orders.slice(0, 5).map((order, orderIndex) => (
                              <Section
                                key={orderIndex}
                                className={`px-4 py-2 ${orderIndex !== statusGroup.orders.length - 1 && orderIndex !== 4 ? 'border-b border-gray-100' : ''}`}
                              >
                                <Text className="m-0 text-xs text-gray-600">
                                  #{order.orderNumber} - {order.organizationName} - {formatCurrency(order.totalAmount)}
                                </Text>
                              </Section>
                            ))}
                            {statusGroup.orders.length > 5 && (
                              <Section className="bg-gray-50 px-4 py-2 text-center">
                                <Text className="m-0 text-xs text-gray-500">
                                  +{statusGroup.orders.length - 5} more orders
                                </Text>
                              </Section>
                            )}
                          </Section>
                        ))}
                    </Section>
                  )}
                </>
              )}

              <Hr className="my-6 border-gray-200" />

              {/* CTA */}
              <Section className="text-center">
                <Link
                  href={dashboardUrl}
                  className="inline-block rounded-md bg-[#1a1a2e] px-6 py-3 text-sm font-semibold text-white no-underline"
                >
                  View Admin Dashboard
                </Link>
              </Section>
            </Section>

            {/* Footer */}
            <Section className="mt-6 text-center">
              <Text className="m-0 text-xs text-gray-500">
                This is an automated daily digest from SportsFest.
              </Text>
              <Text className="m-0 text-xs text-gray-500">
                You're receiving this because you're an admin.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
