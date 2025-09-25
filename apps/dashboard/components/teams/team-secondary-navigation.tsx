'use client';

import * as React from 'react';
import {Users, Shuffle, Crown} from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';
import { useParams } from 'next/navigation';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { autoGenerateRosters } from '~/actions/teams/roster-actions';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList
} from "@workspace/ui/components/navigation-menu";
import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";
import {replaceOrgSlug, routes} from "@workspace/routes";
import {Badge} from "@workspace/ui/components/badge";
import type { CompanyTeamsResult } from '~/data/teams/get-company-teams';

interface TeamSecondaryNavigationProps {
  teamsData: CompanyTeamsResult;
  slug: string;
}

export function TeamSecondaryNavigation({
                                    teamsData,
                                          slug,
                                  }: TeamSecondaryNavigationProps) {
  const params = useParams();
  const currentTeamId = params?.teamId as string;

  return (
    <div>
      {teamsData.teams.length > 0 && (
        <div className="flex items-center gap-5">
          <NavigationMenu>
            <NavigationMenuList className="gap-4">
              {teamsData.teams.map((team) => {
                const isActive = currentTeamId === team.id;
                return (
                <NavigationMenuItem key={team.id}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={replaceOrgSlug(routes.dashboard.organizations.slug.Teams, slug) + `/${team.id}`}
                      className={cn(
                        "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                        isActive && "bg-accent text-accent-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{team.name || `Team ${team.teamNumber}`}</span>
                        </div>
                        <Badge
                          variant={team.isPaid ? "default" : "secondary"}
                          className="hidden text-xs h-4 px-1"
                        >
                          {team.memberCount}/{team.maxMembers}
                        </Badge>
                        <Badge
                          variant={team.isPaid ? "default" : "secondary"}
                          className="hide-on-mobile text-xs h-4 px-1"
                        >
                          {team.memberCount}
                        </Badge>
                        {team.members.some(m => m.isCaptain) && (
                          <Crown className="h-3 w-3 text-amber-500" />
                        )}
                      </div>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      )}
    </div>
  );
}
