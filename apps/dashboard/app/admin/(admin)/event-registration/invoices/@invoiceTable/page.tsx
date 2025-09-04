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
  const [
    allInvoices,
    overdueInvoices,
    partialInvoices,
    paidInvoices,
    sentInvoices,
    draftInvoices
  ] = await Promise.all([
    getAllInvoicesSimple(),
    getOverdueInvoicesSimple(),
    getPartialInvoicesSimple(),
    getPaidInvoicesSimple(),
    getSentInvoicesSimple(),
    getDraftInvoicesSimple()
  ]);

  return (
    <div className="space-y-6">
      {/* Invoice Management Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All Invoices ({allInvoices.length})
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue ({overdueInvoices.length})
          </TabsTrigger>
          <TabsTrigger value="partial">
            Partial ({partialInvoices.length})
          </TabsTrigger>
          <TabsTrigger value="sent">
            Sent ({sentInvoices.length})
          </TabsTrigger>
          <TabsTrigger value="draft">
            Draft ({draftInvoices.length})
          </TabsTrigger>
          <TabsTrigger value="paid">
            Paid ({paidInvoices.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card className="pb-0">
            <CardHeader>
              <CardTitle>All Invoices</CardTitle>
              <CardDescription>
                Complete invoice history across all organizations
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <InvoiceDataTable data={allInvoices} status="all" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue">
          <Card className="pb-0">
            <CardHeader>
              <CardTitle>Overdue Invoices</CardTitle>
              <CardDescription>
                Invoices past their due date requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <InvoiceDataTable data={overdueInvoices} status="overdue" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partial">
          <Card className="pb-0">
            <CardHeader>
              <CardTitle>Partial Payment Invoices</CardTitle>
              <CardDescription>
                Invoices with deposits paid but balance remaining
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <InvoiceDataTable data={partialInvoices} status="partial" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent">
          <Card className="pb-0">
            <CardHeader>
              <CardTitle>Sent Invoices</CardTitle>
              <CardDescription>
                Invoices that have been sent and are awaiting payment
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <InvoiceDataTable data={sentInvoices} status="sent" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="draft">
          <Card className="pb-0">
            <CardHeader>
              <CardTitle>Draft Invoices</CardTitle>
              <CardDescription>
                Invoices in draft status pending review and sending
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <InvoiceDataTable data={draftInvoices} status="draft" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paid">
          <Card className="pb-0">
            <CardHeader>
              <CardTitle>Paid Invoices</CardTitle>
              <CardDescription>
                Successfully completed and paid invoices
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <InvoiceDataTable data={paidInvoices} status="paid" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
