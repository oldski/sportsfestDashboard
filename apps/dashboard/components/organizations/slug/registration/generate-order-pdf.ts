import { pdf } from '@react-pdf/renderer';
import { OrderReactPDF } from './order-pdf-react';
import type { RegistrationOrderDto } from '~/types/dtos/registration-order-dto';

export async function generateOrderPDF(
  order: RegistrationOrderDto,
  organizationName: string
): Promise<void> {
  try {
    const blob = await pdf(
      OrderReactPDF({
        order,
        organizationName,
      })
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${organizationName}-order-${order.orderNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating order PDF:', error);
    throw error;
  }
}