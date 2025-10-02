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
import type { UserData } from '~/actions/admin/get-users';

// Helper function to get role display text
function getRoleDisplay(isSportsFestAdmin: boolean) {
  return isSportsFestAdmin ? 'Super Admin' : 'User';
}

// Helper function to get status display text
function getStatusDisplay(isActive: boolean) {
  return isActive ? 'Active' : 'Inactive';
}

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
  // Column widths for admin users table
  colName: { width: '20%' },
  colEmail: { width: '20%' },
  colRole: { width: '12%' },
  colOrganization: { width: '18%' },
  colStatus: { width: '10%' },
  colLastLogin: { width: '10%' },
  colCreated: { width: '10%' },
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

export interface AdminUsersReactPDFProps {
  users: UserData[];
}

export function AdminUsersReactPDF({
  users,
}: AdminUsersReactPDFProps): React.JSX.Element {
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
            SportsFest Admin Users Report
          </Text>
          <Text style={styles.subtitle}>
            All Platform Users • Total: {users.length} users
          </Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader} fixed>
            <Text style={[styles.headerCell, styles.colName]}>Name</Text>
            <Text style={[styles.headerCell, styles.colEmail]}>Email</Text>
            <Text style={[styles.headerCell, styles.colRole]}>Role</Text>
            <Text style={[styles.headerCell, styles.colOrganization]}>Organization</Text>
            <Text style={[styles.headerCell, styles.colStatus]}>Status</Text>
            <Text style={[styles.headerCell, styles.colLastLogin]}>Last Login</Text>
            <Text style={[styles.headerCell, styles.colCreated]}>Created</Text>
          </View>

          {/* Table Rows */}
          {users.map((user, index) => (
            <View
              key={user.id}
              style={[
                styles.tableRow,
                index % 2 === 1 ? styles.tableRowEven : {}
              ]}
              wrap={false}
            >
              <Text style={[styles.cell, styles.colName]}>
                {user.name || ''}
              </Text>
              <Text style={[styles.cell, styles.colEmail]}>
                {user.email || ''}
              </Text>
              <Text style={[styles.cell, styles.colRole]}>
                {getRoleDisplay(user.isSportsFestAdmin)}
              </Text>
              <Text style={[styles.cell, styles.colOrganization]}>
                {user.organizationName || 'No organization'}
              </Text>
              <Text style={[styles.cell, styles.colStatus]}>
                {getStatusDisplay(user.isActive)}
              </Text>
              <Text style={[styles.cell, styles.colLastLogin]}>
                {user.lastLogin ? format(new Date(user.lastLogin), 'MMM dd, yyyy') : 'Never'}
              </Text>
              <Text style={[styles.cell, styles.colCreated]}>
                {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : ''}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footer} fixed>
          SportsFest Admin Report • Generated on {currentDate}
        </Text>
      </Page>
    </Document>
  );
}