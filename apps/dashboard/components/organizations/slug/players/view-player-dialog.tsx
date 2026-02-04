'use client';

import * as React from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { format } from 'date-fns';
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  CalendarIcon,
  ShirtIcon,
  ClipboardCheckIcon,
  FileCheckIcon
} from 'lucide-react';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@workspace/ui/components/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter
} from '@workspace/ui/components/drawer';
import { Rating } from '@workspace/ui/components/rating';
import { Separator } from '@workspace/ui/components/separator';
import { useMediaQuery } from '@workspace/ui/hooks/use-media-query';

import type { PlayerWithDetails } from '~/data/players/get-players';
import { formatPhoneNumber } from '~/lib/formatters';

interface ViewPlayerDialogProps {
  player: PlayerWithDetails;
  organizationId: string;
}

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

function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'registered':
      return 'secondary';
    case 'confirmed':
      return 'default';
    case 'checked_in':
      return 'default';
    case 'no_show':
      return 'destructive';
    case 'inactive':
      return 'destructive';
    default:
      return 'outline';
  }
}

function getEventTypeDisplay(eventType: string): string {
  const eventTypes: Record<string, string> = {
    beach_volleyball: 'Beach Volleyball',
    tug_of_war: 'Tug of War',
    corn_toss: 'Corn Toss',
    bote_beach_challenge: 'Surf & Turf Relay',
    beach_dodgeball: 'Beach Dodgeball'
  };
  // Return mapped value or format the raw string (replace _ with space, capitalize each word)
  return eventTypes[eventType]
}

function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export const ViewPlayerDialog = NiceModal.create<ViewPlayerDialogProps>(
  ({ player }) => {
    const modal = useModal();
    const isDesktop = useMediaQuery('(min-width: 1024px)');
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    const handleClose = () => {
      modal.hide();
    };

    if (!mounted) {
      return null;
    }

    const desktopContent = (
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              {player.firstName} {player.lastName}
            </h3>
            <Badge variant={getStatusBadgeVariant(player.status)}>
              {player.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Contact Info + Personal Info - Side by Side (1:2 ratio) */}
        <div className="grid grid-cols-3 gap-6">
          {/* Contact Info - 1 column */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Contact Information</h4>
            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <MailIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm break-all">{player.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <PhoneIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">
                  {player.phone ? formatPhoneNumber(player.phone) : 'Not provided'}
                </span>
              </div>
            </div>
          </div>

          {/* Personal Info - 2 columns */}
          <div className="col-span-2 space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Personal Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarIcon className="h-4 w-4" />
                  <span className="text-xs">Date of Birth</span>
                </div>
                <p className="text-sm font-medium">
                  {format(new Date(player.dateOfBirth), 'MMM dd, yyyy')}
                </p>
                <p className="text-xs text-muted-foreground">
                  ({calculateAge(player.dateOfBirth)} years old)
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <UserIcon className="h-4 w-4" />
                  <span className="text-xs">Gender</span>
                </div>
                <p className="text-sm font-medium">{getGenderDisplay(player.gender)}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShirtIcon className="h-4 w-4" />
                  <span className="text-xs">T-Shirt Size</span>
                </div>
                <p className="text-sm font-medium">{player.tshirtSize.toUpperCase()}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarIcon className="h-4 w-4" />
                  <span className="text-xs">Registered</span>
                </div>
                <p className="text-sm font-medium">
                  {format(new Date(player.createdAt), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Confirmations + Event Year - Side by Side */}
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Confirmations</h4>
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <ClipboardCheckIcon className={`h-4 w-4 ${player.accuracyConfirmed ? 'text-green-600' : 'text-muted-foreground'}`} />
                <span className="text-sm">
                  Accuracy {player.accuracyConfirmed ? 'Confirmed' : 'Not Confirmed'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileCheckIcon className={`h-4 w-4 ${player.waiverSigned ? 'text-green-600' : 'text-muted-foreground'}`} />
                <span className="text-sm">
                  Waiver {player.waiverSigned ? 'Signed' : 'Not Signed'}
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Event Year</h4>
            <p className="text-sm font-medium">{player.eventYear.name}</p>
          </div>
        </div>

        {/* Event Interests - Full Width */}
        {player.eventInterests && player.eventInterests.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Event Interests</h4>
              <div className="grid grid-cols-2 gap-2">
                {player.eventInterests
                  .sort((a, b) => a.interestRating - b.interestRating)
                  .map((interest) => (
                    <div
                      key={interest.eventType}
                      className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2"
                    >
                      <span className="text-sm font-medium">
                        {getEventTypeDisplay(interest.eventType)}
                      </span>
                      <Rating
                        value={6 - interest.interestRating}
                        totalStars={5}
                        size={14}
                        readOnly
                        variant="yellow"
                      />
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
    );

    const mobileContent = (
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              {player.firstName} {player.lastName}
            </h3>
            <Badge variant={getStatusBadgeVariant(player.status)}>
              {player.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Contact Info */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Contact Information</h4>
          <div className="grid gap-3">
            <div className="flex items-center gap-3">
              <MailIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{player.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <PhoneIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {player.phone ? formatPhoneNumber(player.phone) : 'Not provided'}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Personal Info */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Personal Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                <span className="text-xs">Date of Birth</span>
              </div>
              <p className="text-sm font-medium">
                {format(new Date(player.dateOfBirth), 'MMM dd, yyyy')}
              </p>
              <p className="text-xs text-muted-foreground">
                ({calculateAge(player.dateOfBirth)} years old)
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <UserIcon className="h-4 w-4" />
                <span className="text-xs">Gender</span>
              </div>
              <p className="text-sm font-medium">{getGenderDisplay(player.gender)}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShirtIcon className="h-4 w-4" />
                <span className="text-xs">T-Shirt Size</span>
              </div>
              <p className="text-sm font-medium">{player.tshirtSize.toUpperCase()}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                <span className="text-xs">Registered</span>
              </div>
              <p className="text-sm font-medium">
                {format(new Date(player.createdAt), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Confirmations */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Confirmations</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <ClipboardCheckIcon className={`h-4 w-4 ${player.accuracyConfirmed ? 'text-green-600' : 'text-muted-foreground'}`} />
              <span className="text-sm">
                Accuracy {player.accuracyConfirmed ? 'Confirmed' : 'Not Confirmed'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FileCheckIcon className={`h-4 w-4 ${player.waiverSigned ? 'text-green-600' : 'text-muted-foreground'}`} />
              <span className="text-sm">
                Waiver {player.waiverSigned ? 'Signed' : 'Not Signed'}
              </span>
            </div>
          </div>
        </div>

        {/* Event Interests */}
        {player.eventInterests && player.eventInterests.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Event Interests</h4>
              <div className="grid gap-2">
                {player.eventInterests
                  .sort((a, b) => a.interestRating - b.interestRating)
                  .map((interest) => (
                    <div
                      key={interest.eventType}
                      className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2"
                    >
                      <span className="text-sm font-medium">
                        {getEventTypeDisplay(interest.eventType)}
                      </span>
                      <Rating
                        value={6 - interest.interestRating}
                        totalStars={5}
                        size={14}
                        readOnly
                        variant="yellow"
                      />
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}

        {/* Event Year */}
        <Separator />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Event Year</span>
          <span className="font-medium text-foreground">{player.eventYear.name}</span>
        </div>
      </div>
    );

    const footer = (
      <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
        Close
      </Button>
    );

    if (isDesktop) {
      return (
        <Dialog open={modal.visible} onOpenChange={(open) => !open && handleClose()}>
          <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Player Details</DialogTitle>
              <DialogDescription>
                View detailed information about this player.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-1">
              {desktopContent}
            </div>
            <DialogFooter className="flex-shrink-0">
              {footer}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <Drawer open={modal.visible} onOpenChange={(open) => !open && handleClose()}>
        <DrawerContent className="max-h-[90vh] flex flex-col">
          <DrawerHeader className="text-left flex-shrink-0">
            <DrawerTitle>Player Details</DrawerTitle>
            <DrawerDescription>
              View detailed information about this player.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 flex-1 overflow-y-auto">
            {mobileContent}
          </div>
          <DrawerFooter className="flex-shrink-0">
            {footer}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
);
