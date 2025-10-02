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
import type { OrganizationData } from '~/actions/admin/get-organizations';
import { formatPhoneNumber } from '~/lib/formatters';

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
  // Column widths for admin organizations table with separate address columns
  colName: { width: '15%' },
  colSlug: { width: '10%' },
  colMembers: { width: '6%' },
  colPhone: { width: '10%' },
  colAddress: { width: '14%' },
  colAddress2: { width: '8%' },
  colCity: { width: '10%' },
  colState: { width: '5%' },
  colZip: { width: '6%' },
  colCreated: { width: '8%' },
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

export interface AdminOrganizationsReactPDFProps {
  organizations: OrganizationData[];
}

export function AdminOrganizationsReactPDF({
  organizations,
}: AdminOrganizationsReactPDFProps): React.JSX.Element {
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
            SportsFest Dashboard Companies Report
          </Text>
          <Text style={styles.subtitle}>
            All Registered Companies • Total: {organizations.length} organizations
          </Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader} fixed>
            <Text style={[styles.headerCell, styles.colName]}>Company Name</Text>
            <Text style={[styles.headerCell, styles.colSlug]}>Slug</Text>
            <Text style={[styles.headerCell, styles.colMembers]}>Members</Text>
            <Text style={[styles.headerCell, styles.colPhone]}>Phone</Text>
            <Text style={[styles.headerCell, styles.colAddress]}>Address</Text>
            <Text style={[styles.headerCell, styles.colAddress2]}>Address 2</Text>
            <Text style={[styles.headerCell, styles.colCity]}>City</Text>
            <Text style={[styles.headerCell, styles.colState]}>State</Text>
            <Text style={[styles.headerCell, styles.colZip]}>ZIP</Text>
            <Text style={[styles.headerCell, styles.colCreated]}>Created</Text>
          </View>

          {/* Table Rows */}
          {organizations.map((org, index) => {
            return (
              <View
                key={org.id}
                style={[
                  styles.tableRow,
                  index % 2 === 1 ? styles.tableRowEven : {}
                ]}
                wrap={false}
              >
                <Text style={[styles.cell, styles.colName]}>
                  {org.name || ''}
                </Text>
                <Text style={[styles.cell, styles.colSlug]}>
                  {org.slug || ''}
                </Text>
                <Text style={[styles.cell, styles.colMembers]}>
                  {org.memberCount}
                </Text>
                <Text style={[styles.cell, styles.colPhone]}>
                  {formatPhoneNumber(org.phone) || 'Not provided'}
                </Text>
                <Text style={[styles.cell, styles.colAddress]}>
                  {org.address || ''}
                </Text>
                <Text style={[styles.cell, styles.colAddress2]}>
                  {org.address2 || ''}
                </Text>
                <Text style={[styles.cell, styles.colCity]}>
                  {org.city || ''}
                </Text>
                <Text style={[styles.cell, styles.colState]}>
                  {org.state || ''}
                </Text>
                <Text style={[styles.cell, styles.colZip]}>
                  {org.zip || ''}
                </Text>
                <Text style={[styles.cell, styles.colCreated]}>
                  {org.createdAt ? format(new Date(org.createdAt), 'MMM dd, yyyy') : 'Unknown'}
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