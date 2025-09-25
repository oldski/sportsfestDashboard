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
import type { RegistrationOrderDto } from '~/types/dtos/registration-order-dto';

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
  return status.replace('_', ' ').toUpperCase();
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
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  orderDetails: {
    fontSize: 10,
    color: '#374151',
  },
  orderNumber: {
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
    width: 80,
    color: '#374151',
  },
  infoValue: {
    fontSize: 9,
    color: '#1f2937',
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
  colDescription: { width: '40%' },
  colCategory: { width: '20%' },
  colQuantity: { width: '10%' },
  colUnitPrice: { width: '15%' },
  colTotal: { width: '15%' },
  // Payment history columns
  colDate: { width: '25%' },
  colMethod: { width: '25%' },
  colStatus: { width: '20%' },
  colAmount: { width: '15%' },
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

export interface OrderReactPDFProps {
  order: RegistrationOrderDto;
  organizationName: string;
}

export function OrderReactPDF({
  order,
  organizationName,
}: OrderReactPDFProps): React.JSX.Element {
  const currentDate = format(new Date(), 'MMMM dd, yyyy');

  // Calculate payment totals
  const totalPaid = (order.payments || [])
    .filter(payment => payment && typeof payment.amount === 'number')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const balanceOwed = order.totalAmount - totalPaid;

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
            {organizationName} Order
          </Text>
          <Text style={styles.subtitle}>
            Event Year: {order.eventYear.name}
          </Text>
        </View>

        {/* Order Info Section */}
        <View style={styles.orderInfo}>
          <View>
            {/* Empty left side - all details shown in Order Information section below */}
          </View>
          <View>
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            <View style={styles.statusBadge}>
              <Text>{getStatusDisplay(order.status)}</Text>
            </View>
          </View>
        </View>

        {/* Info Sections */}
        <View style={styles.infoSection}>
          <View style={styles.infoColumn}>
            <Text style={styles.sectionTitle}>Order Information</Text>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Order Number:</Text>
              <Text style={styles.infoValue}>{order.orderNumber}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Created:</Text>
              <Text style={styles.infoValue}>{formatDate(order.createdAt)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Status:</Text>
              <Text style={styles.infoValue}>{getStatusDisplay(order.status)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Total Items:</Text>
              <Text style={styles.infoValue}>{order.items.length}</Text>
            </View>
          </View>

          <View style={styles.infoColumn}>
            <Text style={styles.sectionTitle}>Payment Summary</Text>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Order Total:</Text>
              <Text style={styles.infoValue}>{formatCurrency(order.totalAmount)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Amount Paid:</Text>
              <Text style={styles.infoValue}>{formatCurrency(totalPaid)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Balance Owed:</Text>
              <Text style={styles.infoValue}>{formatCurrency(balanceOwed)}</Text>
            </View>
          </View>
        </View>

        {/* Order Items Table */}
        <View style={styles.table}>
          <Text style={styles.sectionTitle}>Order Items</Text>

          {/* Table Header */}
          <View style={styles.tableHeader} fixed>
            <Text style={[styles.headerCell, styles.colDescription]}>Description</Text>
            <Text style={[styles.headerCell, styles.colCategory]}>Category</Text>
            <Text style={[styles.headerCell, styles.colQuantity, styles.cellRight]}>Qty</Text>
            <Text style={[styles.headerCell, styles.colUnitPrice, styles.cellRight]}>Unit Price</Text>
            <Text style={[styles.headerCell, styles.colTotal, styles.cellRight]}>Total</Text>
          </View>

          {/* Table Rows */}
          {order.items.map((item, index) => (
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
              <Text style={[styles.cell, styles.colCategory]}>
                {item.productCategory}
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
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Order Total:</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.totalAmount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Amount Paid:</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalPaid)}</Text>
          </View>
          <View style={[styles.totalRow, styles.totalRowFinal]}>
            <Text style={styles.totalLabel}>Balance Due:</Text>
            <Text style={styles.totalValue}>{formatCurrency(balanceOwed)}</Text>
          </View>
        </View>

        {/* Payment History (if any) */}
        {(order.payments || []).length > 0 && (
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
            {(order.payments || []).filter(payment => payment && payment.amount).map((payment, index) => (
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
                  {payment.method}
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