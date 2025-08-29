'use client';

import * as React from 'react';
import Link from 'next/link';
import { PlusIcon, CalendarIcon, SettingsIcon, BarChartIcon, PencilIcon, TrashIcon } from 'lucide-react';

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

import { EventYearDialog } from '~/components/admin/event-registration/event-year-dialog';
import { DeleteEventYearDialog } from '~/components/admin/event-registration/delete-event-year-dialog';

// Mock data - will be replaced with real data from database actions
const mockEventYears = [
  {
    id: '1',
    year: 2025,
    name: 'SportsFest 2025',
    description: 'Annual corporate sports festival',
    startDate: '2025-06-15',
    endDate: '2025-06-17',
    registrationOpen: true,
    registrationDeadline: '2025-05-30',
    productCount: 12,
    organizationCount: 18,
    totalRevenue: 32400,
    status: 'active',
    createdAt: '2024-12-01'
  },
  {
    id: '2',
    year: 2024,
    name: 'SportsFest 2024',
    description: 'Annual corporate sports festival',
    startDate: '2024-06-15',
    endDate: '2024-06-17',
    registrationOpen: false,
    registrationDeadline: '2024-05-30',
    productCount: 8,
    organizationCount: 15,
    totalRevenue: 28750,
    status: 'completed',
    createdAt: '2023-12-01'
  },
  {
    id: '3',
    year: 2026,
    name: 'SportsFest 2026',
    description: 'Annual corporate sports festival',
    startDate: '2026-06-15',
    endDate: '2026-06-17',
    registrationOpen: false,
    registrationDeadline: '2026-05-30',
    productCount: 0,
    organizationCount: 0,
    totalRevenue: 0,
    status: 'draft',
    createdAt: '2025-01-01'
  }
];

export default function EventYearsPage(): React.JSX.Element {
  const currentYear = new Date().getFullYear();
  const activeEventYear = mockEventYears.find(ey => ey.status === 'active');
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedEventYear, setSelectedEventYear] = React.useState<any>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Event Years Management</h2>
          <p className="text-muted-foreground">
            Manage SportsFest event years and associated products
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Event Year
        </Button>
      </div>

      {/* Current Active Event Year */}
      {activeEventYear && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                <CardTitle className="text-primary">Active Event Year</CardTitle>
                <Badge className="bg-primary text-primary-foreground">CURRENT</Badge>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/event-registration/event-years/${activeEventYear.id}/settings`}>
                  <SettingsIcon className="mr-2 h-3 w-3" />
                  Manage
                </Link>
              </Button>
            </div>
            <CardDescription>
              Currently active event year for registrations and product catalog
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Event Year</p>
                <p className="text-2xl font-bold">{activeEventYear.year}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Organizations</p>
                <p className="text-2xl font-bold">{activeEventYear.organizationCount}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Products</p>
                <p className="text-2xl font-bold">{activeEventYear.productCount}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${activeEventYear.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="grid gap-2 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Event Dates</p>
                  <p className="text-sm">{activeEventYear.startDate} to {activeEventYear.endDate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Registration Deadline</p>
                  <p className="text-sm">{activeEventYear.registrationDeadline}</p>
                  {activeEventYear.registrationOpen ? (
                    <Badge variant="default" className="mt-1">Open</Badge>
                  ) : (
                    <Badge variant="secondary" className="mt-1">Closed</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Event Years</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockEventYears.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockEventYears.filter(ey => ey.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockEventYears.reduce((sum, ey) => sum + ey.organizationCount, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lifetime Revenue</CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${mockEventYears.reduce((sum, ey) => sum + ey.totalRevenue, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Years Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Event Years</CardTitle>
          <CardDescription>
            Manage all SportsFest event years and their configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Event Dates</TableHead>
                  <TableHead>Registration</TableHead>
                  <TableHead>Organizations</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockEventYears
                  .sort((a, b) => b.year - a.year)
                  .map((eventYear) => (
                  <TableRow key={eventYear.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <span>{eventYear.year}</span>
                        {eventYear.year === currentYear && (
                          <Badge variant="outline" className="text-xs">Current</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{eventYear.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {eventYear.startDate} to {eventYear.endDate}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">Until {eventYear.registrationDeadline}</div>
                        {eventYear.registrationOpen ? (
                          <Badge variant="default" className="text-xs">Open</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Closed</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{eventYear.organizationCount}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{eventYear.productCount}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">${eventYear.totalRevenue.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          eventYear.status === 'active' ? 'default' :
                          eventYear.status === 'completed' ? 'secondary' : 'outline'
                        }
                        className="capitalize"
                      >
                        {eventYear.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedEventYear(eventYear);
                            setEditDialogOpen(true);
                          }}
                        >
                          <PencilIcon className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedEventYear(eventYear);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <TrashIcon className="h-3 w-3" />
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/event-registration/event-years/${eventYear.id}/analytics`}>
                            <BarChartIcon className="h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <EventYearDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        mode="create"
      />
      
      <EventYearDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        eventYear={selectedEventYear}
        mode="edit"
      />
      
      {selectedEventYear && (
        <DeleteEventYearDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          eventYear={selectedEventYear}
          onDeleted={() => {
            // TODO: Refresh data
            console.log('Event year deleted, refresh needed');
          }}
        />
      )}
    </div>
  );
}