import * as React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';
import { format } from 'date-fns';
import type { RegistrationInvoiceDto } from '~/types/dtos/registration-invoice-dto';

// Format currency for display
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Format date for display
const formatDate = (date: Date | null | undefined) => {
  if (!date) return 'N/A';
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return 'Invalid Date';
  return format(dateObj, 'MMMM dd, yyyy');
};

// Get status display
const getStatusDisplay = (status: string) => {
  return status.toUpperCase();
};

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 30,
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100%',
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 10,
  },
  logo: {
    width: 100,
    height: 55.5,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  invoiceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  invoiceDetails: {
    fontSize: 10,
    color: '#374151',
  },
  invoiceNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'right',
  },
  statusBadge: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    padding: 4,
    borderRadius: 4,
    fontSize: 8,
    textAlign: 'center',
    marginTop: 5,
  },
  statusPaid: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  statusSent: {
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
  },
  statusOverdue: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  infoColumn: {
    flex: 1,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 4,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    width: 120,
    color: '#374151',
  },
  infoValue: {
    fontSize: 9,
    color: '#1f2937',
  },
  notesSection: {
    backgroundColor: '#f9fafb',
    padding: 15,
    borderLeft: 4,
    borderLeftColor: '#2563eb',
    marginBottom: 20,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  notesText: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.4,
  },
  table: {
    width: '100%',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 6,
    paddingRight: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: 1,
    borderBottomColor: '#f3f4f6',
    padding: 6,
    minHeight: 24,
  },
  tableRowEven: {
    backgroundColor: '#f9fafb',
  },
  headerCell: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'left',
  },
  cell: {
    fontSize: 9,
    color: '#1f2937',
    textAlign: 'left',
  },
  cellRight: {
    textAlign: 'right',
  },
  // Column widths for items table
  colDescription: { width: '50%' },
  colQuantity: { width: '15%' },
  colUnitPrice: { width: '17.5%' },
  colTotal: { width: '17.5%' },
  // Payment history columns
  colDate: { width: '25%' },
  colMethod: { width: '30%' },
  colStatus: { width: '20%' },
  colAmount: { width: '25%' },
  totalsSection: {
    alignSelf: 'flex-end',
    width: 200,
    marginTop: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
  },
  totalRowFinal: {
    borderTop: 2,
    borderTopColor: '#1f2937',
    backgroundColor: '#f9fafb',
    fontWeight: 'bold',
  },
  totalLabel: {
    fontSize: 10,
    color: '#374151',
  },
  totalValue: {
    fontSize: 10,
    color: '#1f2937',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
  },
});

export interface InvoiceReactPDFProps {
  invoice: RegistrationInvoiceDto;
  organizationName: string;
}

export function InvoiceReactPDF({
  invoice,
  organizationName,
}: InvoiceReactPDFProps): React.JSX.Element {
  const currentDate = format(new Date(), 'MMMM dd, yyyy');

  // Get status badge style
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'paid':
        return styles.statusPaid;
      case 'sent':
        return styles.statusSent;
      case 'overdue':
        return styles.statusOverdue;
      default:
        return {};
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header} fixed>
          <Image
            src="/assets/logo-sportsfest-full.png"
            style={styles.logo}
          />
          <Text style={styles.title}>
            {organizationName} Invoice
          </Text>
          <Text style={styles.subtitle}>
            Event Year: {invoice.eventYear.name}
          </Text>
        </View>

        {/* Invoice Info Section */}
        <View style={styles.invoiceInfo}>
          <View>
            {invoice.dueDate && (
              <Text style={styles.invoiceDetails}>Due: {formatDate(invoice.dueDate)}</Text>
            )}
          </View>
          <View>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
            <View style={[styles.statusBadge, getStatusBadgeStyle(invoice.status)]}>
              <Text>{getStatusDisplay(invoice.status)}</Text>
            </View>
          </View>
        </View>

        {/* Info Sections */}
        <View style={styles.infoSection}>
          <View style={styles.infoColumn}>
            <Text style={styles.sectionTitle}>Invoice Information</Text>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Organization:</Text>
              <Text style={styles.infoValue}>{organizationName}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Invoice #:</Text>
              <Text style={styles.infoValue}>{invoice.invoiceNumber}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Order #:</Text>
              <Text style={styles.infoValue}>{invoice.orderNumber}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Created:</Text>
              <Text style={styles.infoValue}>{formatDate(invoice.createdAt)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Status:</Text>
              <Text style={styles.infoValue}>{getStatusDisplay(invoice.status)}</Text>
            </View>
            {invoice.sentAt && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Sent:</Text>
                <Text style={styles.infoValue}>{formatDate(invoice.sentAt)}</Text>
              </View>
            )}
            {invoice.paidAt && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Paid:</Text>
                <Text style={styles.infoValue}>{formatDate(invoice.paidAt)}</Text>
              </View>
            )}
          </View>

          <View style={styles.infoColumn}>
            <Text style={styles.sectionTitle}>Payment Summary</Text>
            {invoice.order.appliedCoupon && invoice.order.couponDiscount && invoice.order.couponDiscount > 0 && (
              <>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Subtotal:</Text>
                  <Text style={styles.infoValue}>
                    {formatCurrency(invoice.order.originalTotal || (invoice.totalAmount + invoice.order.couponDiscount))}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: '#16a34a' }]}>Discount:</Text>
                  <Text style={[styles.infoValue, { color: '#16a34a' }]}>
                    -{formatCurrency(invoice.order.couponDiscount)}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: '#16a34a' }]}>({invoice.order.appliedCoupon.code})</Text>
                </View>
              </>
            )}
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Total Amount:</Text>
              <Text style={styles.infoValue}>{formatCurrency(invoice.totalAmount)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Amount Paid:</Text>
              <Text style={styles.infoValue}>{formatCurrency(invoice.paidAmount)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Balance Owed:</Text>
              <Text style={styles.infoValue}>{formatCurrency(invoice.balanceOwed)}</Text>
            </View>
          </View>
        </View>

        {/* Notes Section (if any) */}
        {invoice.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Order Items Table */}
        <View style={styles.table}>
          <Text style={styles.sectionTitle}>Invoice Items</Text>

          {/* Table Header */}
          <View style={styles.tableHeader} fixed>
            <Text style={[styles.headerCell, styles.colDescription]}>Description</Text>
            <Text style={[styles.headerCell, styles.colQuantity, styles.cellRight]}>Qty</Text>
            <Text style={[styles.headerCell, styles.colUnitPrice, styles.cellRight]}>Unit Price</Text>
            <Text style={[styles.headerCell, styles.colTotal, styles.cellRight]}>Total</Text>
          </View>

          {/* Table Rows */}
          {invoice.order.items.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.tableRow,
                index % 2 === 1 ? styles.tableRowEven : {}
              ]}
              wrap={false}
            >
              <Text style={[styles.cell, styles.colDescription]}>
                {item.productName}
              </Text>
              <Text style={[styles.cell, styles.colQuantity, styles.cellRight]}>
                {item.quantity}
              </Text>
              <Text style={[styles.cell, styles.colUnitPrice, styles.cellRight]}>
                {formatCurrency(item.unitPrice)}
              </Text>
              <Text style={[styles.cell, styles.colTotal, styles.cellRight]}>
                {formatCurrency(item.totalPrice)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals Section */}
        <View style={styles.totalsSection}>
          {invoice.order.appliedCoupon && invoice.order.couponDiscount && invoice.order.couponDiscount > 0 && (
            <>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal:</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(invoice.order.originalTotal || (invoice.totalAmount + invoice.order.couponDiscount))}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: '#16a34a' }]}>
                  Discount ({invoice.order.appliedCoupon.code}):
                </Text>
                <Text style={[styles.totalValue, { color: '#16a34a' }]}>
                  -{formatCurrency(invoice.order.couponDiscount)}
                </Text>
              </View>
            </>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.totalAmount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Amount Paid:</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.paidAmount)}</Text>
          </View>
          <View style={[styles.totalRow, styles.totalRowFinal]}>
            <Text style={styles.totalLabel}>Balance Due:</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.balanceOwed)}</Text>
          </View>
        </View>

        {/* Payment History (if any) */}
        {invoice.order.payments && invoice.order.payments.length > 0 && (
          <View style={styles.table}>
            <Text style={styles.sectionTitle}>Payment History</Text>

            {/* Payment Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.colDate]}>Date</Text>
              <Text style={[styles.headerCell, styles.colMethod]}>Method</Text>
              <Text style={[styles.headerCell, styles.colStatus]}>Status</Text>
              <Text style={[styles.headerCell, styles.colAmount, styles.cellRight]}>Amount</Text>
            </View>

            {/* Payment Rows */}
            {invoice.order.payments.filter(payment => payment && payment.amount).map((payment, index) => (
              <View
                key={payment.id}
                style={[
                  styles.tableRow,
                  index % 2 === 1 ? styles.tableRowEven : {}
                ]}
                wrap={false}
              >
                <Text style={[styles.cell, styles.colDate]}>
                  {formatDate(payment.paymentDate)}
                </Text>
                <Text style={[styles.cell, styles.colMethod]}>
                  {payment.method}{payment.last4 ? ` ****${payment.last4}` : ''}
                </Text>
                <Text style={[styles.cell, styles.colStatus]}>
                  {payment.status}
                </Text>
                <Text style={[styles.cell, styles.colAmount, styles.cellRight]}>
                  {formatCurrency(payment.amount)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer} fixed>
          Generated on {currentDate} • SportsFest Event Registration System
        </Text>
      </Page>
    </Document>
  );
}
