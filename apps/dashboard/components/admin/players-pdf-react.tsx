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
import type { PlayerData } from '~/actions/admin/get-players';

// Helper function to get gender display text
function getGenderDisplay(gender: string) {
  switch (gender) {
    case 'male':
      return 'Male';
    case 'female':
      return 'Female';
    case 'non_binary':
      return 'Non-binary';
    case 'prefer_not_to_say':
      return 'Prefer not to say';
    default:
      return gender;
  }
}

// Helper function to get status display text
function getStatusDisplay(status: string) {
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
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
  // Column widths for admin table with additional columns
  colFirstName: { width: '10%' },
  colLastName: { width: '10%' },
  colOrganization: { width: '15%' },
  colEmail: { width: '15%' },
  colPhone: { width: '10%' },
  colGender: { width: '8%' },
  colTShirt: { width: '6%' },
  colStatus: { width: '8%' },
  colWaiver: { width: '8%' },
  colRegistered: { width: '10%' },
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

export interface AdminPlayersReactPDFProps {
  players: PlayerData[];
  eventYearName?: string;
}

export function AdminPlayersReactPDF({
  players,
  eventYearName,
}: AdminPlayersReactPDFProps): React.JSX.Element {
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
            SportsFest Admin Players Report
          </Text>
          <Text style={styles.subtitle}>
            {eventYearName ? `Event Year: ${eventYearName}` : 'All Players'} • Total: {players.length} players
          </Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader} fixed>
            <Text style={[styles.headerCell, styles.colFirstName]}>First Name</Text>
            <Text style={[styles.headerCell, styles.colLastName]}>Last Name</Text>
            <Text style={[styles.headerCell, styles.colOrganization]}>Organization</Text>
            <Text style={[styles.headerCell, styles.colEmail]}>Email</Text>
            <Text style={[styles.headerCell, styles.colPhone]}>Phone</Text>
            <Text style={[styles.headerCell, styles.colGender]}>Gender</Text>
            <Text style={[styles.headerCell, styles.colTShirt]}>T-Shirt</Text>
            <Text style={[styles.headerCell, styles.colStatus]}>Status</Text>
            <Text style={[styles.headerCell, styles.colWaiver]}>Waiver</Text>
            <Text style={[styles.headerCell, styles.colRegistered]}>Registered</Text>
          </View>

          {/* Table Rows */}
          {players.map((player, index) => (
            <View
              key={player.id}
              style={[
                styles.tableRow,
                index % 2 === 1 ? styles.tableRowEven : {}
              ]}
              wrap={false}
            >
              <Text style={[styles.cell, styles.colFirstName]}>
                {player.firstName || ''}
              </Text>
              <Text style={[styles.cell, styles.colLastName]}>
                {player.lastName || ''}
              </Text>
              <Text style={[styles.cell, styles.colOrganization]}>
                {player.organizationName || ''}
              </Text>
              <Text style={[styles.cell, styles.colEmail]}>
                {player.email || ''}
              </Text>
              <Text style={[styles.cell, styles.colPhone]}>
                {player.phone || 'N/A'}
              </Text>
              <Text style={[styles.cell, styles.colGender]}>
                {getGenderDisplay(player.gender)}
              </Text>
              <Text style={[styles.cell, styles.colTShirt]}>
                {player.tshirtSize ? player.tshirtSize.toUpperCase() : ''}
              </Text>
              <Text style={[styles.cell, styles.colStatus]}>
                {getStatusDisplay(player.status)}
              </Text>
              <Text style={[styles.cell, styles.colWaiver]}>
                {player.waiverSigned ? 'Signed' : 'Pending'}
              </Text>
              <Text style={[styles.cell, styles.colRegistered]}>
                {player.createdAt ? format(new Date(player.createdAt), 'MMM dd, yyyy') : ''}
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