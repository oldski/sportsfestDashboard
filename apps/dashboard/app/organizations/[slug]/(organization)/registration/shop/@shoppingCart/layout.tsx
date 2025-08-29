import * as React from 'react';

export default function ShoppingCartLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  // TODO: more of a ux component
  return(
    <div className="rounded-lg border p-8 text-center">
      <h3 className="text-lg font-semibold">Shopping Cart</h3>
      <p className="text-muted-foreground mt-2">
        {children}
      </p>
    </div>
  )
}
