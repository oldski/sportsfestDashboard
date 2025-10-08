'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, pdf } from '@react-pdf/renderer';
import type { CompanyTeamDetails } from '~/data/teams/get-company-team-by-id';
import type { EventRostersResult } from '~/data/teams/get-event-rosters';
import { EVENT_DISPLAY_INFO } from '~/lib/constants/events';
import { formatPhoneNumber } from '~/lib/formatters';

// Define styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 55.5, // Maintains 400:222 aspect ratio
    marginRight: 15,
  },
  headerText: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  organizationName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 15,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  teamInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 5,
  },
  eventDescription: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 1.4,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    minHeight: 32,
    alignItems: 'center',
  },
  tableRowEven: {
    backgroundColor: '#f9fafb',
  },
  tableCell: {
    fontSize: 9,
    color: '#374151',
    paddingRight: 8,
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1f2937',
    paddingRight: 8,
  },
  nameCell: {
    width: '25%',
  },
  phoneCell: {
    width: '20%',
  },
  roleCell: {
    width: '15%',
  },
  positionCell: {
    width: '20%',
  },
  genderCell: {
    width: '20%',
  },
  squadLeader: {
    color: '#dc2626',
    fontWeight: 'bold',
  },
  starter: {
    color: '#059669',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#6b7280',
  },
  playerCount: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 10,
  },
});

interface EventRosterPDFProps {
  teamData: CompanyTeamDetails;
  eventRostersData: EventRostersResult;
  eventType: string;
  organizationName: string;
  logoBase64?: string;
}

const EventRosterPDF: React.FC<EventRosterPDFProps> = ({
  teamData,
  eventRostersData,
  eventType,
  organizationName,
  logoBase64
}) => {
  const eventData = eventRostersData.eventRosters.find(e => e.eventType === eventType);
  const eventInfo = EVENT_DISPLAY_INFO[eventType as keyof typeof EVENT_DISPLAY_INFO];

  if (!eventData || eventData.players.length === 0) {
    return null;
  }

  // Sort players with squad leaders first, then starters
  const sortedPlayers = eventData.players.sort((a, b) => {
    if (a.squadLeader !== b.squadLeader) return b.squadLeader ? 1 : -1;
    if (a.isStarter !== b.isStarter) return b.isStarter ? 1 : -1;
    return a.firstName.localeCompare(b.firstName);
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Logo */}
        <View style={styles.header}>
          {logoBase64 && (
            <Image
              style={styles.logo}
              src={logoBase64}
            />
          )}
          <View style={styles.headerText}>
            <Text style={styles.title}>{teamData.eventYear.name}</Text>
            <Text style={styles.subtitle}>Event Roster Report</Text>
          </View>
        </View>

        {/* Organization Name */}
        <Text style={styles.organizationName}>{organizationName}</Text>

        {/* Event and Team Info */}
        <Text style={styles.eventTitle}>{eventInfo.title}</Text>
        <Text style={styles.teamInfo}>
          Team: {teamData.name || `Team ${teamData.teamNumber}`} • Team #{teamData.teamNumber}
        </Text>

        {/* Event Rules & Description */}
        <Text style={styles.sectionTitle}>Event Rules & Description</Text>
        <Text style={styles.eventDescription}>{eventInfo.description}</Text>

        {/* Players Section */}
        <Text style={styles.sectionTitle}>Assigned Players</Text>

        <Text style={styles.playerCount}>
          {sortedPlayers.length} player{sortedPlayers.length !== 1 ? 's' : ''} assigned
        </Text>

        {/* Players Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellHeader, styles.nameCell]}>Name</Text>
            <Text style={[styles.tableCellHeader, styles.phoneCell]}>Phone</Text>
            <Text style={[styles.tableCellHeader, styles.roleCell]}>Role</Text>
            <Text style={[styles.tableCellHeader, styles.positionCell]}>Position</Text>
            <Text style={[styles.tableCellHeader, styles.genderCell]}>Gender</Text>
          </View>

          {/* Table Rows */}
          {sortedPlayers.map((player, index) => (
            <View
              key={player.id}
              style={
                index % 2 === 1
                  ? [styles.tableRow, styles.tableRowEven]
                  : [styles.tableRow]
              }
            >
              <Text style={[styles.tableCell, styles.nameCell]}>
                {player.firstName} {player.lastName}
              </Text>
              <Text style={[styles.tableCell, styles.phoneCell]}>
                {player.phone ? formatPhoneNumber(player.phone) : 'N/A'}
              </Text>
              <Text
                style={
                  player.isStarter
                    ? [styles.tableCell, styles.roleCell, styles.starter]
                    : [styles.tableCell, styles.roleCell]
                }
              >
                {player.isStarter ? 'Starter' : 'Sub'}
              </Text>
              <Text
                style={
                  player.squadLeader
                    ? [styles.tableCell, styles.positionCell, styles.squadLeader]
                    : [styles.tableCell, styles.positionCell]
                }
              >
                {player.squadLeader ? 'Leader' : 'Player'}
              </Text>
              <Text style={[styles.tableCell, styles.genderCell]}>
                {player.gender.charAt(0).toUpperCase() + player.gender.slice(1)}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>SportsFest Event Management System</Text>
          <Text>Generated: {formatDate(new Date())}</Text>
        </View>
      </Page>
    </Document>
  );
};

// Function to load logo as base64
const loadLogoAsBase64 = async (): Promise<string | null> => {
  try {
    const response = await fetch('/assets/logo-sportsfest-full.png');
    if (!response.ok) return null;

    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to load logo:', error);
    return null;
  }
};

// Export function to generate and download the PDF
export const generateEventRosterReactPDF = async (
  teamData: CompanyTeamDetails,
  eventRostersData: EventRostersResult,
  eventType: string,
  organizationName: string
) => {
  try {
    // Load logo first
    const logoBase64 = await loadLogoAsBase64();

    const eventInfo = EVENT_DISPLAY_INFO[eventType as keyof typeof EVENT_DISPLAY_INFO];

    const blob = await pdf(
      <EventRosterPDF
        teamData={teamData}
        eventRostersData={eventRostersData}
        eventType={eventType}
        organizationName={organizationName}
        logoBase64={logoBase64 || undefined}
      />
    ).toBlob();

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Team_${teamData.teamNumber}_${eventInfo.title.replace(/\s+/g, '_')}_Roster_ReactPDF.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating event roster PDF with react-pdf:', error);
  }
};

export default EventRosterPDF;