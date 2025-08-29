import * as React from 'react';
import Link from 'next/link';
import { CreditCardIcon, AlertCircleIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';

// Mock data - will be replaced with real data from database actions
const mockPayments = [
  {
    id: '1',
    organizationId: 'org-1',
    organizationName: 'Acme Corporation',
    orderId: 'order-1',
    amount: 150.00,
    paymentType: 'deposit_payment',
    productType: 'tent_rental',
    status: 'completed',
    stripePaymentId: 'pi_1234567890',
    createdAt: '2025-01-15T10:30:00Z',
    completedAt: '2025-01-15T10:31:23Z'
  },
  {
    id: '2',
    organizationId: 'org-2',
    organizationName: 'TechStart Innovations',
    orderId: 'order-2',
    amount: 75.00,
    paymentType: 'deposit_payment',
    productType: 'tent_rental',
    status: 'pending',
    stripePaymentId: null,
    createdAt: '2025-01-14T15:20:00Z',
    completedAt: null
  },
  {
    id: '3',
    organizationId: 'org-1',
    organizationName: 'Acme Corporation',
    orderId: 'order-1',
    amount: 250.00,
    paymentType: 'balance_payment',
    productType: 'tent_rental',
    status: 'pending',
    stripePaymentId: null,
    createdAt: '2025-01-13T09:15:00Z',
    completedAt: null
  },
  {
    id: '4',
    organizationId: 'org-3',
    organizationName: 'Global Solutions Inc',
    orderId: 'order-3',
    amount: 300.00,
    paymentType: 'team_registration',
    productType: 'team_registration',
    status: 'failed',
    stripePaymentId: 'pi_failed_1234',
    createdAt: '2025-01-12T14:45:00Z',
    completedAt: null,
    failureReason: 'insufficient_funds'
  },
  {
    id: '5',
    organizationId: 'org-4',
    organizationName: 'BlueSky Enterprises',
    orderId: 'order-4',
    amount: 200.00,
    paymentType: 'balance_payment',
    productType: 'tent_rental',
    status: 'completed',
    stripePaymentId: 'pi_completed_5678',
    createdAt: '2025-01-11T11:30:00Z',
    completedAt: '2025-01-11T11:31:45Z'
  }
];

export default function PaymentsPage(): React.JSX.Element {
  const completedPayments = mockPayments.filter(p => p.status === 'completed');
  const pendingPayments = mockPayments.filter(p => p.status === 'pending');
  const failedPayments = mockPayments.filter(p => p.status === 'failed');
  
  const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Payment Management</h2>
          <p className="text-muted-foreground">
            Track deposits, balance payments, and Stripe transactions
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/event-registration/payments/sync-stripe">
            Sync with Stripe
          </Link>
        </Button>
      </div>

      {/* Payment Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockPayments.length}</div>
            <p className="text-xs text-muted-foreground">
              All payment transactions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From completed payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${pendingAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {pendingPayments.length} pending payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
            <XCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failedPayments.length}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Breakdown by Type */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Deposit Payments</CardTitle>
            <CardDescription>Initial deposit payments for products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['completed', 'pending', 'failed'].map((status) => {
                const count = mockPayments.filter(p => 
                  p.paymentType === 'deposit_payment' && p.status === status
                ).length;
                const amount = mockPayments
                  .filter(p => p.paymentType === 'deposit_payment' && p.status === status)
                  .reduce((sum, p) => sum + p.amount, 0);
                
                return (
                  <div key={status} className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={
                          status === 'completed' ? 'default' :
                          status === 'pending' ? 'secondary' : 'destructive'
                        }
                        className="text-xs capitalize"
                      >
                        {status}
                      </Badge>
                      <span className="text-sm">{count}</span>
                    </div>
                    <span className="text-sm font-medium">${amount.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Balance Payments</CardTitle>
            <CardDescription>Remaining balance payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['completed', 'pending', 'failed'].map((status) => {
                const count = mockPayments.filter(p => 
                  p.paymentType === 'balance_payment' && p.status === status
                ).length;
                const amount = mockPayments
                  .filter(p => p.paymentType === 'balance_payment' && p.status === status)
                  .reduce((sum, p) => sum + p.amount, 0);
                
                return (
                  <div key={status} className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={
                          status === 'completed' ? 'default' :
                          status === 'pending' ? 'secondary' : 'destructive'
                        }
                        className="text-xs capitalize"
                      >
                        {status}
                      </Badge>
                      <span className="text-sm">{count}</span>
                    </div>
                    <span className="text-sm font-medium">${amount.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Full Payments</CardTitle>
            <CardDescription>Direct full payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['completed', 'pending', 'failed'].map((status) => {
                const count = mockPayments.filter(p => 
                  p.paymentType === 'team_registration' && p.status === status
                ).length;
                const amount = mockPayments
                  .filter(p => p.paymentType === 'team_registration' && p.status === status)
                  .reduce((sum, p) => sum + p.amount, 0);
                
                return (
                  <div key={status} className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={
                          status === 'completed' ? 'default' :
                          status === 'pending' ? 'secondary' : 'destructive'
                        }
                        className="text-xs capitalize"
                      >
                        {status}
                      </Badge>
                      <span className="text-sm">{count}</span>
                    </div>
                    <span className="text-sm font-medium">${amount.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Transaction List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Payments</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Payment Transactions</CardTitle>
              <CardDescription>
                Complete history of payment transactions across all organizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentTable payments={mockPayments} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payments</CardTitle>
              <CardDescription>
                Payments awaiting processing or customer action
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentTable payments={pendingPayments} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failed">
          <Card>
            <CardHeader>
              <CardTitle>Failed Payments</CardTitle>
              <CardDescription>
                Payments that failed processing and require attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentTable payments={failedPayments} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Payments</CardTitle>
              <CardDescription>
                Successfully processed payment transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentTable payments={completedPayments} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PaymentTable({ payments }: { payments: typeof mockPayments }): React.JSX.Element {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Organization</TableHead>
            <TableHead>Payment Type</TableHead>
            <TableHead>Product Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Stripe ID</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Completed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>
                <Link 
                  href={`/admin/organizations/${payment.organizationId}`}
                  className="font-medium hover:underline"
                >
                  {payment.organizationName}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs capitalize">
                  {payment.paymentType.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-xs capitalize">
                  {payment.productType.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">
                ${payment.amount.toFixed(2)}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  {payment.status === 'completed' && (
                    <CheckCircleIcon className="h-3 w-3 text-green-500" />
                  )}
                  {payment.status === 'pending' && (
                    <ClockIcon className="h-3 w-3 text-orange-500" />
                  )}
                  {payment.status === 'failed' && (
                    <XCircleIcon className="h-3 w-3 text-red-500" />
                  )}
                  <Badge 
                    variant={
                      payment.status === 'completed' ? 'default' :
                      payment.status === 'pending' ? 'secondary' : 'destructive'
                    }
                    className="text-xs capitalize"
                  >
                    {payment.status}
                  </Badge>
                </div>
                {payment.status === 'failed' && payment.failureReason && (
                  <div className="text-xs text-red-600 mt-1">
                    {payment.failureReason.replace('_', ' ')}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="text-xs font-mono">
                  {payment.stripePaymentId || 'N/A'}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-xs text-muted-foreground">
                  {new Date(payment.createdAt).toLocaleDateString()}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-xs text-muted-foreground">
                  {payment.completedAt ? new Date(payment.completedAt).toLocaleDateString() : 'N/A'}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}