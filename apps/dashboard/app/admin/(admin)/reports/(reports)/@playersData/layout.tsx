import * as React from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@workspace/ui/components/card";
import {UsersIcon} from "lucide-react";

interface PlayersDataLayoutProps {
  playersByAgeGroup: React.ReactNode;
  playersByGender: React.ReactNode;
  playersFavoriteEvents: React.ReactNode;
}

export default function PlayersDataLayout({
  playersByAgeGroup,
  playersByGender,
  playersFavoriteEvents,
  children
}: PlayersDataLayoutProps & React.PropsWithChildren): React.JSX.Element {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <UsersIcon className="mr-2 h-4 w-4" />
            Player Analytics
          </CardTitle>
          <CardDescription>
            Comprehensive player demographics and activity analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
        {children}

        {/* Players Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playersByAgeGroup}
          {playersByGender}
          {playersFavoriteEvents}
        </div>
        </CardContent>
      </Card>
    </div>
  );
}
