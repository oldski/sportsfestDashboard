import { pdf } from '@react-pdf/renderer';
import { InvoiceReactPDF } from './invoice-pdf-react';
import type { RegistrationInvoiceDto } from '~/types/dtos/registration-invoice-dto';

export async function generateInvoicePDF(
  invoice: RegistrationInvoiceDto,
  organizationName: string
): Promise<void> {
  try {
    const blob = await pdf(
      InvoiceReactPDF({
        invoice,
        organizationName,
      })
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${organizationName}-invoice-${invoice.invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    throw error;
  }
}