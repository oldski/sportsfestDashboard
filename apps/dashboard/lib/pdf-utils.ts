import type { RegistrationInvoiceDto } from '~/types/dtos/registration-invoice-dto';
import type { RegistrationOrderDto } from '~/types/dtos/registration-order-dto';

// Format currency for display
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Format date for display - safely handles null/undefined dates
const formatDate = (date: Date | null | undefined) => {
  if (!date) return 'N/A';
  
  // Handle case where date might be a string
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  }).format(dateObj);
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
  try {
    // Dynamically import jsPDF
    const { jsPDF } = await import('jspdf');
    
    // Create new PDF document
    const doc = new jsPDF();
    
    // Set fonts and styling
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    let yPos = margin;
    
    // Header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('SportsFest', margin, yPos);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Event Registration System', margin, yPos + 8);
    
    // Invoice title
    yPos += 25;
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth - margin - 40, yPos, { align: 'right' });
    
    // Invoice details
    yPos += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`, pageWidth - margin - 80, yPos, { align: 'right' });
    doc.text(`Order Number: ${invoice.orderNumber}`, pageWidth - margin - 80, yPos + 6, { align: 'right' });
    doc.text(`Date: ${formatDate(invoice.createdAt)}`, pageWidth - margin - 80, yPos + 12, { align: 'right' });
    if (invoice.dueDate) {
      doc.text(`Due: ${formatDate(invoice.dueDate)}`, pageWidth - margin - 80, yPos + 18, { align: 'right' });
    }
    doc.text(`Status: ${invoice.status.toUpperCase()}`, pageWidth - margin - 80, yPos + (invoice.dueDate ? 24 : 18), { align: 'right' });
    
    yPos += 40;
    
    // Invoice information section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Information', margin, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Amount: ${formatCurrency(invoice.totalAmount)}`, margin, yPos);
    doc.text(`Amount Paid: ${formatCurrency(invoice.paidAmount)}`, margin, yPos + 6);
    doc.text(`Balance Owed: ${formatCurrency(invoice.balanceOwed)}`, margin, yPos + 12);
    
    yPos += 25;
    
    // Order items section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Order Items', margin, yPos);
    
    yPos += 10;
    
    // Items table header
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const colWidths = [contentWidth * 0.4, contentWidth * 0.15, contentWidth * 0.15, contentWidth * 0.15, contentWidth * 0.15];
    const colPositions = [
      margin,
      margin + colWidths[0],
      margin + colWidths[0] + colWidths[1],
      margin + colWidths[0] + colWidths[1] + colWidths[2],
      margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]
    ];
    
    doc.text('Item', colPositions[0], yPos);
    doc.text('Qty', colPositions[1], yPos);
    doc.text('Unit Price', colPositions[2], yPos);
    doc.text('Total', colPositions[3], yPos);
    
    yPos += 8;
    
    // Draw line under header
    doc.setLineWidth(0.1);
    doc.line(margin, yPos - 2, margin + contentWidth, yPos - 2);
    
    // Items data
    doc.setFont('helvetica', 'normal');
    invoice.order.items.forEach((item) => {
      if (yPos > 250) { // Start new page if needed
        doc.addPage();
        yPos = margin;
      }
      
      doc.text(item.productName, colPositions[0], yPos);
      doc.text(item.quantity.toString(), colPositions[1], yPos);
      doc.text(formatCurrency(item.unitPrice), colPositions[2], yPos);
      doc.text(formatCurrency(item.totalPrice), colPositions[3], yPos);
      
      yPos += 8;
    });
    
    yPos += 10;
    
    // Payment history (if any)
    if (invoice.order.payments && invoice.order.payments.length > 0) {
      if (yPos > 220) { // Start new page if needed
        doc.addPage();
        yPos = margin;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Payment History', margin, yPos);
      
      yPos += 10;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Date', colPositions[0], yPos);
      doc.text('Method', colPositions[1], yPos);
      doc.text('Status', colPositions[2], yPos);
      doc.text('Amount', colPositions[3], yPos);
      
      yPos += 8;
      doc.line(margin, yPos - 2, margin + contentWidth, yPos - 2);
      
      doc.setFont('helvetica', 'normal');
      invoice.order.payments.forEach((payment) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.text(formatDate(payment.paymentDate), colPositions[0], yPos);
        doc.text(payment.method + (payment.last4 ? ` ****${payment.last4}` : ''), colPositions[1], yPos);
        doc.text(payment.status, colPositions[2], yPos);
        doc.text(formatCurrency(payment.amount), colPositions[3], yPos);
        
        yPos += 8;
      });
    }
    
    // Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('SportsFest Event Registration', margin, pageHeight - 20);
    doc.text('This invoice was generated automatically by the SportsFest registration system.', margin, pageHeight - 15);
    
    // Save the PDF
    doc.save(`${invoice.invoiceNumber}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
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

export async function downloadOrderPDF(order: RegistrationOrderDto) {
  try {
    // Generate a PDF on the fly for orders
    await generateAndDownloadOrderPDF(order);
  } catch (error) {
    console.error('Error downloading order PDF:', error);
    throw new Error('Unable to download order PDF');
  }
}

async function generateAndDownloadOrderPDF(order: RegistrationOrderDto) {
  try {
    // Dynamically import jsPDF
    const { jsPDF } = await import('jspdf');
    
    // Create new PDF document
    const doc = new jsPDF();
    
    // Set fonts and styling
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    let yPos = margin;
    
    // Header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('SportsFest', margin, yPos);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Event Registration System', margin, yPos + 8);
    
    // Order title
    yPos += 25;
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('ORDER', pageWidth - margin - 40, yPos, { align: 'right' });
    
    // Order details
    yPos += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Order Number: ${order.orderNumber}`, pageWidth - margin - 80, yPos, { align: 'right' });
    doc.text(`Date: ${formatDate(order.createdAt)}`, pageWidth - margin - 80, yPos + 6, { align: 'right' });
    doc.text(`Status: ${order.status.replace('_', ' ').toUpperCase()}`, pageWidth - margin - 80, yPos + 12, { align: 'right' });
    
    yPos += 40;
    
    const totalPaid = (order.payments || []).filter(payment => payment && typeof payment.amount === 'number').reduce((sum, payment) => sum + payment.amount, 0);
    const balanceOwed = order.totalAmount - totalPaid;
    
    // Order information section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Order Information', margin, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Amount: ${formatCurrency(order.totalAmount)}`, margin, yPos);
    doc.text(`Amount Paid: ${formatCurrency(totalPaid)}`, margin, yPos + 6);
    doc.text(`Balance Owed: ${formatCurrency(balanceOwed)}`, margin, yPos + 12);
    
    yPos += 25;
    
    // Order items section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Order Items', margin, yPos);
    
    yPos += 10;
    
    // Items table header
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const colWidths = [contentWidth * 0.4, contentWidth * 0.15, contentWidth * 0.15, contentWidth * 0.15, contentWidth * 0.15];
    const colPositions = [
      margin,
      margin + colWidths[0],
      margin + colWidths[0] + colWidths[1],
      margin + colWidths[0] + colWidths[1] + colWidths[2],
      margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]
    ];
    
    doc.text('Item', colPositions[0], yPos);
    doc.text('Qty', colPositions[1], yPos);
    doc.text('Unit Price', colPositions[2], yPos);
    doc.text('Total', colPositions[3], yPos);
    
    yPos += 8;
    
    // Draw line under header
    doc.setLineWidth(0.1);
    doc.line(margin, yPos - 2, margin + contentWidth, yPos - 2);
    
    // Items data
    doc.setFont('helvetica', 'normal');
    order.items.forEach((item) => {
      if (yPos > 250) { // Start new page if needed
        doc.addPage();
        yPos = margin;
      }
      
      doc.text(item.productName, colPositions[0], yPos);
      doc.text(item.quantity.toString(), colPositions[1], yPos);
      doc.text(formatCurrency(item.unitPrice), colPositions[2], yPos);
      doc.text(formatCurrency(item.totalPrice), colPositions[3], yPos);
      
      yPos += 8;
    });
    
    yPos += 10;
    
    // Payment history (if any)
    if ((order.payments || []).length > 0) {
      if (yPos > 220) { // Start new page if needed
        doc.addPage();
        yPos = margin;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Payment History', margin, yPos);
      
      yPos += 10;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Date', colPositions[0], yPos);
      doc.text('Method', colPositions[1], yPos);
      doc.text('Status', colPositions[2], yPos);
      doc.text('Amount', colPositions[3], yPos);
      
      yPos += 8;
      doc.line(margin, yPos - 2, margin + contentWidth, yPos - 2);
      
      doc.setFont('helvetica', 'normal');
      (order.payments || []).filter(payment => payment && payment.amount).forEach((payment) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.text(formatDate(payment.paymentDate), colPositions[0], yPos);
        doc.text(payment.method + (payment.last4 ? ` ****${payment.last4}` : ''), colPositions[1], yPos);
        doc.text(payment.status, colPositions[2], yPos);
        doc.text(formatCurrency(payment.amount), colPositions[3], yPos);
        
        yPos += 8;
      });
    }
    
    // Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('SportsFest Event Registration', margin, pageHeight - 20);
    doc.text('This order was generated automatically by the SportsFest registration system.', margin, pageHeight - 15);
    
    // Save the PDF
    doc.save(`${order.orderNumber}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
}

function generateOrderHTML(order: RegistrationOrderDto): string {
  const currentDate = formatDate(new Date());
  const totalPaid = (order.payments || []).filter(payment => payment && typeof payment.amount === 'number').reduce((sum, payment) => sum + payment.amount, 0);
  const balanceOwed = order.totalAmount - totalPaid;
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Order ${order.orderNumber}</title>
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
        .order-info {
            text-align: right;
        }
        .order-info h2 {
            color: #333;
            margin: 0 0 10px 0;
            font-size: 24px;
        }
        .order-info p {
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
        .status-fully-paid { background-color: #dcfce7; color: #166534; }
        .status-deposit-paid { background-color: #dbeafe; color: #1d4ed8; }
        .status-pending { background-color: #f3f4f6; color: #374151; }
        .status-cancelled { background-color: #fee2e2; color: #dc2626; }
        .status-refunded { background-color: #f3f4f6; color: #374151; }
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
        .payments-section {
            margin-bottom: 30px;
        }
        .payment-item {
            display: flex;
            justify-content: space-between;
            padding: 10px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            margin-bottom: 10px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #666;
            font-size: 14px;
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
        <div class="order-info">
            <h2>ORDER</h2>
            <p><strong>${order.orderNumber}</strong></p>
            <p>Date: ${formatDate(order.createdAt)}</p>
            <p><span class="status-badge status-${order.status.replace('_', '-')}">${order.status.replace('_', ' ')}</span></p>
        </div>
    </div>

    <div class="billing-info">
        <div>
            <div class="section-title">Order Information</div>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Created:</strong> ${formatDate(order.createdAt)}</p>
            <p><strong>Status:</strong> ${order.status.replace('_', ' ').toUpperCase()}</p>
            <p><strong>Total Items:</strong> ${order.items.length}</p>
        </div>
        <div>
            <div class="section-title">Payment Summary</div>
            <p><strong>Order Total:</strong> ${formatCurrency(order.totalAmount)}</p>
            <p><strong>Amount Paid:</strong> <span style="color: #059669">${formatCurrency(totalPaid)}</span></p>
            <p><strong>Balance Owed:</strong> <span style="color: ${balanceOwed > 0 ? '#dc2626' : '#059669'}">${formatCurrency(balanceOwed)}</span></p>
        </div>
    </div>

    ${(order.payments || []).length > 0 ? `
    <div class="payments-section">
        <div class="section-title">Payment History</div>
        ${(order.payments || []).filter(payment => payment && payment.amount).map(payment => `
        <div class="payment-item">
            <div>
                <strong>${formatDate(payment.paymentDate)}</strong><br>
                <small>${payment.method} - ${payment.status}</small>
            </div>
            <div style="color: #059669; font-weight: bold;">
                ${formatCurrency(payment.amount)}
            </div>
        </div>
        `).join('')}
    </div>
    ` : ''}

    <table class="items-table">
        <thead>
            <tr>
                <th>Description</th>
                <th>Category</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            ${order.items.map(item => `
            <tr>
                <td>${item.productName}</td>
                <td>${item.productCategory}</td>
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
                <td><strong>Order Total:</strong></td>
                <td class="text-right"><strong>${formatCurrency(order.totalAmount)}</strong></td>
            </tr>
            <tr>
                <td>Amount Paid:</td>
                <td class="text-right" style="color: #059669">${formatCurrency(totalPaid)}</td>
            </tr>
            <tr class="total-row">
                <td>Balance Due:</td>
                <td class="text-right" style="color: ${balanceOwed > 0 ? '#dc2626' : '#059669'}">${formatCurrency(balanceOwed)}</td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <p><strong>SportsFest Event Registration</strong></p>
        <p>This order summary was generated automatically by the SportsFest registration system.</p>
        ${balanceOwed > 0 ? `<p style="color: #dc2626; font-weight: bold;">Outstanding balance of ${formatCurrency(balanceOwed)} requires payment.</p>` : ''}
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