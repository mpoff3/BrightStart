import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Create a single pool instance that's reused across requests
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Limit maximum connections
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  ssl: {
    rejectUnauthorized: false
  }
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startedCaseId = searchParams.get('started_case_id');
  const afterId = searchParams.get('after_id');

  if (!startedCaseId) {
    return NextResponse.json(
      { error: 'started_case_id is required' },
      { status: 400 }
    );
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(startedCaseId)) {
    return NextResponse.json(
      { error: 'Invalid UUID format for started_case_id' },
      { status: 400 }
    );
  }

  let client;
  try {
    // Get a client from the pool
    client = await pool.connect();

    let query = `
      SELECT * FROM messages 
      WHERE started_case_id = $1::uuid
    `;
    const params = [startedCaseId];

    if (afterId) {
      query += ` AND time_sent > (SELECT time_sent FROM messages WHERE message_id = $2::uuid)`;
      params.push(afterId);
    }

    query += ` ORDER BY time_sent ASC`;

    const result = await client.query(query, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  } finally {
    // Always release the client back to the pool
    if (client) client.release();
  }
}

export async function POST(request: Request) {
  let client;
  try {
    const body = await request.json();
    const { started_case_id, content, is_human } = body;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(started_case_id)) {
      return NextResponse.json(
        { error: 'Invalid UUID format for started_case_id' },
        { status: 400 }
      );
    }

    if (!started_case_id || !content) {
      return NextResponse.json(
        { error: 'started_case_id and content are required' },
        { status: 400 }
      );
    }

    client = await pool.connect();

    const result = await client.query(
      `INSERT INTO messages 
        (started_case_id, content, is_human, time_sent) 
       VALUES ($1::uuid, $2, $3, CURRENT_TIMESTAMP) 
       RETURNING *`,
      [started_case_id, content, is_human]
    );

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
} 
