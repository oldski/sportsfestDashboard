import * as React from 'react';
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import { Button } from "@workspace/ui/components/button";
import { CreditCardIcon } from "lucide-react";
import Link from 'next/link';
import { getOrganizationRegistrationStats } from '~/data/organization/get-organization-registration-stats';

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Get badge variant and text for registration status
const getStatusDisplay = (status: string) => {
  switch (status) {
    case 'not_started':
      return { variant: 'outline' as const, text: 'Not Started' };
    case 'in_progress':
      return { variant: 'secondary' as const, text: 'In Progress' };
    case 'partial_payment':
      return { variant: 'secondary' as const, text: 'Partial Payment' };
    case 'completed':
      return { variant: 'default' as const, text: 'Completed' };
    default:
      return { variant: 'outline' as const, text: 'Unknown' };
  }
};

export default async function SnapshotPage(): Promise<React.JSX.Element> {
  const stats = await getOrganizationRegistrationStats();
  const statusDisplay = getStatusDisplay(stats.registrationStatus);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
          <p className="text-2xl font-bold">{stats.totalOrders}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Teams Purchased</p>
          <p className="text-2xl font-bold">{stats.totalTeams}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Tents Purchased</p>
          <p className="text-2xl font-bold">{stats.totalTents}</p>
        </div>
      </div>

      {stats.balanceOwed > 0 && stats.orderWithBalance && (
        <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                Balance Remaining: {formatCurrency(stats.balanceOwed)}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">
                Complete your payment for order {stats.orderWithBalance.orderNumber}
              </p>
            </div>
            <Link href={`./registration/orders?openOrder=${stats.orderWithBalance.id}`}>
              <Button variant="default" size="sm" className="flex items-center space-x-2">
                <CreditCardIcon className="h-4 w-4" />
                <span>Pay Balance</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
