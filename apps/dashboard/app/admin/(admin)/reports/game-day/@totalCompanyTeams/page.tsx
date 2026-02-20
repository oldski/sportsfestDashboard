import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { UsersIcon } from 'lucide-react';
import { CompanyTeamsReportTable } from '~/components/admin/tables/company-teams-report-table';
import { getCompanyTeamsReport } from '~/actions/admin/get-company-teams-report';

export default async function TotalCompanyTeamsPage(): Promise<React.JSX.Element> {
  const report = await getCompanyTeamsReport();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base flex items-center">
            <UsersIcon className="mr-2 h-4 w-4" />
            Company Teams
          </CardTitle>
          <CardDescription>
            All registered company teams for the current event year
          </CardDescription>
        </div>
        <div className="text-right flex items-center gap-4">
          <div>
            <p className="text-2xl font-bold">{report.totalTeams}</p>
            <p className="text-xs text-muted-foreground">Total Teams</p>
          </div>
          <div className="border-l pl-4">
            <p className="text-lg font-semibold text-green-600">{report.totalFullyPaid}</p>
            <p className="text-xs text-muted-foreground">Fully Paid</p>
          </div>
          <div className="border-l pl-4">
            <p className="text-lg font-semibold text-amber-600">{report.totalDepositPaid}</p>
            <p className="text-xs text-muted-foreground">Deposit Paid</p>
          </div>
          <div className="border-l pl-4">
            <p className="text-lg font-semibold text-red-600">{report.totalUnpaid}</p>
            <p className="text-xs text-muted-foreground">Unpaid</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CompanyTeamsReportTable data={report.rows} />
      </CardContent>
    </Card>
  );
}
