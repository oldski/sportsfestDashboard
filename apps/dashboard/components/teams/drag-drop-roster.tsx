'use client';

import * as React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCenter,
  rectIntersection,
  pointerWithin,
  DragOverlayProps,
} from '@dnd-kit/core';

// Custom collision detection that's most permissive for side-by-side layouts
const customCollisionDetection = (args: any) => {
  // Use pointerWithin - activates when pointer is anywhere in drop zone
  return pointerWithin(args);
};
import { toast } from '@workspace/ui/components/sonner';
import { EventType } from '@workspace/database/schema';

import { DraggablePlayer } from './draggable-player';
import { RosterDropZone } from './roster-drop-zone';
import { DragOverlayPlayer } from './drag-overlay-player';
import { toggleEventStarterStatus } from '~/actions/teams/event-roster-actions';

export interface RosterPlayer {
  id: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  isStarter: boolean;
  squadLeader: boolean;
  assignedAt: Date;
  eventInterestRating?: number;
}

export interface EventRequirements {
  total: number;
  male: number;
  female: number;
  any: number;
}

export interface DragDropRosterProps {
  teamId: string;
  eventType: EventType;
  players: RosterPlayer[];
  eventRequirements: EventRequirements;
  onPlayerUpdate?: () => void;
}

type DropZoneType = 'starters' | 'substitutes';


export function DragDropRoster({
  teamId,
  eventType,
  players,
  eventRequirements,
  onPlayerUpdate,
}: DragDropRosterProps) {
  const [activePlayer, setActivePlayer] = React.useState<RosterPlayer | null>(null);
  const [isUpdating, setIsUpdating] = React.useState(false);

  // Configure sensors for both mouse and touch with scroll-friendly settings
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 3,
      },
    })
  );

  // Separate players into starters and substitutes
  const starters = players.filter(player => player.isStarter);
  const substitutes = players.filter(player => !player.isStarter);

  // Calculate current counts for validation
  const starterCounts = {
    male: starters.filter(p => p.gender === 'male').length,
    female: starters.filter(p => p.gender === 'female').length,
    total: starters.length,
  };

  const substituteCounts = {
    male: substitutes.filter(p => p.gender === 'male').length,
    female: substitutes.filter(p => p.gender === 'female').length,
    total: substitutes.length,
  };

  // Calculate requirements for starters vs substitutes
  const starterRequirements = React.useMemo(() => {
    if (eventType === EventType.CORN_TOSS) {
      return { male: 0, female: 0, any: 4, total: 4 }; // All players are "active" in corn toss
    }

    // Starter requirements for each event (the active players during the event)
    switch (eventType) {
      case 'beach_volleyball':
        return { male: 3, female: 3, any: 0, total: 6 }; // 6 active players on court
      case 'beach_dodgeball':
        return { male: 3, female: 3, any: 0, total: 6 }; // 6 active players on court
      case 'bote_beach_challenge':
        return { male: 4, female: 3, any: 0, total: 7 }; // 7 active participants
      case 'tug_of_war':
        return { male: 3, female: 2, any: 0, total: 5 }; // 5 active pullers
      default:
        return { male: 0, female: 0, any: 0, total: 0 };
    }
  }, [eventType]);

  const substituteRequirements = React.useMemo(() => {
    if (eventType === EventType.CORN_TOSS) {
      return { male: 0, female: 0, any: 0, total: 0 }; // No subs in corn toss
    }

    return {
      male: eventRequirements.male - starterRequirements.male,
      female: eventRequirements.female - starterRequirements.female,
      any: eventRequirements.any - starterRequirements.any,
      total: eventRequirements.total - starterRequirements.total,
    };
  }, [eventRequirements, starterRequirements, eventType]);

  const handleDragStart = (event: DragStartEvent) => {
    const player = players.find(p => p.id === event.active.id);
    setActivePlayer(player || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActivePlayer(null);

    if (!over || active.id === over.id) {
      return;
    }

    const playerId = active.id as string;
    const dropZone = over.id as DropZoneType;
    const player = players.find(p => p.id === playerId);

    if (!player) {
      toast.error('Player not found');
      return;
    }

    // Determine new starter status based on drop zone
    const newIsStarter = dropZone === 'starters';

    // Skip if no change needed
    if (player.isStarter === newIsStarter) {
      return;
    }

    // Validate the move
    const validationResult = validatePlayerMove(player, dropZone);
    if (!validationResult.valid) {
      toast.error(validationResult.error);
      return;
    }

    // Update player status
    setIsUpdating(true);
    try {
      const result = await toggleEventStarterStatus(playerId, teamId, eventType, newIsStarter);
      if (result.success) {
        toast.success(`Player moved to ${newIsStarter ? 'starters' : 'substitutes'} successfully`);
        onPlayerUpdate?.();
      } else {
        toast.error(result.error || 'Failed to update player status');
      }
    } catch (error) {
      console.error('Error updating player status:', error);
      toast.error('Failed to update player status');
    } finally {
      setIsUpdating(false);
    }
  };

  // Validate if a player can be moved to a specific zone
  const validatePlayerMove = (player: RosterPlayer, targetZone: DropZoneType): { valid: boolean; error?: string } => {
    const newIsStarter = targetZone === 'starters';
    
    // Calculate what counts would be after the move (excluding the player being moved)
    const targetPlayers = newIsStarter ? starters : substitutes;
    const targetPlayerIds = new Set(targetPlayers.map(p => p.id));
    
    // Don't count the player being moved if they're already in the target zone
    const targetCounts = {
      total: targetPlayerIds.has(player.id) ? targetPlayers.length : targetPlayers.length + 1,
      male: targetPlayers.filter(p => p.gender === 'male' && p.id !== player.id).length + (player.gender === 'male' ? 1 : 0),
      female: targetPlayers.filter(p => p.gender === 'female' && p.id !== player.id).length + (player.gender === 'female' ? 1 : 0),
    };
    
    const requirements = newIsStarter ? starterRequirements : substituteRequirements;
    
    // Check total capacity
    if (targetCounts.total > requirements.total) {
      return { 
        valid: false, 
        error: `${newIsStarter ? 'Starter' : 'Substitute'} slots are full` 
      };
    }
    
    // Check gender capacity for non-corn-toss events
    if (eventType !== EventType.CORN_TOSS && requirements.any === 0) {
      const genderCount = targetCounts[player.gender];
      const genderRequirement = requirements[player.gender];
      
      if (genderCount > genderRequirement) {
        return { 
          valid: false, 
          error: `${player.gender === 'male' ? 'Male' : 'Female'} ${newIsStarter ? 'starter' : 'substitute'} slots are full` 
        };
      }
    }
    
    return { valid: true };
  };

  if (eventType === EventType.CORN_TOSS) {
    // Special layout for Corn Toss (2 squads of 2 players each)
    const squad1 = starters.slice(0, 2);
    const squad2 = starters.slice(2, 4);

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RosterDropZone
              id="starters"
              title="Squad 1"
              subtitle="Any 2 Players"
              players={squad1}
              maxPlayers={2}
              currentCounts={{ male: squad1.filter(p => p.gender === 'male').length, female: squad1.filter(p => p.gender === 'female').length }}
              requirements={{ male: 0, female: 0, any: 2 }}
              isLoading={isUpdating}
            />
            <RosterDropZone
              id="substitutes"
              title="Squad 2" 
              subtitle="Any 2 Players"
              players={squad2}
              maxPlayers={2}
              currentCounts={{ male: squad2.filter(p => p.gender === 'male').length, female: squad2.filter(p => p.gender === 'female').length }}
              requirements={{ male: 0, female: 0, any: 2 }}
              isLoading={isUpdating}
            />
          </div>
        </div>
        
        <DragOverlay 
          dropAnimation={null}
          >
          {activePlayer && (
            <div className="rotate-2 scale-105">
              <DragOverlayPlayer player={activePlayer} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    );
  }

  // Standard layout for other events
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0 overflow-visible">
        <RosterDropZone
          id="starters"
          title="Starters"
          subtitle={`${starterRequirements.male} Male, ${starterRequirements.female} Female`}
          players={starters}
          maxPlayers={starterRequirements.total}
          currentCounts={starterCounts}
          requirements={starterRequirements}
          isLoading={isUpdating}
        />
        
        <RosterDropZone
          id="substitutes"
          title="Substitutes"
          subtitle={`${substituteRequirements.male} Male, ${substituteRequirements.female} Female`}
          players={substitutes}
          maxPlayers={substituteRequirements.total}
          currentCounts={substituteCounts}
          requirements={substituteRequirements}
          isLoading={isUpdating}
        />
      </div>
      
      <DragOverlay 
        dropAnimation={null}
      >
        {activePlayer && (
          <div className="rotate-2 scale-105">
            <DragOverlayPlayer player={activePlayer} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}