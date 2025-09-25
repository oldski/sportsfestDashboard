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
import type { PlayerWithDetails } from '~/data/players/get-players';

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
  tableFirstPage: {
    width: '100%',
    flex: 1,
    marginBottom: 60, // Space for footer
  },
  tableSubsequentPage: {
    width: '100%',
    flex: 1,
    marginTop: 20,
    marginBottom: 60, // Space for footer
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
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'left',
  },
  cell: {
    fontSize: 8,
    color: '#1f2937',
    textAlign: 'left',
  },
  // Column widths
  colFirstName: { width: '12%' },
  colLastName: { width: '12%' },
  colEmail: { width: '20%' },
  colPhone: { width: '12%' },
  colGender: { width: '10%' },
  colAge: { width: '8%' },
  colTShirt: { width: '8%' },
  colRegistered: { width: '18%' },
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

export interface PlayersReactPDFProps {
  players: PlayerWithDetails[];
  organizationName: string;
  eventYearName?: string;
}

export function PlayersReactPDF({
  players,
  organizationName,
  eventYearName,
}: PlayersReactPDFProps): React.JSX.Element {
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
            {organizationName} Players
          </Text>
          <Text style={styles.subtitle}>
            {eventYearName ? `Event Year: ${eventYearName}` : 'All Players'}
          </Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader} fixed>
            <Text style={[styles.headerCell, styles.colFirstName]}>First Name</Text>
            <Text style={[styles.headerCell, styles.colLastName]}>Last Name</Text>
            <Text style={[styles.headerCell, styles.colEmail]}>Email</Text>
            <Text style={[styles.headerCell, styles.colPhone]}>Phone</Text>
            <Text style={[styles.headerCell, styles.colGender]}>Gender</Text>
            <Text style={[styles.headerCell, styles.colAge]}>Age</Text>
            <Text style={[styles.headerCell, styles.colTShirt]}>T-Shirt</Text>
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
              <Text style={[styles.cell, styles.colEmail]}>
                {player.email || ''}
              </Text>
              <Text style={[styles.cell, styles.colPhone]}>
                {player.phone || ''}
              </Text>
              <Text style={[styles.cell, styles.colGender]}>
                {getGenderDisplay(player.gender)}
              </Text>
              <Text style={[styles.cell, styles.colAge]}>
                {player.dateOfBirth
                  ? `${new Date().getFullYear() - new Date(player.dateOfBirth).getFullYear()}`
                  : ''
                }
              </Text>
              <Text style={[styles.cell, styles.colTShirt]}>
                {player.tshirtSize ? player.tshirtSize.toUpperCase() : ''}
              </Text>
              <Text style={[styles.cell, styles.colRegistered]}>
                {player.createdAt ? format(new Date(player.createdAt), 'MMM dd, yyyy') : ''}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footer} fixed>
          Generated on {currentDate}
        </Text>
      </Page>
    </Document>
  );
}