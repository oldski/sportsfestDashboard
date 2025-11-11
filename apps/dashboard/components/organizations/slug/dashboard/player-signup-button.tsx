'use client';

import * as React from 'react';
import { ShareIcon } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { SignupShareModal } from './signup-share-modal';

interface PlayerSignUpButtonProps {
  organizationSlug: string;
  className?: string;
  organizationName: string;
  eventYearName: string;
  eventDate: Date;
  locationName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number | null;
  longitude: number | null;
}

export function PlayerSignUpButton({
  organizationSlug,
  organizationName,
  eventYearName,
  eventDate,
  locationName,
  address,
  city,
  state,
  zipCode,
  latitude,
  longitude,
  className
}: PlayerSignUpButtonProps) {
  const [showShareModal, setShowShareModal] = React.useState(false);

  return (
    <>
      <Button
        onClick={() => setShowShareModal(true)}
        variant="default"
        size="sm"
        className={className}
      >
        <ShareIcon className="h-4 w-4 mr-2" />
        Share Player Signup
      </Button>

      <SignupShareModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        organizationSlug={organizationSlug}
        organizationName={organizationName}
        eventYearName={eventYearName}
        eventDate={eventDate}
        locationName={locationName}
        address={address}
        city={city}
        state={state}
        zipCode={zipCode}
        latitude={latitude}
        longitude={longitude}
      />
    </>
  );
}
