'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { Badge } from '@workspace/ui/components/badge';

interface CompanyLeaderboardData {
  id: string;
  name: string;
  playerCount: number;
  teamCount: number;
  totalRevenue: number;
  balanceOwed: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid' | 'none';
}

interface CompanyLeaderboardTableProps {
  data: CompanyLeaderboardData[];
}

const STATUS_BADGE_VARIANTS: Record<CompanyLeaderboardData['paymentStatus'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
  paid: 'default',
  partial: 'secondary',
  unpaid: 'destructive',
  none: 'outline',
};

const STATUS_LABELS: Record<CompanyLeaderboardData['paymentStatus'], string> = {
  paid: 'Paid',
  partial: 'Partial',
  unpaid: 'Unpaid',
  none: 'No Orders',
};

export function CompanyLeaderboardTable({ data }: CompanyLeaderboardTableProps): React.JSX.Element {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        No company data available
      </div>
    );
  }

  return (
    <div className="relative overflow-auto max-h-[400px] border rounded-md">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>Company</TableHead>
            <TableHead className="text-right">Players</TableHead>
            <TableHead className="text-right">Teams</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="text-right">Balance</TableHead>
            <TableHead className="text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((company, index) => (
            <TableRow key={company.id}>
              <TableCell className="font-medium text-muted-foreground">
                {index + 1}
              </TableCell>
              <TableCell className="font-medium">{company.name}</TableCell>
              <TableCell className="text-right">{company.playerCount}</TableCell>
              <TableCell className="text-right">{company.teamCount}</TableCell>
              <TableCell className="text-right">
                ${company.totalRevenue.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                {company.balanceOwed > 0 ? (
                  <span className="text-amber-600">
                    ${company.balanceOwed.toLocaleString()}
                  </span>
                ) : (
                  <span className="text-muted-foreground">$0</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={STATUS_BADGE_VARIANTS[company.paymentStatus]}>
                  {STATUS_LABELS[company.paymentStatus]}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
