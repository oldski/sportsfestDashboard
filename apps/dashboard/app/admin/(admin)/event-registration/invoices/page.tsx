import * as React from 'react';
import Link from 'next/link';
import { FileTextIcon, DownloadIcon, SendIcon, AlertCircleIcon, CheckCircleIcon } from 'lucide-react';

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
const mockInvoices = [
  {
    id: '1',
    invoiceNumber: 'INV-2025-001',
    organizationId: 'org-1',
    organizationName: 'Acme Corporation',
    orderId: 'order-1',
    eventYear: 2025,
    totalAmount: 400.00,
    paidAmount: 150.00,
    balanceOwed: 250.00,
    status: 'partial',
    dueDate: '2025-02-15',
    createdAt: '2025-01-15T10:30:00Z',
    paidAt: null,
    items: [
      { description: '10x10 Event Tent (x2)', unitPrice: 200.00, quantity: 2, total: 400.00 }
    ]
  },
  {
    id: '2',
    invoiceNumber: 'INV-2025-002',
    organizationId: 'org-2',
    organizationName: 'TechStart Innovations',
    orderId: 'order-2',
    eventYear: 2025,
    totalAmount: 200.00,
    paidAmount: 75.00,
    balanceOwed: 125.00,
    status: 'partial',
    dueDate: '2025-02-10',
    createdAt: '2025-01-12T15:20:00Z',
    paidAt: null,
    items: [
      { description: '10x10 Event Tent', unitPrice: 200.00, quantity: 1, total: 200.00 }
    ]
  },
  {
    id: '3',
    invoiceNumber: 'INV-2025-003',
    organizationId: 'org-3',
    organizationName: 'Global Solutions Inc',
    orderId: 'order-3',
    eventYear: 2025,
    totalAmount: 450.00,
    paidAmount: 0,
    balanceOwed: 450.00,
    status: 'overdue',
    dueDate: '2025-01-30',
    createdAt: '2025-01-10T09:15:00Z',
    paidAt: null,
    items: [
      { description: 'SportsFest Team Registration', unitPrice: 150.00, quantity: 1, total: 150.00 },
      { description: 'Team Lunch Package (x20)', unitPrice: 15.00, quantity: 20, total: 300.00 }
    ]
  },
  {
    id: '4',
    invoiceNumber: 'INV-2025-004',
    organizationId: 'org-4',
    organizationName: 'BlueSky Enterprises',
    orderId: 'order-4',
    eventYear: 2025,
    totalAmount: 200.00,
    paidAmount: 200.00,
    balanceOwed: 0,
    status: 'paid',
    dueDate: '2025-02-05',
    createdAt: '2025-01-08T11:30:00Z',
    paidAt: '2025-01-11T11:31:45Z',
    items: [
      { description: '10x10 Event Tent', unitPrice: 200.00, quantity: 1, total: 200.00 }
    ]
  }
];

export default function InvoicesPage(): React.JSX.Element {
  const paidInvoices = mockInvoices.filter(inv => inv.status === 'paid');
  const partialInvoices = mockInvoices.filter(inv => inv.status === 'partial');
  const overdueInvoices = mockInvoices.filter(inv => inv.status === 'overdue');
  
  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const outstandingAmount = mockInvoices
    .filter(inv => inv.status !== 'paid')
    .reduce((sum, inv) => sum + inv.balanceOwed, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Invoice Management</h2>
          <p className="text-muted-foreground">
            Generate and manage organization invoices and PDF exports
          </p>
        </div>
        <div className="flex space-x-2">
          <Button asChild variant="outline">
            <Link href="/admin/event-registration/invoices/bulk-actions">
              Bulk Actions
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/event-registration/invoices/create">
              Create Invoice
            </Link>
          </Button>
        </div>
      </div>

      {/* Invoice Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockInvoices.length}</div>
            <p className="text-xs text-muted-foreground">
              All time invoices
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${outstandingAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockInvoices.filter(inv => inv.status !== 'paid').length} unpaid invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueInvoices.length}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Revenue</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From paid invoices
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Status Breakdown */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
              <span>Paid Invoices</span>
            </CardTitle>
            <CardDescription>Fully paid and completed invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Count</span>
                <span className="text-lg font-bold text-green-600">{paidInvoices.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Value</span>
                <span className="text-sm font-medium">${totalRevenue.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <AlertCircleIcon className="h-4 w-4 text-orange-500" />
              <span>Partial Payments</span>
            </CardTitle>
            <CardDescription>Invoices with partial payments made</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Count</span>
                <span className="text-lg font-bold text-orange-600">{partialInvoices.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Balance Owed</span>
                <span className="text-sm font-medium">
                  ${partialInvoices.reduce((sum, inv) => sum + inv.balanceOwed, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <AlertCircleIcon className="h-4 w-4 text-red-500" />
              <span>Overdue Invoices</span>
            </CardTitle>
            <CardDescription>Past due date and require action</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Count</span>
                <span className="text-lg font-bold text-red-600">{overdueInvoices.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Amount Overdue</span>
                <span className="text-sm font-medium">
                  ${overdueInvoices.reduce((sum, inv) => sum + inv.balanceOwed, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Management Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Invoices</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="partial">Partial Payments</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Invoices</CardTitle>
              <CardDescription>
                Complete invoice history across all organizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceTable invoices={mockInvoices} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue">
          <Card>
            <CardHeader>
              <CardTitle>Overdue Invoices</CardTitle>
              <CardDescription>
                Invoices past their due date requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceTable invoices={overdueInvoices} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partial">
          <Card>
            <CardHeader>
              <CardTitle>Partial Payment Invoices</CardTitle>
              <CardDescription>
                Invoices with deposits paid but balance remaining
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceTable invoices={partialInvoices} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paid">
          <Card>
            <CardHeader>
              <CardTitle>Paid Invoices</CardTitle>
              <CardDescription>
                Successfully completed and paid invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceTable invoices={paidInvoices} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InvoiceTable({ invoices }: { invoices: typeof mockInvoices }): React.JSX.Element {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Paid Amount</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-mono text-sm">
                {invoice.invoiceNumber}
              </TableCell>
              <TableCell>
                <Link 
                  href={`/admin/organizations/${invoice.organizationId}`}
                  className="font-medium hover:underline"
                >
                  {invoice.organizationName}
                </Link>
              </TableCell>
              <TableCell className="font-medium">
                ${invoice.totalAmount.toFixed(2)}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <span className={invoice.paidAmount > 0 ? "text-green-600" : "text-muted-foreground"}>
                    ${invoice.paidAmount.toFixed(2)}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className={
                  invoice.balanceOwed > 0 
                    ? invoice.status === 'overdue' 
                      ? "text-red-600 font-medium" 
                      : "text-orange-600 font-medium"
                    : "text-muted-foreground"
                }>
                  ${invoice.balanceOwed.toFixed(2)}
                </span>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {invoice.dueDate}
                  {invoice.status === 'overdue' && (
                    <div className="text-xs text-red-600 font-medium">
                      Overdue
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={
                    invoice.status === 'paid' ? 'default' :
                    invoice.status === 'partial' ? 'secondary' : 'destructive'
                  }
                  className="capitalize"
                >
                  {invoice.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/event-registration/invoices/${invoice.id}`}>
                      View
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm">
                    <DownloadIcon className="h-3 w-3" />
                  </Button>
                  {invoice.status !== 'paid' && (
                    <Button variant="ghost" size="sm">
                      <SendIcon className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}