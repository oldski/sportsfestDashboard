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
import type { InvoiceData } from '~/actions/admin/get-invoices';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    padding: 30,
    backgroundColor: '#ffffff',
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
  table: {
    width: '100%',
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderBottom: 2,
    borderBottomColor: '#1f2937',
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 4,
    paddingRight: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 4,
    paddingRight: 4,
    minHeight: 24,
  },
  tableRowEven: {
    backgroundColor: '#f9fafb',
  },
  headerCell: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'left',
  },
  cell: {
    fontSize: 8,
    color: '#1f2937',
    textAlign: 'left',
  },
  cellRight: {
    textAlign: 'right',
  },
  cellCenter: {
    textAlign: 'center',
  },
  // Column widths
  colInvoice: { width: '12%' },
  colOrg: { width: '15%' },
  colOrder: { width: '11%' },
  colTotal: { width: '10%' },
  colPaid: { width: '10%' },
  colBalance: { width: '10%' },
  colStatus: { width: '8%' },
  colNotes: { width: '24%' },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
  },
  statusBadge: {
    fontSize: 7,
    padding: 2,
    borderRadius: 2,
  },
  statusPaid: {
    color: '#166534',
  },
  statusPartial: {
    color: '#c2410c',
  },
  statusOverdue: {
    color: '#dc2626',
  },
  statusSent: {
    color: '#1d4ed8',
  },
  summary: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
  },
  summaryValue: {
    fontSize: 10,
    color: '#1f2937',
  },
});

export interface InvoiceListPDFProps {
  invoices: InvoiceData[];
  title: string;
}

export function InvoiceListPDF({
  invoices,
  title,
}: InvoiceListPDFProps): React.JSX.Element {
  const currentDate = format(new Date(), 'MMMM dd, yyyy');

  // Calculate totals
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalBalance = invoices.reduce((sum, inv) => sum + inv.balanceOwed, 0);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'paid':
        return styles.statusPaid;
      case 'partial':
        return styles.statusPartial;
      case 'overdue':
        return styles.statusOverdue;
      case 'sent':
        return styles.statusSent;
      default:
        return {};
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        {/* Header */}
        <View style={styles.header} fixed>
          <Image
            src="/assets/logo-sportsfest-full.png"
            style={styles.logo}
          />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            Generated on {currentDate} • Total Invoices: {invoices.length}
          </Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader} fixed>
            <Text style={[styles.headerCell, styles.colInvoice]}>Invoice #</Text>
            <Text style={[styles.headerCell, styles.colOrg]}>Organization</Text>
            <Text style={[styles.headerCell, styles.colOrder]}>Order #</Text>
            <Text style={[styles.headerCell, styles.colTotal, styles.cellRight]}>Total</Text>
            <Text style={[styles.headerCell, styles.colPaid, styles.cellRight]}>Paid</Text>
            <Text style={[styles.headerCell, styles.colBalance, styles.cellRight]}>Balance</Text>
            <Text style={[styles.headerCell, styles.colStatus, styles.cellCenter]}>Status</Text>
            <Text style={[styles.headerCell, styles.colNotes]}>Notes</Text>
          </View>

          {/* Table Rows */}
          {invoices.map((invoice, index) => (
            <View
              key={invoice.id}
              style={[
                styles.tableRow,
                index % 2 === 1 ? styles.tableRowEven : {}
              ]}
              wrap={false}
            >
              <Text style={[styles.cell, styles.colInvoice]}>
                {invoice.invoiceNumber}
              </Text>
              <Text style={[styles.cell, styles.colOrg]}>
                {invoice.organizationName}
              </Text>
              <Text style={[styles.cell, styles.colOrder]}>
                {invoice.orderNumber || 'N/A'}
              </Text>
              <Text style={[styles.cell, styles.colTotal, styles.cellRight]}>
                {formatCurrency(invoice.totalAmount)}
              </Text>
              <Text style={[styles.cell, styles.colPaid, styles.cellRight]}>
                {formatCurrency(invoice.paidAmount)}
              </Text>
              <Text style={[styles.cell, styles.colBalance, styles.cellRight]}>
                {formatCurrency(invoice.balanceOwed)}
              </Text>
              <Text style={[styles.cell, styles.colStatus, styles.cellCenter, styles.statusBadge, getStatusStyle(invoice.status)]}>
                {invoice.status.toUpperCase()}
              </Text>
              <Text style={[styles.cell, styles.colNotes]}>
                {invoice.notes || '—'}
              </Text>
            </View>
          ))}
        </View>

        {/* Summary Section */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalAmount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Paid:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalPaid)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Balance:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalBalance)}</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer} fixed>
          SportsFest Event Registration System • Invoice Report
        </Text>
      </Page>
    </Document>
  );
}
