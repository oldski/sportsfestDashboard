'use client';

import * as React from 'react';
import { ShareIcon } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { SignupShareModal } from './signup-share-modal';

interface PlayerSignUpButtonProps {
  organizationSlug: string;
  className?: string;
}

export function PlayerSignUpButton({ organizationSlug, className }: PlayerSignUpButtonProps) {
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
      />
    </>
  );
}
