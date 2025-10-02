import { pdf } from '@react-pdf/renderer';
import { AdminUsersReactPDF } from './users-pdf-react';
import type { UserData } from '~/actions/admin/get-users';

export async function generateAdminUsersReactPDF(
  users: UserData[]
): Promise<void> {
  try {
    // Generate the PDF
    const pdfBlob = await pdf(
      AdminUsersReactPDF({
        users,
      })
    ).toBlob();

    // Create download link
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `sportsfest-admin-users-${timestamp}.pdf`;
    link.download = filename;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating admin users PDF with react-pdf:', error);
    throw error;
  }
}