import { pdf } from '@react-pdf/renderer';
import { AdminPlayersReactPDF } from './players-pdf-react';
import type { PlayerData } from '~/actions/admin/get-players';

export async function generateAdminPlayersReactPDF(
  players: PlayerData[],
  eventYearName?: string
): Promise<void> {
  try {
    // Generate the PDF
    const pdfBlob = await pdf(
      AdminPlayersReactPDF({
        players,
        eventYearName,
      })
    ).toBlob();

    // Create download link
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `sportsfest-admin-players-${timestamp}.pdf`;
    link.download = filename;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating admin players PDF with react-pdf:', error);
    throw error;
  }
}