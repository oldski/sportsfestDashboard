import * as React from 'react';

export default function PlayersReportsPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Player Reports</h2>
        <p className="text-muted-foreground">
          Individual player performance and registration analytics
        </p>
      </div>
      
      <div className="rounded-lg border border-dashed border-muted-foreground/25 p-8">
        <div className="text-center space-y-3">
          <h3 className="text-lg font-medium">Player Analytics</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Player registration trends, team assignments, and individual performance metrics will be displayed here.
          </p>
        </div>
      </div>
    </div>
  );
}