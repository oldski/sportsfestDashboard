import * as React from 'react';
import Link from 'next/link';
import { CalendarIcon, BarChartIcon, SettingsIcon, TrendingUpIcon } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { getEventYears } from '~/actions/admin/get-event-years';
import { formatDate, formatCurrency } from '~/lib/formatters';
import { ManageEventYear } from '~/components/admin/event-registration/manage-event-year';

export default async function EventYearStatsPage(): Promise<React.JSX.Element> {
  const eventYears = await getEventYears();
  const activeEventYear = eventYears.find(ey => ey.status === 'active');

  return (

    <>
      {activeEventYear && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                <CardTitle className="text-primary">Active Event Year</CardTitle>
                <Badge className="bg-primary text-primary-foreground">CURRENT</Badge>
              </div>
              <ManageEventYear activeEventYear={activeEventYear} />
            </div>
            <CardDescription>
              Currently active event year for registrations and product catalog
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Event Year</p>
                <p className="text-2xl font-bold">{activeEventYear.year}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Company Teams</p>
                <p className="text-2xl font-bold">{activeEventYear.companyTeamsCount}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Products</p>
                <p className="text-2xl font-bold">{activeEventYear.productCount}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(activeEventYear.totalRevenue)}</p>
                <div className="text-xs text-muted-foreground mt-1">
                  <span className="text-foreground/70">{formatCurrency(activeEventYear.registrationRevenue)}</span> reg
                  {activeEventYear.sponsorshipRevenue > 0 && (
                    <span> · <span className="text-foreground/70">{formatCurrency(activeEventYear.sponsorshipRevenue)}</span> spon</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Event Date</p>
                  <p className="text-sm">{formatDate(activeEventYear.endDate)}</p>
                </div>
                <div className="flex gap-2">
                  {activeEventYear.registrationOpen ? (
                    <Badge variant="default" className="bg-green-700 mt-1">Open</Badge>
                  ) : (
                    <Badge variant="secondary" className="mt-1">Closed</Badge>
                  )}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Registration Deadline</p>
                    <p className="text-sm">{formatDate(activeEventYear.registrationDeadline)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/*<div className="space-y-6">*/}


      {/*/!* Summary Stats *!/*/}
      {/*<div className="grid gap-4">*/}
      {/*  <Card>*/}
      {/*    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">*/}
      {/*      <CardTitle className="text-sm font-medium">Total Event Years</CardTitle>*/}
      {/*      <CalendarIcon className="h-4 w-4 text-muted-foreground" />*/}
      {/*    </CardHeader>*/}
      {/*    <CardContent>*/}
      {/*      <div className="text-2xl font-bold">{eventYears.length}</div>*/}
      {/*    </CardContent>*/}
      {/*  </Card>*/}

      {/*  <Card>*/}
      {/*    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">*/}
      {/*      <CardTitle className="text-sm font-medium">Active Events</CardTitle>*/}
      {/*      <BarChartIcon className="h-4 w-4 text-muted-foreground" />*/}
      {/*    </CardHeader>*/}
      {/*    <CardContent>*/}
      {/*      <div className="text-2xl font-bold">*/}
      {/*        {eventYears.filter(ey => ey.status === 'active').length}*/}
      {/*      </div>*/}
      {/*    </CardContent>*/}
      {/*  </Card>*/}

      {/*  <Card>*/}
      {/*    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">*/}
      {/*      <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>*/}
      {/*      <BarChartIcon className="h-4 w-4 text-muted-foreground" />*/}
      {/*    </CardHeader>*/}
      {/*    <CardContent>*/}
      {/*      <div className="text-2xl font-bold">*/}
      {/*        {eventYears.reduce((sum, ey) => sum + ey.organizationCount, 0)}*/}
      {/*      </div>*/}
      {/*    </CardContent>*/}
      {/*  </Card>*/}

      {/*  <Card>*/}
      {/*    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">*/}
      {/*      <CardTitle className="text-sm font-medium">Lifetime Revenue</CardTitle>*/}
      {/*      <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />*/}
      {/*    </CardHeader>*/}
      {/*    <CardContent>*/}
      {/*      <div className="text-2xl font-bold">*/}
      {/*        {formatCurrency(eventYears.reduce((sum, ey) => sum + ey.totalRevenue, 0))}*/}
      {/*      </div>*/}
      {/*    </CardContent>*/}
      {/*  </Card>*/}
      {/*</div>*/}

      {/*  /!* Dialogs *!/*/}
      {/*  <EventYearDialog*/}
      {/*    open={createDialogOpen}*/}
      {/*    onOpenChange={setCreateDialogOpen}*/}
      {/*    mode="create"*/}
      {/*  />*/}

      {/*  <EventYearDialog*/}
      {/*    open={editDialogOpen}*/}
      {/*    onOpenChange={setEditDialogOpen}*/}
      {/*    eventYear={selectedEventYear}*/}
      {/*    mode="edit"*/}
      {/*  />*/}

      {/*  {selectedEventYear && (*/}
      {/*    <DeleteEventYearDialog*/}
      {/*      open={deleteDialogOpen}*/}
      {/*      onOpenChange={setDeleteDialogOpen}*/}
      {/*      eventYear={selectedEventYear}*/}
      {/*      onDeleted={() => {*/}
      {/*        // TODO: Refresh data*/}
      {/*        console.log('Event year deleted, refresh needed');*/}
      {/*      }}*/}
      {/*    />*/}
      {/*  )}*/}
      {/*</div>*/}
    </>

  );
}
