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
    padding: 15, // Reduced for more content
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  logo: {
    width: 80,
    height: 44.4, // Slightly smaller for multi-section document
    marginRight: 15,
  },
  headerText: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 11,
    color: '#666666',
    marginTop: 4,
  },
  organizationName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 12,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    marginTop: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 4,
  },
  eventSectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 6,
    marginTop: 12,
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 4,
  },
  eventDescription: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 1.3,
    fontStyle: 'italic',
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    minHeight: 24,
    alignItems: 'center',
  },
  tableRowEven: {
    backgroundColor: '#f9fafb',
  },
  tableCell: {
    fontSize: 8,
    color: '#374151',
    paddingRight: 6,
  },
  tableCellHeader: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1f2937',
    paddingRight: 6,
  },
  // Team roster columns
  teamNameCell: {
    width: '25%',
  },
  teamPhoneCell: {
    width: '20%',
  },
  teamEmailCell: {
    width: '35%',
  },
  teamRoleCell: {
    width: '20%',
  },
  // Event roster columns
  eventNameCell: {
    width: '30%',
  },
  eventPhoneCell: {
    width: '20%',
  },
  eventRoleCell: {
    width: '15%',
  },
  eventPositionCell: {
    width: '20%',
  },
  eventGenderCell: {
    width: '15%',
  },
  captain: {
    color: '#dc2626',
    fontWeight: 'bold',
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
    bottom: 15,
    left: 15,
    right: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#6b7280',
  },
  memberCount: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 8,
  },
});

interface AllRostersPDFProps {
  teamData: CompanyTeamDetails;
  eventRostersData: EventRostersResult;
  organizationName: string;
  logoBase64?: string;
}

const AllRostersPDF: React.FC<AllRostersPDFProps> = ({
  teamData,
  eventRostersData,
  organizationName,
  logoBase64
}) => {
  // Sort team members with captains first
  const sortedMembers = teamData.members.sort((a, b) => {
    if (a.isCaptain !== b.isCaptain) return b.isCaptain ? 1 : -1;
    return a.firstName.localeCompare(b.firstName);
  });

  // Get available event rosters
  const availableRosters = eventRostersData.eventRosters.filter(e => e.players.length > 0);

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
            <Text style={styles.subtitle}>Complete Team & Event Rosters Report</Text>
          </View>
        </View>

        {/* Organization Name */}
        <Text style={styles.organizationName}>{organizationName}</Text>

        {/* Team Name */}
        <Text style={styles.teamName}>
          {teamData.name || `Team ${teamData.teamNumber}`}
        </Text>

        {/* Team Members Section */}
        <Text style={styles.sectionTitle}>Team Members</Text>

        <Text style={styles.memberCount}>
          {sortedMembers.length} member{sortedMembers.length !== 1 ? 's' : ''}
        </Text>

        {/* Team Members Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellHeader, styles.teamNameCell]}>Name</Text>
            <Text style={[styles.tableCellHeader, styles.teamPhoneCell]}>Phone</Text>
            <Text style={[styles.tableCellHeader, styles.teamEmailCell]}>Email</Text>
            <Text style={[styles.tableCellHeader, styles.teamRoleCell]}>Role</Text>
          </View>

          {/* Table Rows */}
          {sortedMembers.map((member, index) => (
            <View
              key={member.id}
              style={
                index % 2 === 1
                  ? [styles.tableRow, styles.tableRowEven]
                  : [styles.tableRow]
              }
            >
              <Text style={[styles.tableCell, styles.teamNameCell]}>
                {member.firstName} {member.lastName}
              </Text>
              <Text style={[styles.tableCell, styles.teamPhoneCell]}>
                {member.phone ? formatPhoneNumber(member.phone) : 'N/A'}
              </Text>
              <Text style={[styles.tableCell, styles.teamEmailCell]}>
                {member.email}
              </Text>
              <Text
                style={
                  member.isCaptain
                    ? [styles.tableCell, styles.teamRoleCell, styles.captain]
                    : [styles.tableCell, styles.teamRoleCell]
                }
              >
                {member.isCaptain ? 'Captain' : 'Member'}
              </Text>
            </View>
          ))}
        </View>

        {/* Event Rosters */}
        {availableRosters.map((eventData, eventIndex) => {
          const eventInfo = EVENT_DISPLAY_INFO[eventData.eventType as keyof typeof EVENT_DISPLAY_INFO];

          // Sort players with squad leaders first, then starters
          const sortedPlayers = eventData.players.sort((a, b) => {
            if (a.squadLeader !== b.squadLeader) return b.squadLeader ? 1 : -1;
            if (a.isStarter !== b.isStarter) return b.isStarter ? 1 : -1;
            return a.firstName.localeCompare(b.firstName);
          });

          return (
            <View key={eventData.eventType}>
              {/* Event Section Title */}
              <Text style={styles.eventSectionTitle}>{eventInfo.title}</Text>

              {/* Event Description */}
              <Text style={styles.eventDescription}>{eventInfo.description}</Text>

              <Text style={styles.memberCount}>
                {sortedPlayers.length} player{sortedPlayers.length !== 1 ? 's' : ''} assigned
              </Text>

              {/* Event Roster Table */}
              <View style={styles.table}>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableCellHeader, styles.eventNameCell]}>Name</Text>
                  <Text style={[styles.tableCellHeader, styles.eventPhoneCell]}>Phone</Text>
                  <Text style={[styles.tableCellHeader, styles.eventRoleCell]}>Role</Text>
                  <Text style={[styles.tableCellHeader, styles.eventPositionCell]}>Position</Text>
                  <Text style={[styles.tableCellHeader, styles.eventGenderCell]}>Gender</Text>
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
                    <Text style={[styles.tableCell, styles.eventNameCell]}>
                      {player.firstName} {player.lastName}
                    </Text>
                    <Text style={[styles.tableCell, styles.eventPhoneCell]}>
                      {player.phone ? formatPhoneNumber(player.phone) : 'N/A'}
                    </Text>
                    <Text
                      style={
                        player.isStarter
                          ? [styles.tableCell, styles.eventRoleCell, styles.starter]
                          : [styles.tableCell, styles.eventRoleCell]
                      }
                    >
                      {player.isStarter ? 'Starter' : 'Sub'}
                    </Text>
                    <Text
                      style={
                        player.squadLeader
                          ? [styles.tableCell, styles.eventPositionCell, styles.squadLeader]
                          : [styles.tableCell, styles.eventPositionCell]
                      }
                    >
                      {player.squadLeader ? 'Leader' : 'Player'}
                    </Text>
                    <Text style={[styles.tableCell, styles.eventGenderCell]}>
                      {player.gender.charAt(0).toUpperCase() + player.gender.slice(1)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>SportsFest Team Management System</Text>
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
export const generateAllRostersReactPDF = async (
  teamData: CompanyTeamDetails,
  eventRostersData: EventRostersResult,
  organizationName: string
) => {
  try {
    // Load logo first
    const logoBase64 = await loadLogoAsBase64();

    const blob = await pdf(
      <AllRostersPDF
        teamData={teamData}
        eventRostersData={eventRostersData}
        organizationName={organizationName}
        logoBase64={logoBase64 || undefined}
      />
    ).toBlob();

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Team_${teamData.teamNumber}_All_Rosters_ReactPDF.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating all rosters PDF with react-pdf:', error);
  }
};

export default AllRostersPDF;