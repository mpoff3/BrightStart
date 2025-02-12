import { NextResponse } from 'next/server';
import { getClient } from '@/lib/db';

export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }];
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const client = getClient();
  
  try {
    const caseId = params.id; // Now properly typed and handled
    
    const result = await client.query(
      'SELECT case_id::text, title, content FROM cases WHERE case_id = $1::uuid',
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
      { error: 'Failed to fetch case' },
      { status: 500 }
    );
  }
} 