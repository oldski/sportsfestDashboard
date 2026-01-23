'use client';

import * as React from 'react';
import { BuildingIcon, UsersIcon, DollarSignIcon, UsersIcon as TeamIcon, UserIcon, StarIcon } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Badge } from '@workspace/ui/components/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip';

import { getTopOrganizations, type RankingType, type TopOrganizationData } from '~/actions/admin/get-top-organizations';

export function TopOrganizationsCard(): React.JSX.Element {
  const [activeTab, setActiveTab] = React.useState<RankingType>('members');
  const [data, setData] = React.useState<TopOrganizationData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const organizations = await getTopOrganizations(activeTab, 10);
        setData(organizations);
      } catch (error) {
        console.error('Error fetching top organizations:', error);
      }
    };

    fetchData();
  }, [activeTab]);

  React.useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const organizations = await getTopOrganizations('members', 10);
        setData(organizations);
      } catch (error) {
        console.error('Error fetching top organizations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const formatMetricValue = (type: RankingType, org: TopOrganizationData): string => {
    switch (type) {
      case 'members': return `${org.memberCount}`;
      case 'revenue': return `$${org.revenue.toLocaleString()}`;
      case 'teams': return `${org.teamCount}`;
      case 'players': return `${org.playerCount}`;
    }
  };

  const getTabIcon = (type: RankingType) => {
    switch (type) {
      case 'members': return UsersIcon;
      case 'revenue': return DollarSignIcon;
      case 'teams': return TeamIcon;
      case 'players': return UserIcon;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <BuildingIcon className="h-5 w-5" />
            Top Companies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <BuildingIcon className="h-5 w-5" />
            Top Companies
          </CardTitle>
          <CardDescription>Organizations ranked by different metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as RankingType)} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="members" className="text-xs">Members</TabsTrigger>
              <TabsTrigger value="revenue" className="text-xs">Revenue</TabsTrigger>
              <TabsTrigger value="teams" className="text-xs">Teams</TabsTrigger>
              <TabsTrigger value="players" className="text-xs">Players</TabsTrigger>
            </TabsList>

            {(['members', 'revenue', 'teams', 'players'] as RankingType[]).map((type) => (
              <TabsContent key={type} value={type} className="mt-4">
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {data.length > 0 ? (
                    data.map((org, index) => {
                      const IconComponent = getTabIcon(type);
                      const primaryValue = formatMetricValue(type, org);

                      return (
                        <div key={org.id} className="flex justify-between items-start p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-mono text-muted-foreground w-6">#{index + 1}</span>
                              <div className="font-medium text-sm flex items-center gap-1.5">
                                {org.name}
                                {org.isSponsor && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <StarIcon className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Sponsor</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <UsersIcon className="h-3 w-3" />
                                {org.memberCount} members
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSignIcon className="h-3 w-3" />
                                ${org.revenue.toLocaleString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <TeamIcon className="h-3 w-3" />
                                {org.teamCount} teams
                              </div>
                              <div className="flex items-center gap-1">
                                <UserIcon className="h-3 w-3" />
                                {org.playerCount} players
                              </div>
                            </div>
                          </div>
                          <Badge variant={type === activeTab ? "default" : "outline"} className="ml-2">
                            <IconComponent className="h-3 w-3 mr-1" />
                            {primaryValue}
                          </Badge>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">No organizations found for the active event</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
