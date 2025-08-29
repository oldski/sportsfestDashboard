'use client';

import * as React from 'react';
import Link from 'next/link';
import { 
  ShoppingCartIcon, 
  CreditCardIcon, 
  FileTextIcon, 
  CalendarIcon,
  PackageIcon,
  ArrowRightIcon,
  TrendingUpIcon,
  DollarSignIcon,
  ClockIcon
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Progress } from '@workspace/ui/components/progress';

import { replaceOrgSlug, routes } from '@workspace/routes';
import { useActiveOrganization } from '~/hooks/use-active-organization';

// Mock data - will be replaced with real data from database actions
const mockOrganization = {
  id: 'org-1',
  name: 'Acme Corporation',
  slug: 'acme-corp',
  currentEventYear: 2025
};

const mockAvailableProducts = [
  {
    id: '1',
    name: 'SportsFest Team Registration',
    description: 'Register your team for SportsFest 2025',
    category: 'Registration',
    fullAmount: 150.00,
    depositAmount: 50.00,
    requiresDeposit: true,
    maxQuantity: null,
    inCart: 0
  },
  {
    id: '2',
    name: '10x10 Event Tent',
    description: 'Reserve a tent space at the event venue',
    category: 'Equipment',
    fullAmount: 200.00,
    depositAmount: 75.00,
    requiresDeposit: true,
    maxQuantity: 2,
    inCart: 1,
    remainingAllowed: 1
  },
  {
    id: '3',
    name: 'SportsFest T-Shirt',
    description: 'Official SportsFest branded t-shirts',
    category: 'Merchandise',
    fullAmount: 25.00,
    depositAmount: 0,
    requiresDeposit: false,
    maxQuantity: 50,
    inCart: 15
  },
  {
    id: '4',
    name: 'Team Lunch Package',
    description: 'Catered lunch for your team members',
    category: 'Food & Beverage',
    fullAmount: 15.00,
    depositAmount: 5.00,
    requiresDeposit: true,
    maxQuantity: 100,
    inCart: 20
  }
];

const mockCurrentOrders = [
  {
    id: '1',
    orderNumber: 'ORD-2025-001',
    eventYear: 2025,
    totalAmount: 1275.00,
    paidAmount: 425.00,
    balanceOwed: 850.00,
    status: 'partial_payment',
    createdAt: '2025-01-15',
    items: [
      { name: '10x10 Event Tent', quantity: 1, unitPrice: 200.00, total: 200.00 },
      { name: 'SportsFest T-Shirt', quantity: 15, unitPrice: 25.00, total: 375.00 },
      { name: 'Team Lunch Package', quantity: 20, unitPrice: 15.00, total: 300.00 },
      { name: 'SportsFest Team Registration', quantity: 1, unitPrice: 150.00, total: 150.00 },
      { name: 'Equipment Setup Fee', quantity: 1, unitPrice: 250.00, total: 250.00 }
    ]
  }
];

const mockInvoices = [
  {
    id: '1',
    invoiceNumber: 'INV-2025-001',
    orderId: '1',
    totalAmount: 1275.00,
    paidAmount: 425.00,
    balanceOwed: 850.00,
    status: 'partial',
    dueDate: '2025-02-15',
    createdAt: '2025-01-15'
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-008',
    orderId: '2',
    totalAmount: 950.00,
    paidAmount: 950.00,
    balanceOwed: 0,
    status: 'paid',
    dueDate: '2024-06-01',
    createdAt: '2024-05-15'
  }
];

export default function OrganizationRegistrationPage(): React.JSX.Element {
  // This will be replaced with actual data from database actions
  const activeOrganization = useActiveOrganization();
  const currentOrder = mockCurrentOrders[0];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Event Registration</h1>
          <p className="text-muted-foreground">
            Overview of your SportsFest {mockOrganization.currentEventYear} registration
          </p>
        </div>
      </div>

      {/* Registration Status Banner */}
      <Card className="border-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <CardTitle className="text-primary">SportsFest 2025 Registration</CardTitle>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Registration closes: May 30, 2025
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold">3</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Amount Paid</p>
              <p className="text-2xl font-bold text-green-600">$1,375.00</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Balance Owed</p>
              <p className="text-2xl font-bold text-orange-600">$850.00</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Registration Status</p>
              <Badge variant="secondary" className="mt-1">Partial Payment</Badge>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Registration Progress</span>
              <span>62% Complete</span>
            </div>
            <Progress value={62} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingCartIcon className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Shop Products</CardTitle>
              </div>
              <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Browse and purchase SportsFest products and services
            </CardDescription>
            <Button asChild className="w-full">
              <Link href={replaceOrgSlug(routes.dashboard.organizations.slug.registration.Shop, activeOrganization.slug)}>
                Browse Products
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <PackageIcon className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">View Orders</CardTitle>
              </div>
              <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Track your registration orders and payments
            </CardDescription>
            <Button asChild variant="outline" className="w-full">
              <Link href={replaceOrgSlug(routes.dashboard.organizations.slug.registration.Orders, activeOrganization.slug)}>
                View Orders
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileTextIcon className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">Invoices</CardTitle>
              </div>
              <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              View and manage your payment invoices
            </CardDescription>
            <Button asChild variant="outline" className="w-full">
              <Link href={replaceOrgSlug(routes.dashboard.organizations.slug.registration.Invoices, activeOrganization.slug)}>
                View Invoices
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ClockIcon className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <DollarSignIcon className="h-4 w-4 text-green-600" />
                <div>
                  <p className="font-medium">Payment Received</p>
                  <p className="text-sm text-muted-foreground">Invoice #INV-2025-001 - $425.00</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">2 hours ago</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <PackageIcon className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="font-medium">Order Created</p>
                  <p className="text-sm text-muted-foreground">Order #ORD-2025-001 - $1,275.00</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">1 day ago</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <TrendingUpIcon className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="font-medium">Registration Started</p>
                  <p className="text-sm text-muted-foreground">Welcome to SportsFest 2025!</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">3 days ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}