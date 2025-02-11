import { NextResponse } from 'next/server';
import { getClient } from '../../../lib/db';

const client = getClient();

export async function GET(request: Request) {
  // For now, return mock data until database is set up
  return NextResponse.json([{
    message_id: 1,
    started_case_id: 1,
    persona_id: 1,
    content: "Welcome to the case discussion!",
    is_user_message: false,
    sent_at: new Date().toISOString(),
    read_at: null,
    metadata: {}
  }]);
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
