import * as React from 'react';
import { PackageIcon } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';

import { EquipmentPurchasesTable } from '~/components/admin/tables/equipment-purchases-table';
import { getEquipmentPurchasesReport } from '~/actions/admin/get-equipment-purchases-report';

export default async function EquipmentPurchasesPage(): Promise<React.JSX.Element> {
  const data = await getEquipmentPurchasesReport();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base flex items-center">
            <PackageIcon className="mr-2 h-4 w-4 text-blue-600" />
            Equipment Purchases
          </CardTitle>
          <CardDescription>
            Water &amp; ice purchases by organization (paid orders)
          </CardDescription>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{data.totalOrganizations}</p>
          <p className="text-xs text-muted-foreground">
            {data.totalWater} water / {data.totalIce} ice
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <EquipmentPurchasesTable data={data.rows} />
      </CardContent>
    </Card>
  );
}
