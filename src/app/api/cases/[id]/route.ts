import { NextResponse } from 'next/server';
import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect();

export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }];
}

export async function GET(
  request: Request,
): Promise<NextResponse> {
  try {
    // Get case ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const caseId = pathParts[pathParts.length - 1];

    if (!caseId) {
      return NextResponse.json(
        { error: 'Case ID is required' },
        { status: 400 }
      );
    }

    const result = await client.query(
      'SELECT * FROM cases WHERE case_id = $1',
      [caseId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching case:', error);
    return NextResponse.json(
      { error: 'Database query failed' },
      { status: 500 }
    );
  }
} 