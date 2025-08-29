import * as React from 'react';
import Link from 'next/link';

import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import {Page, PageActions, PageBody, PageHeader, PagePrimaryBar, PageSecondaryBar} from "@workspace/ui/components/page";
import {AdminPageTitle} from "~/components/admin/admin-page-title";
import {
  SidebarTrigger
} from "@workspace/ui/components/sidebar";
import {Separator} from "@workspace/ui/components/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage,
  BreadcrumbSeparator
} from "@workspace/ui/components/breadcrumb";

interface EventRegistrationLayoutProps {
  children: React.ReactNode;
}

export default function EventRegistrationLayout({ children }: EventRegistrationLayoutProps): React.JSX.Element {
  return(
    <Page>
      <PageHeader>
        <PagePrimaryBar>


          <AdminPageTitle
            title="Event Registration Management"
            info="Registration Management"
          />
          <PageActions>
            actions area. see org / home for reference
          </PageActions>
        </PagePrimaryBar>
        <PageSecondaryBar>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview" asChild>
                <Link href="/admin/event-registration">Overview</Link>
              </TabsTrigger>
              <TabsTrigger value="products" asChild>
                <Link href="/admin/event-registration/products">Products</Link>
              </TabsTrigger>
              <TabsTrigger value="event-years" asChild>
                <Link href="/admin/event-registration/event-years">Event Years</Link>
              </TabsTrigger>
              <TabsTrigger value="tent-tracking" asChild>
                <Link href="/admin/event-registration/tent-tracking">Tent Tracking</Link>
              </TabsTrigger>
              <TabsTrigger value="payments" asChild>
                <Link href="/admin/event-registration/payments">Payments</Link>
              </TabsTrigger>
              <TabsTrigger value="invoices" asChild>
                <Link href="/admin/event-registration/invoices">Invoices</Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </PageSecondaryBar>
      </PageHeader>
      <PageBody>
        <div className="mx-auto w-full space-y-2 p-2 sm:space-y-8 sm:p-6">
          {children}
        </div>
      </PageBody>
    </Page>
  )
}
