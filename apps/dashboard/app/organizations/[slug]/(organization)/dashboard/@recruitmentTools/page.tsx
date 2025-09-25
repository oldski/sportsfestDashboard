import * as React from 'react';
import {getCustomRecruitmentDocuments} from '~/data/wordpress/get-recruitment-documents';
import { RecruitmentDocumentsSimple } from '~/components/organizations/slug/dashboard/recruitment-documents-simple';

interface RecruitmentToolsPageProps {
  params: { slug: string };
}

export default async function RecruitmentToolsPage({ params }: RecruitmentToolsPageProps): Promise<React.JSX.Element> {
  // Fetch recruitment documents from WordPress
  const documentsResult = await getCustomRecruitmentDocuments();

  return (
    <RecruitmentDocumentsSimple
      documents={documentsResult.documents}
      organizationSlug={params.slug}
      error={documentsResult.error}
    />
  );
}
