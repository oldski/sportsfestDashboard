'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, pdf } from '@react-pdf/renderer';
import type { CompanyTeamDetails } from '~/data/teams/get-company-team-by-id';
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
    height: 55.5, // Maintains 400:222 aspect ratio (100 * 222/400 = 55.5)
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
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 5,
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
  emailCell: {
    width: '35%',
  },
  roleCell: {
    width: '20%',
  },
  captain: {
    color: '#dc2626',
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
  memberCount: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 10,
  },
});

interface TeamRosterPDFProps {
  teamData: CompanyTeamDetails;
  organizationName: string;
  logoBase64?: string;
}

const TeamRosterPDF: React.FC<TeamRosterPDFProps> = ({ teamData, organizationName, logoBase64 }) => {
  // Sort members with captains first
  const sortedMembers = teamData.members.sort((a, b) => {
    if (a.isCaptain !== b.isCaptain) return b.isCaptain ? 1 : -1;
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
            <Text style={styles.subtitle}>Team Roster Report</Text>
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

        {/* Members Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellHeader, styles.nameCell]}>Name</Text>
            <Text style={[styles.tableCellHeader, styles.phoneCell]}>Phone</Text>
            <Text style={[styles.tableCellHeader, styles.emailCell]}>Email</Text>
            <Text style={[styles.tableCellHeader, styles.roleCell]}>Role</Text>
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
              <Text style={[styles.tableCell, styles.nameCell]}>
                {member.firstName} {member.lastName}
              </Text>
              <Text style={[styles.tableCell, styles.phoneCell]}>
                {member.phone ? formatPhoneNumber(member.phone) : 'N/A'}
              </Text>
              <Text style={[styles.tableCell, styles.emailCell]}>
                {member.email}
              </Text>
              <Text
                style={
                  member.isCaptain
                    ? [styles.tableCell, styles.roleCell, styles.captain]
                    : [styles.tableCell, styles.roleCell]
                }
              >
                {member.isCaptain ? 'Captain' : 'Member'}
              </Text>
            </View>
          ))}
        </View>

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
export const generateTeamRosterReactPDF = async (
  teamData: CompanyTeamDetails,
  organizationName: string
) => {
  try {
    // Load logo first
    const logoBase64 = await loadLogoAsBase64();

    const blob = await pdf(
      <TeamRosterPDF
        teamData={teamData}
        organizationName={organizationName}
        logoBase64={logoBase64 || undefined}
      />
    ).toBlob();

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Team_${teamData.teamNumber}_Roster_ReactPDF.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating team roster PDF with react-pdf:', error);
  }
};

export default TeamRosterPDF;