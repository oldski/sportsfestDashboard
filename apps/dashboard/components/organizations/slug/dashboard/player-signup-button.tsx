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
  /** Render as a text link instead of a button */
  asLink?: boolean;
  /** Custom text/children (only used when asLink is true) */
  children?: React.ReactNode;
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
  className,
  asLink,
  children
}: PlayerSignUpButtonProps) {
  const [showShareModal, setShowShareModal] = React.useState(false);

  return (
    <>
      {asLink ? (
        <button
          type="button"
          onClick={() => setShowShareModal(true)}
          className={className ?? "block font-semibold hover:underline text-left text-primary"}
        >
          {children ?? 'Grow Your Player Interest'}
        </button>
      ) : (
        <Button
          onClick={() => setShowShareModal(true)}
          variant="default"
          size="sm"
          className={className}
        >
          <ShareIcon className="h-4 w-4 mr-2" />
          Share Player Signup
        </Button>
      )}

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
