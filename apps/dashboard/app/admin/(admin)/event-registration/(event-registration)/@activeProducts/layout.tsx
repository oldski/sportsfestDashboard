import * as React from 'react';
import {CardHeader, CardTitle, CardContent, Card} from "@workspace/ui/components/card";
import {PackageIcon} from "lucide-react";

export default function ActiveProductsLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  // TODO: more of a ux component
  return(
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Active Products</CardTitle>
        <PackageIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}
