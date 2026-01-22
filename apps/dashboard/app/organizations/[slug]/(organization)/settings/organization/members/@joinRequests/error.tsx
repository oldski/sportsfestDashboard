'use client';

import * as React from 'react';

import { Card, CardContent } from '@workspace/ui/components/card';
import { EmptyText } from '@workspace/ui/components/empty-text';

export default function JoinRequestsError(): React.JSX.Element {
  return (
    <Card className="gap-0 pb-0">
      <CardContent className="p-0">
        <EmptyText className="p-6">
          Failed to load join requests. Please try again.
        </EmptyText>
      </CardContent>
    </Card>
  );
}
