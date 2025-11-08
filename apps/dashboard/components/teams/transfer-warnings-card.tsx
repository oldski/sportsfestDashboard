'use client';

import * as React from 'react';
import { AlertTriangle, Users, Crown, Trophy, X, CheckCircle } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar';
import { Separator } from '@workspace/ui/components/separator';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@workspace/ui/components/alert';

import { TransferWarning } from '~/data/teams/get-transfer-warnings';
import { resolveTransferWarning, resolveAllTransferWarningsForPlayer } from '~/actions/teams/transfer-warning-actions';
import { EventType } from '@workspace/database/schema';

interface TransferWarningsCardProps {
  warnings: TransferWarning[];
  totalCount: number;
  onWarningsUpdated?: () => void;
}

const EVENT_TITLES = {
  beach_volleyball: 'Beach Volleyball',
  beach_dodgeball: 'Beach Dodgeball',
  bote_beach_challenge: 'Surf & Turf Rally',
  tug_of_war: 'Tug of War',
  corn_toss: 'Corn Toss',
} as const;

export function TransferWarningsCard({ 
  warnings, 
  totalCount, 
  onWarningsUpdated 
}: TransferWarningsCardProps) {
  const [resolvingWarnings, setResolvingWarnings] = React.useState<Set<string>>(new Set());
  const [resolvingPlayers, setResolvingPlayers] = React.useState<Set<string>>(new Set());

  const handleResolveSpecificWarning = async (
    playerId: string,
    eventType: EventType,
    oldTeamId: string
  ) => {
    const warningKey = `${playerId}-${eventType}-${oldTeamId}`;
    setResolvingWarnings(prev => new Set(prev).add(warningKey));
    
    try {
      const result = await resolveTransferWarning(playerId, eventType, oldTeamId);
      if (result.success) {
        toast.success('Transfer warning resolved successfully');
        onWarningsUpdated?.();
      } else {
        toast.error(result.error || 'Failed to resolve transfer warning');
      }
    } finally {
      setResolvingWarnings(prev => {
        const newSet = new Set(prev);
        newSet.delete(warningKey);
        return newSet;
      });
    }
  };

  const handleResolveAllForPlayer = async (playerId: string) => {
    setResolvingPlayers(prev => new Set(prev).add(playerId));
    
    try {
      const result = await resolveAllTransferWarningsForPlayer(playerId);
      if (result.success) {
        toast.success(`Resolved ${result.resolved} transfer warnings for player`);
        onWarningsUpdated?.();
      } else {
        toast.error(result.error || 'Failed to resolve transfer warnings');
      }
    } finally {
      setResolvingPlayers(prev => {
        const newSet = new Set(prev);
        newSet.delete(playerId);
        return newSet;
      });
    }
  };

  if (totalCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Transfer Warnings
          </CardTitle>
          <CardDescription>
            All event roster assignments are current - no transfer conflicts detected
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Transfer Warnings
          <Badge variant="destructive" className="ml-2">
            {totalCount}
          </Badge>
        </CardTitle>
        <CardDescription>
          Players who were transferred but still have event roster assignments from their previous teams
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Action Required</AlertTitle>
          <AlertDescription>
            These players have been moved to new teams but are still assigned to events under their old teams. 
            Resolve these warnings to ensure accurate event rosters.
          </AlertDescription>
        </Alert>

        <ScrollArea className="max-h-[400px]">
          <div className="space-y-4">
            {warnings.map((warning) => (
              <div key={warning.playerId} className="border rounded-lg p-4 space-y-3">
                {/* Player Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {warning.firstName[0]}{warning.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {warning.firstName} {warning.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {warning.email}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleResolveAllForPlayer(warning.playerId)}
                    disabled={resolvingPlayers.has(warning.playerId)}
                    className="min-w-[100px]"
                  >
                    {resolvingPlayers.has(warning.playerId) ? 'Resolving...' : 'Resolve All'}
                  </Button>
                </div>

                {/* Current Team Info */}
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-muted-foreground">Current Team:</span>
                  <Badge variant="outline">
                    Team {warning.currentTeamNumber} - {warning.currentTeamName}
                  </Badge>
                </div>

                <Separator />

                {/* Event Assignments */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Conflicting Event Assignments ({warning.eventAssignments.length})
                  </div>
                  
                  {warning.eventAssignments.map((assignment, index) => {
                    const warningKey = `${warning.playerId}-${assignment.eventType}-${assignment.oldTeamId}`;
                    const isResolving = resolvingWarnings.has(warningKey);
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-amber-500" />
                          <div>
                            <div className="text-sm font-medium">
                              {EVENT_TITLES[assignment.eventType]}
                              {assignment.squadLeader && (
                                <Crown className="h-3 w-3 text-amber-500 inline ml-1" />
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Old Team: {assignment.oldTeamNumber} - {assignment.oldTeamName} • 
                              {assignment.isStarter ? ' Starter' : ' Substitute'}
                              {assignment.squadLeader && ' • Squad Leader'}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveSpecificWarning(
                            warning.playerId,
                            assignment.eventType,
                            assignment.oldTeamId
                          )}
                          disabled={isResolving}
                          className="min-w-[80px]"
                        >
                          <X className="h-3 w-3 mr-1" />
                          {isResolving ? 'Removing...' : 'Remove'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}