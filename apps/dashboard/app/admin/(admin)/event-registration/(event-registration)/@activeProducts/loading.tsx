import * as React from 'react';

import { Skeleton } from '@workspace/ui/components/skeleton';

export default function ActiveProductsLoading(): React.JSX.Element {
  return (
    <>
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-4 w-32" />
    </>
  );
}
