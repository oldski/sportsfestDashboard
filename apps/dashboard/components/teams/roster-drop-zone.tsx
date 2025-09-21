'use client';

import * as React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { UserCheck, Users, Crown, Loader2 } from 'lucide-react';

import { cn } from '@workspace/ui/lib/utils';
import { Badge } from '@workspace/ui/components/badge';

import { DraggablePlayer } from './draggable-player';
import { RosterPlayer } from './drag-drop-roster';

interface RosterDropZoneProps {
  id: string;
  title: string;
  subtitle: string;
  players: RosterPlayer[];
  maxPlayers: number;
  currentCounts: {
    male: number;
    female: number;
  };
  requirements: {
    male: number;
    female: number;
    any?: number;
  };
  isLoading?: boolean;
}

export function RosterDropZone({
  id,
  title,
  subtitle,
  players,
  maxPlayers,
  currentCounts,
  requirements,
  isLoading = false,
}: RosterDropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  // Calculate empty slots
  const emptySlots = Math.max(0, maxPlayers - players.length);

  // Check if requirements are met
  const isComplete = players.length >= maxPlayers;
  const genderRequirementsMet = requirements.any 
    ? players.length >= maxPlayers 
    : currentCounts.male >= requirements.male && currentCounts.female >= requirements.female;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'border-2 border-dashed rounded-lg p-4 min-h-[300px] transition-all duration-200 overflow-visible',
        isOver && 'border-primary bg-primary/10 scale-[1.01] shadow-lg ring-2 ring-primary/20',
        !isOver && 'border-muted-foreground/25 hover:border-muted-foreground/40',
        isLoading && 'opacity-50'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            {title}
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        
        <div className="text-right">
          <Badge 
            variant={isComplete ? "default" : "secondary"}
            className="text-xs"
          >
            {players.length}/{maxPlayers}
          </Badge>
        </div>
      </div>

      {/* Gender breakdown (if applicable) */}
      {requirements.any === undefined && (
        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Male:</span>
            <Badge 
              variant={currentCounts.male >= requirements.male ? "default" : "secondary"}
              className="text-xs"
            >
              {currentCounts.male}/{requirements.male}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-pink-500" />
            <span className="text-sm">Female:</span>
            <Badge 
              variant={currentCounts.female >= requirements.female ? "default" : "secondary"}
              className="text-xs"
            >
              {currentCounts.female}/{requirements.female}
            </Badge>
          </div>
        </div>
      )}

      {/* Players */}
      <div className="space-y-2">
        {players
          .sort((a, b) => {
            // Sort: squad leaders first, then by name
            if (a.squadLeader !== b.squadLeader) return b.squadLeader ? 1 : -1;
            return a.firstName.localeCompare(b.firstName);
          })
          .map((player) => (
            <DraggablePlayer key={player.id} player={player} />
          ))}
        
        {/* Empty slots */}
        {emptySlots > 0 && (
          <div className="space-y-2">
            {Array.from({ length: emptySlots }, (_, index) => (
              <div
                key={`empty-${index}`}
                className={cn(
                  'flex items-center justify-center h-12 border-2 border-dashed rounded-lg',
                  'text-muted-foreground bg-muted/20 transition-all duration-150',
                  isOver && 'border-primary/60 bg-primary/15 text-primary scale-[1.02]'
                )}
              >
                <span className="text-sm">Drop player here</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status indicator */}
      {players.length > 0 && (
        <div className="mt-4 pt-3 border-t border-muted">
          <div className="flex items-center gap-2 text-sm">
            {genderRequirementsMet ? (
              <div className="flex items-center gap-1 text-green-600">
                <div className="h-2 w-2 bg-green-500 rounded-full" />
                <span>Requirements met</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-amber-600">
                <div className="h-2 w-2 bg-amber-500 rounded-full" />
                <span>Needs more players</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}