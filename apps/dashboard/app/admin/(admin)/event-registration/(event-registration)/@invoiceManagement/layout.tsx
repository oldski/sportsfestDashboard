import * as React from 'react';
import {CardHeader, CardTitle, CardContent, CardDescription, Card} from "@workspace/ui/components/card";
import {FileTextIcon} from "lucide-react";
import Link from "next/link";

export default function InvoiceManagementLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  // TODO: more of a ux component
  return(
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <Link href="/admin/event-registration/invoices" className="block">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FileTextIcon className="h-5 w-5 text-primary" />
            <CardTitle>Invoice Management</CardTitle>
          </div>
          <CardDescription>
            Generate and manage organization invoices and PDF exports
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-3">
          {children}
        </CardContent>
      </Link>
    </Card>
  )
}
