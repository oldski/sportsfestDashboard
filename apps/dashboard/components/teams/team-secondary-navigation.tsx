'use client';

import * as React from 'react';
import {Users, Crown, ChevronDown} from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from "next/link";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList
} from "@workspace/ui/components/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
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

  if (teamsData.teams.length === 0) {
    return null;
  }

  const currentTeam = teamsData.teams.find(t => t.id === currentTeamId);

  return (
    <>
      {/* Mobile/Tablet: Dropdown Menu */}
      <div className="lg:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full max-w-xs justify-between">
              {currentTeam ? (
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  <span>{currentTeam.name || `Team ${currentTeam.teamNumber}`}</span>
                  <Badge variant={currentTeam.isPaid ? "default" : "secondary"} className="text-xs h-4 px-1">
                    {currentTeam.memberCount}
                  </Badge>
                  {currentTeam.members.some(m => m.isCaptain) && (
                    <Crown className="h-3 w-3 text-amber-500" />
                  )}
                </div>
              ) : (
                <span>Jump to a Team</span>
              )}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[300px]">
            {teamsData.teams.map((team) => (
              <DropdownMenuItem key={team.id} asChild>
                <Link
                  href={replaceOrgSlug(routes.dashboard.organizations.slug.Teams, slug) + `/${team.id}`}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Users className="h-3 w-3" />
                  <span>{team.name || `Team ${team.teamNumber}`}</span>
                  <Badge variant={team.isPaid ? "default" : "secondary"} className="text-xs h-4 px-1 ml-auto">
                    {team.memberCount}
                  </Badge>
                  {team.members.some(m => m.isCaptain) && (
                    <Crown className="h-3 w-3 text-amber-500" />
                  )}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop: Horizontal Navigation with Scroll */}
      <div className="hidden lg:block relative min-w-0 overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              {teamsData.teams.map((team) => {
                const isActive = currentTeamId === team.id;
                return (
                  <NavigationMenuItem key={team.id}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={replaceOrgSlug(routes.dashboard.organizations.slug.Teams, slug) + `/${team.id}`}
                        className={cn(
                          "inline-flex h-8 items-center justify-center rounded-md bg-background px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none shrink-0",
                          isActive && "bg-accent text-accent-foreground"
                        )}
                      >
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3 w-3" />
                          <span className="whitespace-nowrap">{team.name || `Team ${team.teamNumber}`}</span>
                          <Badge
                            variant={team.isPaid ? "default" : "secondary"}
                            className="text-[10px] h-3.5 px-1"
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
      </div>
    </>
  );
}
