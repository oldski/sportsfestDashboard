import * as React from 'react';

export default function ProductsLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  // TODO: more of a ux component
  return(
    <div className="rounded-lg border border-dashed p-8 text-center">
      <h3 className="text-lg font-semibold">Products</h3>
      <p className="text-muted-foreground mt-2">
        {children}
      </p>
    </div>
  )
}
