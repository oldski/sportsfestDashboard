import { NextResponse } from 'next/server';
import { db } from '@workspace/database/client';
import { organizationTable } from '@workspace/database/schema';

export async function GET() {
  try {
    const organizations = await db
      .select({
        id: organizationTable.id,
        name: organizationTable.name,
        slug: organizationTable.slug,
      })
      .from(organizationTable)
      .limit(10);

    return NextResponse.json({
      organizations,
      count: organizations.length
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Database error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}