import * as React from 'react';

import { getRegistrationInvoices } from '~/data/registration/get-invoices';
import { InvoicesDataTable } from '~/components/organizations/slug/registration/invoices-data-table';

export default async function InvoicesPage(): Promise<React.JSX.Element> {
  const invoices = await getRegistrationInvoices();

  return (
    <InvoicesDataTable invoices={invoices} />
  );
}
