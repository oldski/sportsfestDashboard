import * as React from 'react';
import {getCustomRecruitmentDocuments} from '~/data/wordpress/get-recruitment-documents';
import { RecruitmentDocumentsSimple } from '~/components/organizations/slug/dashboard/recruitment-documents-simple';
import { getOrganizationDashboardStats } from '~/data/organization/get-organization-dashboard-stats';

interface RecruitmentToolsPageProps {
  params: { slug: string };
}

export default async function RecruitmentToolsPage({ params }: RecruitmentToolsPageProps): Promise<React.JSX.Element> {
  const { slug } = await params;

  // Fetch recruitment documents from WordPress
  const documentsResult = await getCustomRecruitmentDocuments();

  // Fetch organization and event data
  const stats = await getOrganizationDashboardStats();

  return (
    <RecruitmentDocumentsSimple
      documents={documentsResult.documents}
      organizationSlug={slug}
      organizationName={stats.organizationName}
      eventYearName={stats.currentEventYear.name}
      eventDate={stats.currentEventYear.eventEndDate}
      locationName={stats.currentEventYear.locationName}
      address={stats.currentEventYear.address}
      city={stats.currentEventYear.city}
      state={stats.currentEventYear.state}
      zipCode={stats.currentEventYear.zipCode}
      latitude={stats.currentEventYear.latitude}
      longitude={stats.currentEventYear.longitude}
      error={documentsResult.error}
    />
  );
}
