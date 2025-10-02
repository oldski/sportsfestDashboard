import { pdf } from '@react-pdf/renderer';
import { AdminOrganizationsReactPDF } from './organizations-pdf-react';
import type { OrganizationData } from '~/actions/admin/get-organizations';

export async function generateAdminOrganizationsReactPDF(
  organizations: OrganizationData[]
): Promise<void> {
  try {
    // Generate the PDF
    const pdfBlob = await pdf(
      AdminOrganizationsReactPDF({
        organizations,
      })
    ).toBlob();

    // Create download link
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `sportsfest-admin-organizations-${timestamp}.pdf`;
    link.download = filename;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating admin organizations PDF with react-pdf:', error);
    throw error;
  }
}