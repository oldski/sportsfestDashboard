import * as React from 'react';
import Link from 'next/link';
import { CalendarIcon, MapPinIcon, ClockIcon, ExternalLinkIcon } from 'lucide-react';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';

import { getOrganizationDashboardStats } from '~/data/organization/get-organization-dashboard-stats';

export default async function GameDayInformationPage(): Promise<React.JSX.Element> {
  const stats = await getOrganizationDashboardStats();
  const { currentEventYear } = stats;

  // Format dates
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  const formatDateShort = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  // Create Google Maps URL
  const mapsUrl = currentEventYear.id
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${currentEventYear.locationName} ${currentEventYear.address} ${currentEventYear.city}, ${currentEventYear.state}`)}`
    : '#';

  if (!currentEventYear.id) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Event Information
          </CardTitle>
          <CardDescription>No active event scheduled</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Check back later for event details.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center">
          <CalendarIcon className="h-4 w-4 mr-2" />
          {currentEventYear.name}
        </CardTitle>
        <CardDescription>
          {formatDate(currentEventYear.eventEndDate)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="flex items-start space-x-3">
            <MapPinIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">{currentEventYear.locationName}</p>
              <p className="text-sm text-muted-foreground">
                {currentEventYear.address}<br />
                {currentEventYear.city}, {currentEventYear.state} {currentEventYear.zipCode}
              </p>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <Link href={mapsUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLinkIcon className="h-3 w-3 mr-1" />
                  Get Directions
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Registration Deadline</p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  {formatDateShort(currentEventYear.registrationClose)}
                </p>
                <Badge
                  variant={currentEventYear.registrationOpen ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {currentEventYear.registrationOpen ? 'Open' : 'Closed'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
