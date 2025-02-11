import { NextResponse } from 'next/server';
import { getClient } from '@/lib/db';

export async function GET() {
  const client = await getClient();
  
  try {
    const result = await client.query('SELECT * FROM cases');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching cases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cases' },
      { status: 500 }
    );
  } finally {
    client.release(); // Important: Release the client back to the pool
  }
} 