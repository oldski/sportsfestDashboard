'use client';

import * as React from 'react';
import { Download, FileText } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';

import type { CompanyTeamDetails } from '~/data/teams/get-company-team-by-id';
import type { EventRostersResult } from '~/data/teams/get-event-rosters';
import { EVENT_DISPLAY_INFO } from '~/lib/constants/events';
import { formatPhoneNumber } from '~/lib/formatters';
import { useActiveOrganization } from '~/hooks/use-active-organization';

interface RosterExportDropdownProps {
  teamData: CompanyTeamDetails;
  eventRostersData?: EventRostersResult;
}

export function RosterExportDropdown({
  teamData,
  eventRostersData
}: RosterExportDropdownProps) {
  const { name: organizationName } = useActiveOrganization();

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
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'N/A';
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(dateObj);
  };

  const generateTeamRosterPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = margin;

      // Add SportsFest Logo (maintaining 400:222 aspect ratio)
      const logoBase64 = await loadLogoAsBase64();
      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', margin, yPos, 45, 25); // Fixed aspect ratio
        yPos += 30;
      } else {
        // Fallback to text if logo fails to load
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('SportsFest', margin, yPos);
        yPos += 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Team Roster Report', margin, yPos);

      // Organization Name
      yPos += 20;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(organizationName, margin, yPos);

      // Team Info
      yPos += 15;
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(teamData.name || `Team ${teamData.teamNumber}`, margin, yPos);

      yPos += 35;

      // Members Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Team Members', margin, yPos);

      yPos += 10;

      // Table header
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Name', margin, yPos);
      doc.text('Phone', margin + 50, yPos);
      doc.text('Email', margin + 95, yPos);
      doc.text('Role', margin + 150, yPos);

      yPos += 10; // Increased spacing
      doc.setLineWidth(0.1);
      doc.line(margin, yPos - 4, pageWidth - margin, yPos - 4); // Moved line down

      // Members data
      doc.setFont('helvetica', 'normal');
      teamData.members
        .sort((a, b) => {
          if (a.isCaptain !== b.isCaptain) return b.isCaptain ? 1 : -1;
          return a.firstName.localeCompare(b.firstName);
        })
        .forEach((member) => {
          if (yPos > 250) {
            doc.addPage();
            yPos = margin;
          }

          doc.text(`${member.firstName} ${member.lastName}`, margin, yPos);
          doc.text(formatPhoneNumber(member.phone), margin + 50, yPos);
          doc.text(member.email, margin + 95, yPos);
          doc.text(member.isCaptain ? 'Captain' : 'Member', margin + 150, yPos);

          yPos += 8;
        });

      // Footer
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('SportsFest Team Management System', margin, pageHeight - 20);
      doc.text(`Generated: ${formatDate(new Date())}`, pageWidth - margin, pageHeight - 20, { align: 'right' });

      doc.save(`Team_${teamData.teamNumber}_Roster.pdf`);
    } catch (error) {
      console.error('Error generating team roster PDF:', error);
    }
  };

  const generateEventRosterPDF = async (eventType: string) => {
    if (!eventRostersData) return;

    const eventData = eventRostersData.eventRosters.find(e => e.eventType === eventType);
    if (!eventData || eventData.players.length === 0) return;

    const eventInfo = EVENT_DISPLAY_INFO[eventType as keyof typeof EVENT_DISPLAY_INFO];

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = margin;

      // Add SportsFest Logo (maintaining 400:222 aspect ratio)
      const logoBase64 = await loadLogoAsBase64();
      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', margin, yPos, 45, 25); // Fixed aspect ratio
        yPos += 30;
      } else {
        // Fallback to text if logo fails to load
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('SportsFest', margin, yPos);
        yPos += 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Event Roster Report', margin, yPos);

      // Organization Name
      yPos += 20;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(organizationName, margin, yPos);

      // Event Info
      yPos += 15;
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(`${eventInfo.title} - ${teamData.name || `Team ${teamData.teamNumber}`}`, margin, yPos);

      yPos += 25;

      // Event Rules
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Event Rules & Description', margin, yPos);

      yPos += 10;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const splitText = doc.splitTextToSize(eventInfo.description, pageWidth - (margin * 2));
      doc.text(splitText, margin, yPos);
      yPos += splitText.length * 6 + 10;

      // Players Section
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Assigned Players', margin, yPos);

      yPos += 10;

      // Table header
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Name', margin, yPos);
      doc.text('Phone', margin + 50, yPos);
      doc.text('Role', margin + 95, yPos);
      doc.text('Position', margin + 125, yPos);
      doc.text('Gender', margin + 155, yPos);

      yPos += 10; // Increased spacing
      doc.setLineWidth(0.1);
      doc.line(margin, yPos - 4, pageWidth - margin, yPos - 4); // Moved line down

      // Players data
      doc.setFont('helvetica', 'normal');
      eventData.players
        .sort((a, b) => {
          if (a.squadLeader !== b.squadLeader) return b.squadLeader ? 1 : -1;
          if (a.isStarter !== b.isStarter) return b.isStarter ? 1 : -1;
          return a.firstName.localeCompare(b.firstName);
        })
        .forEach((player) => {
          if (yPos > 250) {
            doc.addPage();
            yPos = margin;
          }

          doc.text(`${player.firstName} ${player.lastName}`, margin, yPos);
          doc.text(formatPhoneNumber(player.phone), margin + 50, yPos);
          doc.text(player.isStarter ? 'Starter' : 'Sub', margin + 95, yPos);
          doc.text(player.squadLeader ? 'Leader' : 'Player', margin + 125, yPos);
          doc.text(player.gender.charAt(0).toUpperCase() + player.gender.slice(1), margin + 155, yPos);

          yPos += 8;
        });

      // Footer
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('SportsFest Event Management System', margin, pageHeight - 20);
      doc.text(`Generated: ${formatDate(new Date())}`, pageWidth - margin, pageHeight - 20, { align: 'right' });

      doc.save(`Team_${teamData.teamNumber}_${eventInfo.title.replace(/\s+/g, '_')}_Roster.pdf`);
    } catch (error) {
      console.error('Error generating event roster PDF:', error);
    }
  };

  const generateAllRostersPDF = async () => {
    if (!eventRostersData) return;

    const availableRosters = eventRostersData.eventRosters.filter(e => e.players.length > 0);
    if (availableRosters.length === 0) return;

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15; // Reduced margin for better space utilization
      let yPos = margin;

      // Add SportsFest Logo
      const logoBase64 = await loadLogoAsBase64();
      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', margin, yPos, 40, 15);
        yPos += 20;
      } else {
        // Fallback to text if logo fails to load
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('SportsFest', margin, yPos);
        yPos += 15;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Complete Team & Event Rosters Report', margin, yPos);

      // Organization Name
      yPos += 20;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(organizationName, margin, yPos);

      // Team Info
      yPos += 15;
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(teamData.name || `Team ${teamData.teamNumber}`, margin, yPos);

      yPos += 35;

      // Team Roster Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Team Members', margin, yPos);

      yPos += 10;

      // Table header
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Name', margin, yPos);
      doc.text('Phone', margin + 50, yPos);
      doc.text('Email', margin + 95, yPos);
      doc.text('Role', margin + 150, yPos);

      yPos += 10; // Increased spacing
      doc.setLineWidth(0.1);
      doc.line(margin, yPos - 4, pageWidth - margin, yPos - 4); // Moved line down

      // Members data
      doc.setFont('helvetica', 'normal');
      teamData.members
        .sort((a, b) => {
          if (a.isCaptain !== b.isCaptain) return b.isCaptain ? 1 : -1;
          return a.firstName.localeCompare(b.firstName);
        })
        .forEach((member) => {
          if (yPos > 250) {
            doc.addPage();
            yPos = margin;
          }

          doc.text(`${member.firstName} ${member.lastName}`, margin, yPos);
          doc.text(formatPhoneNumber(member.phone), margin + 50, yPos);
          doc.text(member.email, margin + 95, yPos);
          doc.text(member.isCaptain ? 'Captain' : 'Member', margin + 150, yPos);

          yPos += 8;
        });

      yPos += 15;

      // Event Rosters
      for (const eventData of availableRosters) {
        if (yPos > 220) { // Increased threshold for tighter spacing
          doc.addPage();
          yPos = margin;
        }

        const eventInfo = EVENT_DISPLAY_INFO[eventData.eventType as keyof typeof EVENT_DISPLAY_INFO];

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`${eventInfo.title}`, margin, yPos);

        yPos += 8;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const splitText = doc.splitTextToSize(`Rules: ${eventInfo.description}`, pageWidth - (margin * 2));
        doc.text(splitText, margin, yPos);
        yPos += splitText.length * 4 + 10;

        // Event roster table header
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Name', margin, yPos);
        doc.text('Phone', margin + 50, yPos);
        doc.text('Role', margin + 95, yPos);
        doc.text('Position', margin + 125, yPos);
        doc.text('Gender', margin + 155, yPos);

        yPos += 10; // Increased spacing
        doc.setLineWidth(0.1);
        doc.line(margin, yPos - 4, pageWidth - margin, yPos - 4); // Moved line down

        // Event roster data
        doc.setFont('helvetica', 'normal');
        eventData.players
          .sort((a, b) => {
            if (a.squadLeader !== b.squadLeader) return b.squadLeader ? 1 : -1;
            if (a.isStarter !== b.isStarter) return b.isStarter ? 1 : -1;
            return a.firstName.localeCompare(b.firstName);
          })
          .forEach((player) => {
            if (yPos > 265) { // Increased threshold for tighter spacing
              doc.addPage();
              yPos = margin;
            }

            doc.text(`${player.firstName} ${player.lastName}`, margin, yPos);
            doc.text(formatPhoneNumber(player.phone), margin + 50, yPos);
            doc.text(player.isStarter ? 'Starter' : 'Sub', margin + 95, yPos);
            doc.text(player.squadLeader ? 'Leader' : 'Player', margin + 125, yPos);
            doc.text(player.gender.charAt(0).toUpperCase() + player.gender.slice(1), margin + 155, yPos);

            yPos += 8;
          });

        yPos += 10;
      }

      // Footer
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('SportsFest Team Management System', margin, pageHeight - 20);
      doc.text(`Generated: ${formatDate(new Date())}`, pageWidth - margin, pageHeight - 20, { align: 'right' });

      doc.save(`Team_${teamData.teamNumber}_All_Rosters.pdf`);
    } catch (error) {
      console.error('Error generating all rosters PDF:', error);
    }
  };

  // Get available event rosters
  const availableEventRosters = eventRostersData?.eventRosters.filter(e => e.players.length > 0) || [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export Rosters
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={generateTeamRosterPDF} className="gap-2">
          <FileText className="h-4 w-4" />
          Team Roster
        </DropdownMenuItem>

        {availableEventRosters.length > 0 && (
          <>
            <DropdownMenuSeparator />
            {availableEventRosters.map((eventData) => {
              const eventInfo = EVENT_DISPLAY_INFO[eventData.eventType as keyof typeof EVENT_DISPLAY_INFO];
              return (
                <DropdownMenuItem
                  key={eventData.eventType}
                  onClick={() => generateEventRosterPDF(eventData.eventType)}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  {eventInfo.title} Roster
                </DropdownMenuItem>
              );
            })}

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={generateAllRostersPDF} className="gap-2 font-medium">
              <Download className="h-4 w-4" />
              Export All Rosters
            </DropdownMenuItem>
          </>
        )}

        {availableEventRosters.length === 0 && eventRostersData && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              No event rosters available
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}