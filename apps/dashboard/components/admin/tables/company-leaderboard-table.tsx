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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { StarIcon } from 'lucide-react';

interface CompanyLeaderboardData {
  id: string;
  name: string;
  playerCount: number;
  teamCount: number;
  registrationRevenue: number;
  sponsorshipRevenue: number;
  totalRevenue: number;
  balanceOwed: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid' | 'none';
  isSponsor: boolean;
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
    <TooltipProvider>
      <Table wrapperClassName="max-h-[400px] border rounded-md">
        <TableHeader className="sticky top-0 bg-background z-10 shadow-[0_1px_0_0_hsl(var(--border))]">
          <TableRow className="hover:bg-background">
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>Company</TableHead>
            <TableHead className="text-right">Players</TableHead>
            <TableHead className="text-right">Teams</TableHead>
            <TableHead className="text-right">Registration</TableHead>
            <TableHead className="text-right">Sponsorship</TableHead>
            <TableHead className="text-right">Balance</TableHead>
            <TableHead className="text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
            {data.map((company, index) => (
              <TableRow key={company.id} className={company.isSponsor ? 'bg-amber-400/5' : ''}>
                <TableCell className="font-medium text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell className="font-medium">
                  <span className="flex items-center gap-1.5">
                    {company.name}
                    {company.isSponsor && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <StarIcon className="h-4 w-4 fill-amber-400 text-amber-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Sponsor</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </span>
                </TableCell>
                <TableCell className="text-right">{company.playerCount}</TableCell>
                <TableCell className="text-right">{company.teamCount}</TableCell>
                <TableCell className="text-right">
                  ${company.registrationRevenue.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {company.sponsorshipRevenue > 0 ? (
                    <span>${company.sponsorshipRevenue.toLocaleString()}</span>
                  ) : (
                    <span className="text-muted-foreground">$0</span>
                  )}
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
    </TooltipProvider>
  );
}
