'use client';

import * as React from 'react';
import { ArrowLeftRight } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Rating } from '@workspace/ui/components/rating';

import type { RosterPlayer } from './static-roster-display';

interface SwapPlayerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: RosterPlayer | null;
  targetIsStarter: boolean;
  eligiblePlayers: RosterPlayer[];
  onConfirm: (swapWithPlayer: RosterPlayer) => void;
}

export function SwapPlayerModal({
  open,
  onOpenChange,
  player,
  targetIsStarter,
  eligiblePlayers,
  onConfirm,
}: SwapPlayerModalProps) {
  if (!player) return null;

  const currentRole = player.isStarter ? 'Starter' : 'Substitute';
  const targetRole = targetIsStarter ? 'Starter' : 'Substitute';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            Swap Players
          </DialogTitle>
          <DialogDescription>
            The {targetRole.toLowerCase()} slots are full. Select a player to swap with{' '}
            <span className="font-medium text-foreground">
              {player.firstName} {player.lastName}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current player being moved */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Moving to {targetRole}</p>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {player.firstName[0]}{player.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <span className="text-sm font-medium">
                  {player.firstName} {player.lastName}
                </span>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">{player.gender}</Badge>
                  <Badge variant="secondary" className="text-xs">{currentRole}</Badge>
                </div>
                {player.eventInterestRating && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-muted-foreground">Interest:</span>
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
            </div>
          </div>

          {/* Eligible players to swap with */}
          <div>
            <p className="text-sm font-medium mb-2">
              Select a {targetRole.toLowerCase()} to swap:
            </p>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2 pr-4">
                {eligiblePlayers.map((swapPlayer) => (
                  <button
                    key={swapPlayer.id}
                    onClick={() => onConfirm(swapPlayer)}
                    className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-accent hover:border-primary transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {swapPlayer.firstName[0]}{swapPlayer.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="text-sm font-medium">
                          {swapPlayer.firstName} {swapPlayer.lastName}
                        </span>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">{swapPlayer.gender}</Badge>
                        </div>
                        {swapPlayer.eventInterestRating && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-muted-foreground">Interest:</span>
                            <Rating
                              value={6 - swapPlayer.eventInterestRating}
                              totalStars={5}
                              size={12}
                              readOnly
                              variant="yellow"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
