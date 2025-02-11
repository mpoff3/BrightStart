import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Create a pool instance
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: Request) {
  // Get the started_case_id from URL params
  const { searchParams } = new URL(request.url);
  const startedCaseId = searchParams.get('started_case_id');

  if (!startedCaseId) {
    return NextResponse.json(
      { error: 'started_case_id is required' },
      { status: 400 }
    );
  }

  // Get a client from the pool
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT * FROM messages 
       WHERE started_case_id = $1 
       ORDER BY sent_at ASC`,
      [startedCaseId]
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  } finally {
    // Always release the client back to the pool
    client.release();
  }
}

export async function POST(request: Request) {
  try {
    let body;
    const contentType = request.headers.get('content-type');

    if (contentType?.includes('multipart/form-data')) {
      // Handle form data
      const formData = await request.formData();
      body = {
        started_case_id: parseInt(formData.get('started_case_id') as string),
        persona_id: parseInt(formData.get('persona_id') as string),
        content: formData.get('content') as string,
        is_user_message: formData.get('is_user_message') === 'true'
      };
    } else {
      // Handle JSON
      body = await request.json();
    }

    console.log('Parsed message data:', body);

    const { started_case_id, persona_id, content, is_user_message } = body;

    // Validate required fields
    if (!started_case_id || !content) {
      return NextResponse.json(
        { error: 'started_case_id and content are required' },
        { status: 400 }
      );
    }

    // Get a client from the pool
    const client = await pool.connect();

    const result = await client.query(
      `INSERT INTO messages 
        (started_case_id, persona_id, content, is_user_message, sent_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING *`,
      [started_case_id, persona_id, content, is_user_message]
    );

    // Notify listeners about the new message
    await client.query(
      `NOTIFY new_messages_${started_case_id}, '${JSON.stringify({
        message_id: result.rows[0].message_id,
      })}'`
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create message',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 
