import { NextResponse } from 'next/server';
import { getClient } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startedCaseId = searchParams.get('started_case_id');

  if (!startedCaseId) {
    return NextResponse.json(
      { error: 'started_case_id is required' },
      { status: 400 }
    );
  }


    const client = await getClient();

  try {
    const result = await client.query(
      `SELECT * FROM personas 
       WHERE started_case_id = $1 
       ORDER BY name ASC`,
      [startedCaseId]
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching personas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personas' },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
} 