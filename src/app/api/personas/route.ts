import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startedCaseId = searchParams.get('started_case_id');

  if (!startedCaseId) {
    return NextResponse.json(
      { error: 'started_case_id is required' },
      { status: 400 }
    );
  }

  let client;
  try {
    client = await pool.connect();
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