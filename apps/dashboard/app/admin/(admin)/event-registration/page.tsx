import * as React from 'react';
import Link from 'next/link';
import {
  PackageIcon,
  CalendarIcon,
  TentIcon,
  CreditCardIcon,
  FileTextIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  CheckCircleIcon
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';

export default function EventRegistrationPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +3 added this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tent Purchases</CardTitle>
            <TentIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18/36</div>
            <p className="text-xs text-muted-foreground">
              50% utilization rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$8,750</div>
            <p className="text-xs text-muted-foreground">
              5 deposits awaiting balance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$32,400</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Management Sections */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link href="/admin/event-registration/products" className="block">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <PackageIcon className="h-5 w-5 text-primary" />
                <CardTitle>Product Management</CardTitle>
              </div>
              <CardDescription>
                Manage product catalog, categories, pricing, and deposit settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Active Products</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Categories</span>
                  <span className="font-medium">4</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Requires Deposits</span>
                  <span className="font-medium">8</span>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link href="/admin/event-registration/event-years" className="block">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                <CardTitle>Event Years</CardTitle>
              </div>
              <CardDescription>
                Manage SportsFest event years and associated products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current Event Year</span>
                  <span className="font-medium">2025</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Events</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Active Registrations</span>
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link href="/admin/event-registration/tent-tracking" className="block">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <TentIcon className="h-5 w-5 text-primary" />
                <CardTitle>Tent Tracking</CardTitle>
              </div>
              <CardDescription>
                Monitor tent purchases and enforce 2-tent limit per organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tents Purchased</span>
                  <span className="font-medium">18/36</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Organizations at Limit</span>
                  <span className="font-medium">9</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Available Tents</span>
                  <span className="font-medium text-green-600">18</span>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link href="/admin/event-registration/payments" className="block">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CreditCardIcon className="h-5 w-5 text-primary" />
                <CardTitle>Payment Management</CardTitle>
              </div>
              <CardDescription>
                Track deposits, balance payments, and Stripe transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Pending Deposits</span>
                  <span className="font-medium text-orange-600">5</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Completed Payments</span>
                  <span className="font-medium text-green-600">42</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Failed Transactions</span>
                  <span className="font-medium text-red-600">2</span>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link href="/admin/event-registration/invoices" className="block">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <FileTextIcon className="h-5 w-5 text-primary" />
                <CardTitle>Invoice Management</CardTitle>
              </div>
              <CardDescription>
                Generate and manage organization invoices and PDF exports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Outstanding Invoices</span>
                  <span className="font-medium text-orange-600">7</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Paid This Month</span>
                  <span className="font-medium">23</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Overdue</span>
                  <span className="font-medium text-red-600">3</span>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangleIcon className="h-5 w-5 text-orange-500" />
              <CardTitle>System Alerts</CardTitle>
            </div>
            <CardDescription>
              Important notifications and system status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-2" />
                <div className="text-sm">
                  <p className="font-medium">Payment Sync Issue</p>
                  <p className="text-muted-foreground text-xs">2 Stripe webhooks failed</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                <div className="text-sm">
                  <p className="font-medium">New Event Year</p>
                  <p className="text-muted-foreground text-xs">Setup 2026 products</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks for event registration management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/event-registration/products/create">
                Create Product
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/event-registration/event-years">
                Manage Event Years
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/event-registration/payments/pending">
                Review Pending Payments
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/event-registration/invoices/overdue">
                Process Overdue Invoices
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/event-registration/tent-tracking/report">
                Generate Tent Report
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
