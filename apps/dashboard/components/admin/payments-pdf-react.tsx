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
import type { PaymentData } from '~/actions/admin/get-payments';
import { formatCurrency, formatDate } from '~/lib/formatters';

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
  table: {
    width: '100%',
    flex: 1,
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
    padding: 4,
    minHeight: 20,
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
    fontSize: 7,
    color: '#1f2937',
    textAlign: 'left',
  },
  // Column widths for payments table (normal) - Total: 100%
  colOrganization: { width: '20%' },
  colOrderNumber: { width: '16%' },
  colPaymentType: { width: '14%' },
  colAmount: { width: '12%' },
  colStatus: { width: '12%' },
  colDate: { width: '16%' },
  // Column widths for failed payments table (with failure reason) - Total: 100%
  colOrganizationFailed: { width: '18%' },
  colOrderNumberFailed: { width: '14%' },
  colPaymentTypeFailed: { width: '12%' },
  colAmountFailed: { width: '10%' },
  colFailureReason: { width: '16%' },
  colStatusFailed: { width: '10%' },
  colDateFailed: { width: '14%' },
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

export interface AdminPaymentsReactPDFProps {
  payments: PaymentData[];
  status: 'pending' | 'completed' | 'failed' | 'refunded';
}

export function AdminPaymentsReactPDF({
  payments,
  status,
}: AdminPaymentsReactPDFProps): React.JSX.Element {
  const currentDate = format(new Date(), 'MMMM dd, yyyy');

  const statusConfig = {
    pending: { title: 'Pending Payments Report', description: 'Payments awaiting processing or customer action' },
    failed: { title: 'Failed Payments Report', description: 'Payments that failed processing and require attention' },
    completed: { title: 'Completed Payments Report', description: 'Successfully processed transactions' },
    refunded: { title: 'Refunded Payments Report', description: 'Payments that have been refunded to customers' }
  };

  const config = statusConfig[status];

  const formatPaymentType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header} fixed>
          <Image
            src="/assets/logo-sportsfest-full.png"
            style={styles.logo}
          />
          <Text style={styles.title}>
            SportsFest Dashboard {config.title}
          </Text>
          <Text style={styles.subtitle}>
            {config.description} • Total: {payments.length} payments
          </Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader} fixed>
            <Text style={[styles.headerCell, status === 'failed' ? styles.colOrganizationFailed : styles.colOrganization]}>Organization</Text>
            <Text style={[styles.headerCell, status === 'failed' ? styles.colOrderNumberFailed : styles.colOrderNumber]}>Order #</Text>
            <Text style={[styles.headerCell, status === 'failed' ? styles.colPaymentTypeFailed : styles.colPaymentType]}>Payment Type</Text>
            <Text style={[styles.headerCell, status === 'failed' ? styles.colAmountFailed : styles.colAmount]}>Amount</Text>
            {status === 'failed' && (
              <Text style={[styles.headerCell, styles.colFailureReason]}>Failure Reason</Text>
            )}
            <Text style={[styles.headerCell, status === 'failed' ? styles.colStatusFailed : styles.colStatus]}>Status</Text>
            <Text style={[styles.headerCell, status === 'failed' ? styles.colDateFailed : styles.colDate]}>
              {status === 'completed' ? 'Completed' : 'Created'}
            </Text>
          </View>

          {/* Table Rows */}
          {payments.map((payment, index) => {
            return (
              <View
                key={payment.id}
                style={[
                  styles.tableRow,
                  index % 2 === 1 ? styles.tableRowEven : {}
                ]}
                wrap={false}
              >
                <Text style={[styles.cell, status === 'failed' ? styles.colOrganizationFailed : styles.colOrganization]}>
                  {payment.organizationName || ''}
                </Text>
                <Text style={[styles.cell, status === 'failed' ? styles.colOrderNumberFailed : styles.colOrderNumber]}>
                  {payment.orderNumber || 'N/A'}
                </Text>
                <Text style={[styles.cell, status === 'failed' ? styles.colPaymentTypeFailed : styles.colPaymentType]}>
                  {formatPaymentType(payment.paymentType)}
                </Text>
                <Text style={[styles.cell, status === 'failed' ? styles.colAmountFailed : styles.colAmount]}>
                  {formatCurrency(payment.amount)}
                </Text>
                {status === 'failed' && (
                  <Text style={[styles.cell, styles.colFailureReason]}>
                    {payment.failureReason ? String(payment.failureReason).replace('_', ' ') : 'Unknown'}
                  </Text>
                )}
                <Text style={[styles.cell, status === 'failed' ? styles.colStatusFailed : styles.colStatus]}>
                  {payment.status}
                </Text>
                <Text style={[styles.cell, status === 'failed' ? styles.colDateFailed : styles.colDate]}>
                  {status === 'completed' && payment.processedAt
                    ? formatDate(payment.processedAt)
                    : formatDate(payment.createdAt)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Footer */}
        <Text style={styles.footer} fixed>
          SportsFest Admin Report • Generated on {currentDate}
        </Text>
      </Page>
    </Document>
  );
}