'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';

import {Card, CardContent, CardHeader, CardTitle} from '@workspace/ui/components/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@workspace/ui/components/collapsible';
import { cn } from '@workspace/ui/lib/utils';

export type TeamSidebarCollapsibleProps = {
  children: React.ReactNode;
};

export function TeamSidebarCollapsible({
  children
}: TeamSidebarCollapsibleProps): React.JSX.Element {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {/* Desktop: Always show content as normal card */}
      <div className="hidden lg:block">
        <Card>
          <CardHeader>
            <CardTitle>Team Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {children}
          </CardContent>
        </Card>
      </div>

      {/* Mobile/Tablet: Show as collapsible card */}
      <div className="lg:hidden">
        <Card className="p-0">
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-lg font-semibold hover:bg-muted/50">
              <span>Team Statistics</span>
              <ChevronDown
                className={cn(
                  'h-5 w-5 shrink-0 transition-transform',
                  isOpen && 'rotate-180'
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4 pt-0 pb-4">
                {children}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    </>
  );
}
