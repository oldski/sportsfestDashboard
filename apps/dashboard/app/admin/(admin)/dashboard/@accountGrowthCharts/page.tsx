'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { TrendingUpIcon } from "lucide-react";
import { UserRegistrationChart } from "~/components/admin/charts/user-registration-chart";
import { OrganizationRegistrationChart } from "~/components/admin/charts/organization-registration-chart";
import { getUserRegistrations } from "~/actions/admin/get-user-registrations";
import { getOrganizationRegistrations } from "~/actions/admin/get-organization-registrations";

export default function AccountGrowthChartsPage(): React.JSX.Element {
  const [userFrequency, setUserFrequency] = React.useState<'day' | 'week' | 'month'>('day');
  const [orgFrequency, setOrgFrequency] = React.useState<'day' | 'week' | 'month'>('day');
  const [userRegistrationData, setUserRegistrationData] = React.useState<any>(null);
  const [organizationRegistrationData, setOrganizationRegistrationData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserRegistrations(userFrequency);
        setUserRegistrationData(userData);
      } catch (error) {
        console.error('Error fetching user registration data:', error);
      }
    };

    fetchUserData();
  }, [userFrequency]);

  React.useEffect(() => {
    const fetchOrgData = async () => {
      try {
        const orgData = await getOrganizationRegistrations(orgFrequency);
        setOrganizationRegistrationData(orgData);
      } catch (error) {
        console.error('Error fetching organization registration data:', error);
      }
    };

    fetchOrgData();
  }, [orgFrequency]);

  React.useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [userData, orgData] = await Promise.all([
          getUserRegistrations(userFrequency),
          getOrganizationRegistrations(orgFrequency)
        ]);
        setUserRegistrationData(userData);
        setOrganizationRegistrationData(orgData);
      } catch (error) {
        console.error('Error fetching registration data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5" />
            Account Growth
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <TrendingUpIcon className="h-5 w-5" />
          Account Growth
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="companies" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="companies">Company Accounts</TabsTrigger>
            <TabsTrigger value="users">User Accounts</TabsTrigger>
          </TabsList>

          <TabsContent value="companies" className="mt-4">
            <OrganizationRegistrationChart
              data={organizationRegistrationData || []}
              frequency={orgFrequency}
              onFrequencyChange={setOrgFrequency}
            />
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            <UserRegistrationChart
              data={userRegistrationData || []}
              frequency={userFrequency}
              onFrequencyChange={setUserFrequency}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}