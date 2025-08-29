import type { RegistrationInvoiceDto } from '~/types/dtos/registration-invoice-dto';

// Format currency for display
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Format date for display
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  }).format(date);
};

export async function downloadInvoicePDF(invoice: RegistrationInvoiceDto) {
  try {
    // If invoice already has a downloadUrl from Stripe or another service, use it
    if (invoice.downloadUrl) {
      const response = await fetch(invoice.downloadUrl);
      if (response.ok) {
        const blob = await response.blob();
        downloadBlob(blob, `${invoice.invoiceNumber}.pdf`);
        return;
      }
    }

    // Otherwise, generate a PDF on the fly
    await generateAndDownloadInvoicePDF(invoice);
  } catch (error) {
    console.error('Error downloading invoice PDF:', error);
    // Fallback: open in new tab or show error message
    if (invoice.downloadUrl) {
      window.open(invoice.downloadUrl, '_blank');
    } else {
      throw new Error('Unable to download invoice PDF');
    }
  }
}

async function generateAndDownloadInvoicePDF(invoice: RegistrationInvoiceDto) {
  // For client-side PDF generation, we can use jsPDF or similar
  // For now, let's create a simple HTML version and convert to PDF using the browser's print
  
  const htmlContent = generateInvoiceHTML(invoice);
  
  // Create a new window with the invoice content
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Popup blocked. Please allow popups for PDF download.');
  }

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      // Close window after a delay to allow printing
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    }, 500);
  };
}

function generateInvoiceHTML(invoice: RegistrationInvoiceDto): string {
  const currentDate = formatDate(new Date());
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice ${invoice.invoiceNumber}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
        }
        .company-info h1 {
            color: #2563eb;
            margin: 0 0 10px 0;
            font-size: 28px;
        }
        .company-info p {
            margin: 0;
            color: #666;
        }
        .invoice-info {
            text-align: right;
        }
        .invoice-info h2 {
            color: #333;
            margin: 0 0 10px 0;
            font-size: 24px;
        }
        .invoice-info p {
            margin: 5px 0;
        }
        .billing-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
        }
        .section-title {
            font-weight: bold;
            color: #2563eb;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-paid { background-color: #dcfce7; color: #166534; }
        .status-sent { background-color: #dbeafe; color: #1d4ed8; }
        .status-overdue { background-color: #fee2e2; color: #dc2626; }
        .status-draft { background-color: #f3f4f6; color: #374151; }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .items-table th,
        .items-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        .items-table th {
            background-color: #f9fafb;
            font-weight: 600;
        }
        .items-table .text-right {
            text-align: right;
        }
        .totals {
            margin-left: auto;
            width: 300px;
        }
        .totals table {
            width: 100%;
            border-collapse: collapse;
        }
        .totals td {
            padding: 8px 12px;
            border-bottom: 1px solid #e5e7eb;
        }
        .totals .total-row {
            font-weight: bold;
            font-size: 18px;
            border-top: 2px solid #333;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #666;
            font-size: 14px;
        }
        .notes {
            background-color: #f9fafb;
            padding: 20px;
            border-left: 4px solid #2563eb;
            margin-bottom: 30px;
        }
        @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-info">
            <h1>SportsFest</h1>
            <p>Event Registration System</p>
            <p>Generated on ${currentDate}</p>
        </div>
        <div class="invoice-info">
            <h2>INVOICE</h2>
            <p><strong>${invoice.invoiceNumber}</strong></p>
            <p>Order: ${invoice.orderNumber}</p>
            <p>Date: ${formatDate(invoice.createdAt)}</p>
            ${invoice.dueDate ? `<p>Due: ${formatDate(invoice.dueDate)}</p>` : ''}
            <p><span class="status-badge status-${invoice.status}">${invoice.status}</span></p>
        </div>
    </div>

    <div class="billing-info">
        <div>
            <div class="section-title">Invoice Information</div>
            <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Order Number:</strong> ${invoice.orderNumber}</p>
            <p><strong>Created:</strong> ${formatDate(invoice.createdAt)}</p>
            <p><strong>Status:</strong> ${invoice.status.toUpperCase()}</p>
            ${invoice.sentAt ? `<p><strong>Sent:</strong> ${formatDate(invoice.sentAt)}</p>` : ''}
            ${invoice.paidAt ? `<p><strong>Paid:</strong> ${formatDate(invoice.paidAt)}</p>` : ''}
        </div>
        <div>
            <div class="section-title">Payment Summary</div>
            <p><strong>Total Amount:</strong> ${formatCurrency(invoice.totalAmount)}</p>
            <p><strong>Amount Paid:</strong> <span style="color: #059669">${formatCurrency(invoice.paidAmount)}</span></p>
            <p><strong>Balance Owed:</strong> <span style="color: ${invoice.balanceOwed > 0 ? '#dc2626' : '#059669'}">${formatCurrency(invoice.balanceOwed)}</span></p>
        </div>
    </div>

    ${invoice.notes ? `
    <div class="notes">
        <div class="section-title">Notes</div>
        <p>${invoice.notes}</p>
    </div>
    ` : ''}

    <table class="items-table">
        <thead>
            <tr>
                <th>Description</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            ${invoice.order.items.map(item => `
            <tr>
                <td>${item.productName}</td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">${formatCurrency(item.unitPrice)}</td>
                <td class="text-right">${formatCurrency(item.totalPrice)}</td>
            </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="totals">
        <table>
            <tr>
                <td><strong>Total Amount:</strong></td>
                <td class="text-right"><strong>${formatCurrency(invoice.totalAmount)}</strong></td>
            </tr>
            <tr>
                <td>Amount Paid:</td>
                <td class="text-right" style="color: #059669">${formatCurrency(invoice.paidAmount)}</td>
            </tr>
            <tr class="total-row">
                <td>Balance Due:</td>
                <td class="text-right" style="color: ${invoice.balanceOwed > 0 ? '#dc2626' : '#059669'}">${formatCurrency(invoice.balanceOwed)}</td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <p><strong>SportsFest Event Registration</strong></p>
        <p>This invoice was generated automatically by the SportsFest registration system.</p>
        ${invoice.balanceOwed > 0 ? `<p style="color: #dc2626; font-weight: bold;">Payment of ${formatCurrency(invoice.balanceOwed)} is due${invoice.dueDate ? ` by ${formatDate(invoice.dueDate)}` : ''}.</p>` : ''}
    </div>
</body>
</html>`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}