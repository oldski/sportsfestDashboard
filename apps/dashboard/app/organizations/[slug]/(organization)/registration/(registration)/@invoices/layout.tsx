import * as React from 'react';
import {CardHeader, CardTitle, CardContent, Card} from "@workspace/ui/components/card";
import {ArrowRightIcon, FileTextIcon} from "lucide-react";

export default function InvoicesLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  return(
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileTextIcon className="h-5 w-5" />
            <CardTitle className="text-lg">Invoices</CardTitle>
          </div>
          <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}
