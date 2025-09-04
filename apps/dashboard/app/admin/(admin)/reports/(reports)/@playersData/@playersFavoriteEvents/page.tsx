import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import {StarIcon} from 'lucide-react';

export default function PlayersFavoriteEventsPage(): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center">
          <StarIcon className="mr-2 h-3 w-3" />
          Favorite Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48 flex items-center justify-center border border-dashed border-muted-foreground/25 rounded-lg">
          <p className="text-xs text-muted-foreground">Popular Events Chart</p>
        </div>
      </CardContent>
    </Card>
  );
}
