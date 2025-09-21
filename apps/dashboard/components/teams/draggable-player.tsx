'use client';

import * as React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Crown, Users, UserCheck } from 'lucide-react';

import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar';
import { Badge } from '@workspace/ui/components/badge';
import { Rating } from '@workspace/ui/components/rating';
import { cn } from '@workspace/ui/lib/utils';

import { RosterPlayer } from './drag-drop-roster';

interface DraggablePlayerProps {
  player: RosterPlayer;
  isDragging?: boolean;
  isOverlay?: boolean;
}

export function DraggablePlayer({ player, isDragging = false, isOverlay = false }: DraggablePlayerProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isDraggingState,
  } = useDraggable({
    id: player.id,
    disabled: isOverlay, // Don't make overlay draggable
  });

  const style = isOverlay ? { width: 'max-content' } : {
    transform: CSS.Translate.toString(transform),
  };

  const GenderIcon = UserCheck; // Use same icon for both genders

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      {...(isOverlay ? {} : listeners)}
      {...(isOverlay ? {} : attributes)}
      className={cn(
        'flex items-center gap-3 p-3 bg-background border rounded-lg select-none',
        !isOverlay && 'cursor-grab active:cursor-grabbing hover:bg-muted/50 transition-colors touch-action-none',
        isDraggingState && !isOverlay && 'opacity-30',
        isOverlay && 'shadow-2xl border-2 border-primary/30 bg-background/95 backdrop-blur-sm cursor-grabbing min-w-0 max-w-none'
      )}
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className="text-xs">
          {player.firstName[0]}{player.lastName[0]}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <GenderIcon 
            className={cn(
              'h-4 w-4 flex-shrink-0',
              player.gender === 'male' ? 'text-blue-500' : 'text-pink-500'
            )} 
          />
          <span className="font-medium text-sm truncate">
            {player.firstName} {player.lastName}
          </span>
          {player.squadLeader && (
            <Crown className="h-4 w-4 text-amber-500 flex-shrink-0" />
          )}
        </div>
        
        {player.eventInterestRating && (
          <div className="flex items-center gap-1">
            <Rating
              value={6 - player.eventInterestRating}
              totalStars={5}
              size={12}
              readOnly
              variant="yellow"
            />
          </div>
        )}
      </div>
      
      <Badge 
        variant={player.isStarter ? "default" : "secondary"}
        className="text-xs flex-shrink-0"
      >
        {player.isStarter ? 'S' : 'Sub'}
      </Badge>
    </div>
  );
}