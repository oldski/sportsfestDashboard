import * as React from 'react';

import { getAuthOrganizationContext } from '@workspace/auth/context';
import { getRegistrationInvoices } from '~/data/registration/get-invoices';
import { InvoicesDataTable } from '~/components/organizations/slug/registration/invoices-data-table';

export default async function InvoicesPage(): Promise<React.JSX.Element> {
  const [invoices, ctx] = await Promise.all([
    getRegistrationInvoices(),
    getAuthOrganizationContext()
  ]);

  return (
    <InvoicesDataTable
      invoices={invoices}
      organizationName={ctx.organization.name}
    />
  );
}
