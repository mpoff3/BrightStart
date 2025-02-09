import { NextResponse } from 'next/server';
import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect();

export async function GET() {
  console.log('Received GET request for /api/cases');
  
  try {
    const result = await client.query('SELECT * FROM cases');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching cases:', error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
} 