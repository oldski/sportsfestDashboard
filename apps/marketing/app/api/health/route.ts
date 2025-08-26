import { NextResponse } from 'next/server';

export async function GET(): Promise<Response> {
  try {
    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    const { statusCode = 503 } = err as { statusCode?: number };
    return new NextResponse(undefined, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  }
}
