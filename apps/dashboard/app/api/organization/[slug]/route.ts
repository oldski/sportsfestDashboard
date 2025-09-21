import { NextRequest, NextResponse } from 'next/server';
import { db, eq } from '@workspace/database/client';
import { organizationTable } from '@workspace/database/schema';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Organization slug is required' },
        { status: 400 }
      );
    }

    const organization = await db
      .select({
        id: organizationTable.id,
        name: organizationTable.name,
        slug: organizationTable.slug,
      })
      .from(organizationTable)
      .where(eq(organizationTable.slug, slug))
      .limit(1);

    if (organization.length === 0) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(organization[0]);
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}