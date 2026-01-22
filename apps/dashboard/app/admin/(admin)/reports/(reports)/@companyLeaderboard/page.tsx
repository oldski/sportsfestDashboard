import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { TrophyIcon } from 'lucide-react';
import { CompanyLeaderboardTable } from '~/components/admin/tables/company-leaderboard-table';
import { getCompanyLeaderboard } from '~/actions/admin/get-company-leaderboard';

export default async function CompanyLeaderboardPage(): Promise<React.JSX.Element> {
  const leaderboardData = await getCompanyLeaderboard();

  const totalCompanies = leaderboardData.length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base flex items-center">
            <TrophyIcon className="mr-2 h-4 w-4" />
            Company Leaderboard
          </CardTitle>
          <CardDescription>
            Overview of all participating companies
          </CardDescription>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{totalCompanies}</p>
          <p className="text-xs text-muted-foreground">Companies</p>
        </div>
      </CardHeader>
      <CardContent>
        <CompanyLeaderboardTable data={leaderboardData} />
      </CardContent>
    </Card>
  );
}
