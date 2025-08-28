import * as React from 'react';

import { Card, CardContent } from '@workspace/ui/components/card';

export default function PlayersPage(): React.JSX.Element {
  return (
    <Card>
      <CardContent className="flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Players Coming Soon</h2>
          <p className="text-muted-foreground">
            This section will contain comprehensive reporting and analytics features.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
