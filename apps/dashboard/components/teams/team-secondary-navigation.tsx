'use client';

import * as React from 'react';
import {Users, Shuffle, Crown} from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { autoGenerateRosters } from '~/actions/teams/roster-actions';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList
} from "@workspace/ui/components/navigation-menu";
import Link from "next/link";
import {replaceOrgSlug, routes} from "@workspace/routes";
import {Badge} from "@workspace/ui/components/badge";
import {arrayOutputType} from "zod";

interface TeamSecondaryNavigationProps {
  teamsData: arrayOutputType<any>;
  slug: string;
}

export function TeamSecondaryNavigation({
                                    teamsData,
                                          slug,
                                  }: TeamSecondaryNavigationProps) {

  return (
    <div>
      {teamsData.teams.length > 0 && (
        <div className="flex items-center gap-5">
          <NavigationMenu>
            <NavigationMenuList className="gap-4">
              {teamsData.teams.map((team) => (
                <NavigationMenuItem key={team.id}>
                  <NavigationMenuLink asChild>
                    <Link href={replaceOrgSlug(routes.dashboard.organizations.slug.Teams, slug) + `/${team.id}`}>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{team.name || `Team ${team.teamNumber}`}</span>
                        </div>
                        <Badge
                          variant={team.isPaid ? "default" : "secondary"}
                          className="hide-on-mobile text-xs h-4 px-1"
                        >
                          {team.memberCount}/{team.maxMembers}
                        </Badge>
                        {team.members.some(m => m.isCaptain) && (
                          <Crown className="hide-on-mobile h-3 w-3 text-amber-500" />
                        )}
                      </div>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      )}
    </div>
  );
}
