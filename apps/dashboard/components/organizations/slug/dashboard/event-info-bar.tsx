'use client';

import * as React from 'react';
import {
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  ChevronDown,
  ExternalLinkIcon
} from 'lucide-react';
import { Badge } from '@workspace/ui/components/badge';
import { Separator } from '@workspace/ui/components/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@workspace/ui/components/collapsible';
import { cn } from '@workspace/ui/lib/utils';
import { formatDateLong } from '~/lib/formatters';
import Link from "next/link";

export type EventInfoBarProps = {
  currentEventYear: {
    id: string;
    name: string;
    eventEndDate: Date;
    registrationClose: Date;
    registrationOpen: boolean;
    locationName: string;
    latitude: number | null;
    longitude: number | null;
  };
};

export function EventInfoBar({ currentEventYear }: EventInfoBarProps): React.JSX.Element {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {/* Desktop: Always show full info */}
      <div className="hidden lg:flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm w-full">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{currentEventYear.name}</span>
          <Separator orientation="vertical" />
          <span className="text-muted-foreground">{formatDateLong(currentEventYear.eventEndDate)}</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Registration Deadline: {formatDateLong(currentEventYear.registrationClose)}</span>
            <Badge
              variant={currentEventYear.registrationOpen ? 'default' : 'destructive'}
              className="text-xs ml-1"
            >
              {currentEventYear.registrationOpen ? 'Open' : 'Closed'}
            </Badge>
          </div>
          <Link
            href={`https://www.google.com/maps/dir/?api=1&destination=${currentEventYear.latitude},${currentEventYear.longitude}`}
            target="_blank"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <MapPinIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="group-hover:underline">{currentEventYear.locationName}</span>
            <ExternalLinkIcon className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      </div>

      {/* Mobile/Tablet: Collapsible */}
      <div className="lg:hidden w-full relative">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{currentEventYear.name}</span>
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 shrink-0 transition-transform text-muted-foreground',
                isOpen && 'rotate-180'
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="absolute top-full left-0 right-0 z-10 bg-background rounded-b-lg border-t border-border/50 mt-0 shadow-md">
            <div className="p-3 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{formatDateLong(currentEventYear.eventEndDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Registration Deadline: {formatDateLong(currentEventYear.registrationClose)}</span>
                <Badge
                  variant={currentEventYear.registrationOpen ? 'default' : 'destructive'}
                  className="text-xs ml-1"
                >
                  {currentEventYear.registrationOpen ? 'Open' : 'Closed'}
                </Badge>
              </div>
              <Link
                href={`https://www.google.com/maps/dir/?api=1&destination=${currentEventYear.latitude},${currentEventYear.longitude}`}
                target="_blank"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
              >
                <MapPinIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="group-hover:underline">{currentEventYear.locationName}</span>
                <ExternalLinkIcon className="h-3 w-3 transition-opacity" />
              </Link>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </>
  );
}
