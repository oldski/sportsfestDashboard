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
import type { TentTrackingData } from '~/actions/admin/get-tent-tracking';
import { formatCurrency } from '~/lib/formatters';

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
  // Column widths for tent tracking table
  colOrganization: { width: '20%' },
  colEventYear: { width: '12%' },
  colTents: { width: '14%' },
  colAmount: { width: '14%' },
  colStatus: { width: '16%' },
  colPayment: { width: '18%' },
  colDate: { width: '14%' },
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

export interface TentTrackingReactPDFProps {
  tentTracking: TentTrackingData[];
}

export function TentTrackingReactPDF({
  tentTracking,
}: TentTrackingReactPDFProps): React.JSX.Element {
  const currentDate = format(new Date(), 'MMMM dd, yyyy');

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
            SportsFest Tent Tracking Report
          </Text>
          <Text style={styles.subtitle}>
            All Tent Rentals • Total: {tentTracking.length} rental records
          </Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader} fixed>
            <Text style={[styles.headerCell, styles.colOrganization]}>Organization</Text>
            <Text style={[styles.headerCell, styles.colEventYear]}>Event Year</Text>
            <Text style={[styles.headerCell, styles.colTents]}>Tents</Text>
            <Text style={[styles.headerCell, styles.colAmount]}>Total Amount</Text>
            <Text style={[styles.headerCell, styles.colStatus]}>Status</Text>
            <Text style={[styles.headerCell, styles.colPayment]}>Payment</Text>
            <Text style={[styles.headerCell, styles.colDate]}>Purchase Date</Text>
          </View>

          {/* Table Rows */}
          {tentTracking.map((tracking, index) => {
            const statusText = tracking.status === 'confirmed' ? 'Confirmed' :
                              tracking.status === 'pending_payment' ? 'Pending Payment' :
                              tracking.status === 'partial_payment' ? 'Partial Payment' :
                              tracking.status;

            const paymentText = tracking.balanceOwed > 0
              ? `Paid: ${formatCurrency(tracking.depositPaid)} / Owed: ${formatCurrency(tracking.balanceOwed)}`
              : 'Paid in Full';

            return (
              <View
                key={tracking.id}
                style={[
                  styles.tableRow,
                  index % 2 === 1 ? styles.tableRowEven : {}
                ]}
                wrap={false}
              >
                <Text style={[styles.cell, styles.colOrganization]}>
                  {tracking.organizationName || ''}
                  {tracking.isAtLimit ? ' (At Limit)' : ''}
                </Text>
                <Text style={[styles.cell, styles.colEventYear]}>
                  {tracking.eventYear || ''}
                </Text>
                <Text style={[styles.cell, styles.colTents]}>
                  {tracking.tentCount} / {tracking.companyTeamCount * 2} max
                </Text>
                <Text style={[styles.cell, styles.colAmount]}>
                  {formatCurrency(tracking.totalAmount)}
                </Text>
                <Text style={[styles.cell, styles.colStatus]}>
                  {statusText}
                </Text>
                <Text style={[styles.cell, styles.colPayment]}>
                  {paymentText}
                </Text>
                <Text style={[styles.cell, styles.colDate]}>
                  {tracking.purchaseDate ? format(new Date(tracking.purchaseDate), 'MMM dd, yyyy') : 'Unknown'}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Footer */}
        <Text style={styles.footer} fixed>
          SportsFest Tent Tracking Report • Generated on {currentDate}
        </Text>
      </Page>
    </Document>
  );
}