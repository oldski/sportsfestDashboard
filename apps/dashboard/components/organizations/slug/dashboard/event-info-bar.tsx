'use client';

import * as React from 'react';
import {
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  ChevronDown
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

export type EventInfoBarProps = {
  currentEventYear: {
    id: string;
    name: string;
    eventEndDate: Date;
    registrationClose: Date;
    registrationOpen: boolean;
    locationName: string;
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
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{currentEventYear.locationName}</span>
          </div>
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
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{currentEventYear.locationName}</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </>
  );
}
