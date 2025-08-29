import * as React from 'react';

export default function RegistrationInvoicesPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            View and manage your SportsFest payment invoices
          </p>
        </div>
      </div>
      
      <div className="rounded-lg border border-dashed p-8 text-center">
        <h3 className="text-lg font-semibold">Invoices DataTable</h3>
        <p className="text-muted-foreground mt-2">
          Invoices datatable with download and payment actions will be implemented here
        </p>
      </div>
    </div>
  );
}