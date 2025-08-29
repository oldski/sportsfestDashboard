import * as React from 'react';
import {Card, CardHeader, CardTitle, CardContent} from "@workspace/ui/components/card";
import {CalendarIcon} from "lucide-react";
import {Badge} from "@workspace/ui/components/badge";

export default function SnapshotLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  // TODO: more of a ux component
  return(
    <Card className="border-primary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-primary">SportsFest 2025 Registration</CardTitle>
            <Badge variant="default">Active</Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Registration closes: May 30, 2025
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}
