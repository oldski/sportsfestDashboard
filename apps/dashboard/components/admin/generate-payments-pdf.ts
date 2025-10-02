import { pdf } from '@react-pdf/renderer';
import { AdminPaymentsReactPDF } from './payments-pdf-react';
import type { PaymentData } from '~/actions/admin/get-payments';

export async function generateAdminPaymentsReactPDF(
  payments: PaymentData[],
  status: 'pending' | 'completed' | 'failed' | 'refunded'
): Promise<void> {
  try {
    // Generate the PDF
    const pdfBlob = await pdf(
      AdminPaymentsReactPDF({
        payments,
        status,
      })
    ).toBlob();

    // Create download link
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `sportsfest-${status}-payments-${timestamp}.pdf`;
    link.download = filename;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating admin payments PDF with react-pdf:', error);
    throw error;
  }
}