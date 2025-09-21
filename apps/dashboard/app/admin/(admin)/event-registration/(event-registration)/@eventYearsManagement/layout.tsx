import * as React from 'react';
import {CardHeader, CardTitle, CardContent, CardDescription, Card} from "@workspace/ui/components/card";
import {CalendarIcon} from "lucide-react";
import Link from "next/link";

export default function EventYearsManagementLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  // TODO: more of a ux component
  return(
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <Link href="/admin/event-registration/event-years" className="block">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <CardTitle>Event Years</CardTitle>
          </div>
          <CardDescription>
            Manage SportsFest event years and associated products
          </CardDescription>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Link>
    </Card>
  )
}
