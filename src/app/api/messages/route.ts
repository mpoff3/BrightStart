import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Create a single pool instance that's reused across requests
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Limit maximum connections
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000 // Return an error after 2 seconds if connection could not be established
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

  let client;
  try {
    // Get a client from the pool
    client = await pool.connect();

    let query = `
      SELECT * FROM messages 
      WHERE started_case_id = $1
    `;
    const params = [startedCaseId];

    if (afterId) {
      query += ` AND message_id > $2`;
      params.push(afterId);
    }

    query += ` ORDER BY sent_at ASC`;

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
    let body;
    const contentType = request.headers.get('content-type');

    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      body = {
        started_case_id: parseInt(formData.get('started_case_id') as string),
        persona_id: parseInt(formData.get('persona_id') as string),
        content: formData.get('content') as string,
        is_user_message: formData.get('is_user_message') === 'true'
      };
    } else {
      body = await request.json();
    }

    const { started_case_id, persona_id, content, is_user_message } = body;

    if (!started_case_id || !content) {
      return NextResponse.json(
        { error: 'started_case_id and content are required' },
        { status: 400 }
      );
    }

    client = await pool.connect();

    // Insert the user's message
    const userResult = await client.query(
      `INSERT INTO messages 
        (started_case_id, persona_id, content, is_user_message, sent_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING *`,
      [started_case_id, persona_id, content, is_user_message]
    );

    // Simulate AI responses for testing
    const testResponses = [
      "I understand your concern. Let me address that point by point.",
      "That's an interesting perspective. Here's what I think about it.",
      "I'd like to add some additional context to this discussion."
    ];

    // Insert AI responses with slight delays between them
    const aiResponses = [];
    for (let i = 0; i < testResponses.length; i++) {
      // Add a small delay between insertions to simulate natural timing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const aiResult = await client.query(
        `INSERT INTO messages 
          (started_case_id, persona_id, content, is_user_message, sent_at) 
         VALUES ($1, $2, $3, false, NOW() + interval '${i + 1} seconds') 
         RETURNING *`,
        [started_case_id, persona_id, testResponses[i]]
      );
      
      aiResponses.push(aiResult.rows[0]);
    }

    // Return both the user message and AI responses
    return NextResponse.json({
      userMessage: userResult.rows[0],
      aiResponses: aiResponses
    });

  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create message',
        details: error.message 
      },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
} 
