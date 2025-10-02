import { pdf } from '@react-pdf/renderer';
import { TentTrackingReactPDF } from './tent-tracking-pdf-react';
import type { TentTrackingData } from '~/actions/admin/get-tent-tracking';

export async function generateTentTrackingReactPDF(
  tentTracking: TentTrackingData[]
): Promise<void> {
  try {
    // Generate the PDF
    const pdfBlob = await pdf(
      TentTrackingReactPDF({
        tentTracking,
      })
    ).toBlob();

    // Create download link
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `sportsfest-tent-tracking-${timestamp}.pdf`;
    link.download = filename;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating tent tracking PDF with react-pdf:', error);
    throw error;
  }
}