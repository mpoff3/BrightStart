import { NextResponse } from 'next/server';
import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect();

export async function GET(request: Request) {
  console.log('Received GET request for /api/personas');
  
  // Get started_case_id from URL parameters
  const { searchParams } = new URL(request.url);
  const started_case_id = searchParams.get('started_case_id');
  
  try {
    let query = 'SELECT * FROM personas';
    let params: any[] = [];
    
    if (started_case_id) {
      query += ' WHERE started_case_id = $1';
      params.push(started_case_id);
    }
    
    const result = await client.query(query, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching personas:', error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
} 