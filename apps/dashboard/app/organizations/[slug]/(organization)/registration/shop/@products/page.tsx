import * as React from 'react';

export default async function ProductsPage(): Promise<React.JSX.Element> {

  //TODO: Add an actual shopping cart component
  return(
    <>
      <div className="rounded-lg border border-dashed p-8 text-center">
        Product item
      </div>
      <div className="rounded-lg border border-dashed p-8 text-center">
        Product item
      </div>
      <div className="rounded-lg border border-dashed p-8 text-center">
        Product item
      </div>
    </>
  )
}
