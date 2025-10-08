import { NextRequest, NextResponse } from 'next/server';

const DASHBOARD_API_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || process.env.DASHBOARD_API_URL || 'http://localhost:3000';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const response = await fetch(`${DASHBOARD_API_URL}/api/organization/${encodeURIComponent(slug)}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Organization not found' },
          { status: 404 }
        );
      }
      throw new Error(`Dashboard API responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying organization request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}