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

const EVENT_TYPES: Record<string, string> = {
  beach_volleyball: 'Beach VB',
  tug_of_war: 'Tug of War',
  corn_toss: 'Corn Toss',
  bote_beach_challenge: 'Surf & Turf',
  beach_dodgeball: 'Dodgeball',
};

const EVENT_TYPE_KEYS = Object.keys(EVENT_TYPES);

const STAR_FILLED = 'data:image/jpeg;base64,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';
const STAR_EMPTY = 'data:image/jpeg;base64,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';


function PdfStarRating({ player, eventType }: { player: PlayerWithDetails; eventType: string }): React.JSX.Element | null {
  const interest = player.eventInterests.find(i => i.eventType === eventType);
  if (!interest) return null;
  const filled = 6 - interest.interestRating;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {Array.from({ length: 5 }, (_, i) => (
        <Image
          key={i}
          src={i < filled ? STAR_FILLED : STAR_EMPTY}
          style={{ width: 7, height: 7, marginRight: 0.5 }}
        />
      ))}
    </View>
  );
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
  colFirstName: { width: '10%' },
  colLastName: { width: '10%' },
  colEmail: { width: '15%' },
  colPhone: { width: '10%' },
  colGender: { width: '7%' },
  colAge: { width: '5%' },
  colTShirt: { width: '5%' },
  colEvent: { width: '6.6%' },
  colRegistered: { width: '9%' },
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
            {EVENT_TYPE_KEYS.map(eventType => (
              <Text key={eventType} style={[styles.headerCell, styles.colEvent]}>{EVENT_TYPES[eventType]}</Text>
            ))}
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
              {EVENT_TYPE_KEYS.map(eventType => (
                <View key={eventType} style={[styles.colEvent, { justifyContent: 'center' }]}>
                  <PdfStarRating player={player} eventType={eventType} />
                </View>
              ))}
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