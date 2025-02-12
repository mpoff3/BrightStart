import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }];
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  let client;
  try {
    client = await pool.connect();
    // Join with started_cases to get the full case information
    const result = await client.query(
      `SELECT c.*, sc.started_case_id, sc.status, sc.start_time 
       FROM cases c
       LEFT JOIN started_cases sc ON c.case_id = sc.case_id
       WHERE c.case_id = $1`,
      [params.id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching case:', error);
    return NextResponse.json(
      { error: 'Failed to fetch case' },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
} 