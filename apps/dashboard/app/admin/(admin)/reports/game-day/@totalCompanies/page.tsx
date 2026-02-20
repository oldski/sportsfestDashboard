import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { BuildingIcon } from 'lucide-react';
import { CompaniesWithUsersTable } from '~/components/admin/tables/companies-with-users-table';
import { getCompaniesWithUsers } from '~/actions/admin/get-companies-with-users';

export default async function TotalCompaniesPage(): Promise<React.JSX.Element> {
  const companies = await getCompaniesWithUsers();

  const totalCompanies = companies.length;
  const totalMembers = companies.reduce((sum, c) => sum + c.memberCount, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base flex items-center">
            <BuildingIcon className="mr-2 h-4 w-4" />
            Total Companies & Users
          </CardTitle>
          <CardDescription>
            All registered companies with their team members
          </CardDescription>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{totalCompanies}</p>
          <p className="text-xs text-muted-foreground">{totalMembers} total members</p>
        </div>
      </CardHeader>
      <CardContent>
        <CompaniesWithUsersTable data={companies} />
      </CardContent>
    </Card>
  );
}
