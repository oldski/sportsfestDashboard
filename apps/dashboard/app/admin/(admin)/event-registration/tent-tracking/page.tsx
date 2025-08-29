import * as React from 'react';
import Link from 'next/link';
import { TentIcon, AlertTriangleIcon, CheckCircleIcon, ExternalLinkIcon } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Progress } from '@workspace/ui/components/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';

// Mock data - will be replaced with real data from database actions
const mockTentPurchases = [
  {
    id: '1',
    organizationId: 'org-1',
    organizationName: 'Acme Corporation',
    eventYear: 2025,
    tentCount: 2,
    maxAllowed: 2,
    purchaseDate: '2025-01-15',
    status: 'confirmed',
    totalAmount: 400.00,
    depositPaid: 150.00,
    balanceOwed: 250.00
  },
  {
    id: '2',
    organizationId: 'org-2',
    organizationName: 'TechStart Innovations',
    eventYear: 2025,
    tentCount: 1,
    maxAllowed: 2,
    purchaseDate: '2025-01-12',
    status: 'confirmed',
    totalAmount: 200.00,
    depositPaid: 75.00,
    balanceOwed: 125.00
  },
  {
    id: '3',
    organizationId: 'org-3',
    organizationName: 'Global Solutions Inc',
    eventYear: 2025,
    tentCount: 2,
    maxAllowed: 2,
    purchaseDate: '2025-01-10',
    status: 'pending_payment',
    totalAmount: 400.00,
    depositPaid: 0,
    balanceOwed: 400.00
  },
  {
    id: '4',
    organizationId: 'org-4',
    organizationName: 'BlueSky Enterprises',
    eventYear: 2025,
    tentCount: 1,
    maxAllowed: 2,
    purchaseDate: '2025-01-08',
    status: 'confirmed',
    totalAmount: 200.00,
    depositPaid: 200.00,
    balanceOwed: 0
  }
];

const mockTentAvailability = {
  totalTents: 36,
  purchasedTents: 18,
  availableTents: 18,
  utilizationRate: 50
};

export default function TentTrackingPage(): React.JSX.Element {
  const organizationsAtLimit = mockTentPurchases.filter(tp => tp.tentCount >= tp.maxAllowed).length;
  const totalRevenue = mockTentPurchases.reduce((sum, tp) => sum + tp.totalAmount, 0);
  const pendingPayments = mockTentPurchases.filter(tp => tp.status === 'pending_payment').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Tent Tracking Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor tent purchases and enforce 2-tent limit per organization
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/event-registration/tent-tracking/report">
            Generate Report
          </Link>
        </Button>
      </div>

      {/* Tent Availability Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TentIcon className="h-5 w-5" />
            <span>Tent Availability Overview</span>
          </CardTitle>
          <CardDescription>
            Current tent inventory and utilization for SportsFest 2025
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Tent Utilization</span>
                <span className="text-sm text-muted-foreground">
                  {mockTentAvailability.purchasedTents}/{mockTentAvailability.totalTents}
                </span>
              </div>
              <Progress value={mockTentAvailability.utilizationRate} className="h-3" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {mockTentAvailability.utilizationRate}% utilized
                </span>
                <span className="text-green-600 font-medium">
                  {mockTentAvailability.availableTents} available
                </span>
              </div>
            </div>
            
            <div className="grid gap-4 grid-cols-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {mockTentAvailability.availableTents}
                </div>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {mockTentAvailability.purchasedTents}
                </div>
                <p className="text-xs text-muted-foreground">Purchased</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <TentIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTentPurchases.length}</div>
            <p className="text-xs text-muted-foreground">
              {mockTentPurchases.reduce((sum, tp) => sum + tp.tentCount, 0)} tents total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Limit</CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{organizationsAtLimit}</div>
            <p className="text-xs text-muted-foreground">
              Organizations at 2-tent limit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{pendingPayments}</div>
            <p className="text-xs text-muted-foreground">
              Require payment processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From tent purchases
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tent Purchase Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Tent Purchase Tracking</CardTitle>
          <CardDescription>
            Monitor individual organization tent purchases and limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Event Year</TableHead>
                  <TableHead>Tents Purchased</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTentPurchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{purchase.organizationName}</span>
                        {purchase.tentCount >= purchase.maxAllowed && (
                          <Badge variant="destructive" className="text-xs">
                            At Limit
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{purchase.eventYear}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{purchase.tentCount}</span>
                        <span className="text-muted-foreground text-sm">
                          / {purchase.maxAllowed} max
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{purchase.purchaseDate}</TableCell>
                    <TableCell>${purchase.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {purchase.balanceOwed > 0 ? (
                          <div>
                            <div className="text-sm">
                              Paid: ${purchase.depositPaid.toFixed(2)}
                            </div>
                            <div className="text-sm text-red-600">
                              Owed: ${purchase.balanceOwed.toFixed(2)}
                            </div>
                          </div>
                        ) : (
                          <Badge variant="default" className="text-xs">
                            Paid in Full
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          purchase.status === 'confirmed' ? 'default' :
                          purchase.status === 'pending_payment' ? 'destructive' : 'secondary'
                        }
                        className="capitalize"
                      >
                        {purchase.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/organizations/${purchase.organizationId}`}>
                          <ExternalLinkIcon className="h-3 w-3" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Tent Limit Enforcement */}
      <Card>
        <CardHeader>
          <CardTitle>Limit Enforcement Status</CardTitle>
          <CardDescription>
            Organizations and their tent purchase limits for current event year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTentPurchases.map((purchase) => (
              <div key={purchase.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <TentIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{purchase.organizationName}</p>
                    <p className="text-sm text-muted-foreground">
                      {purchase.tentCount} of {purchase.maxAllowed} tents purchased
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={(purchase.tentCount / purchase.maxAllowed) * 100} 
                    className="w-20 h-2"
                  />
                  {purchase.tentCount >= purchase.maxAllowed ? (
                    <Badge variant="destructive">At Limit</Badge>
                  ) : (
                    <Badge variant="outline">
                      {purchase.maxAllowed - purchase.tentCount} Available
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}