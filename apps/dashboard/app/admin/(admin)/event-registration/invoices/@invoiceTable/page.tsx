import * as React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';

import {
  getAllInvoicesSimple,
  getOverdueInvoicesSimple,
  getPartialInvoicesSimple,
  getPaidInvoicesSimple,
  getSentInvoicesSimple,
  getDraftInvoicesSimple
} from '~/actions/admin/get-invoices-simple';
import { InvoiceDataTable } from '~/components/admin/event-registration/invoice-data-table';

export default async function InvoiceTablePage(): Promise<React.JSX.Element> {
  // Fetch all invoice data
  const allInvoices = await getAllInvoicesSimple();

  return (
    <div className="space-y-6">
      <InvoiceDataTable data={allInvoices} status="all" />
    </div>
  );
}
