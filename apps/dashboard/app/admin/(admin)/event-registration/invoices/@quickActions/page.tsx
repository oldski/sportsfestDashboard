import * as React from 'react';
import Link from 'next/link';
import {FileTextIcon, DownloadIcon, SendIcon, AlertCircleIcon, CheckCircleIcon, DollarSignIcon} from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';

export default function QuickActionsPage(): React.JSX.Element {

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common invoice management tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <Button variant="outline" className="w-full justify-start">
            <FileTextIcon className="mr-2 h-4 w-4" />
            Generate Monthly Report
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <AlertCircleIcon className="mr-2 h-4 w-4" />
            Send Overdue Reminders
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <DollarSignIcon className="mr-2 h-4 w-4" />
            Export Revenue Summary
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
