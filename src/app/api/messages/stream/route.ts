import { NextResponse } from 'next/server';
import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const started_case_id = searchParams.get('started_case_id');

  if (!started_case_id) {
    return NextResponse.json({ error: 'started_case_id is required' }, { status: 400 });
  }

  let controller: ReadableStreamDefaultController;
  const cleanup = async () => {
    try {
      await client.query(`UNLISTEN new_messages_${started_case_id}`);
      client.removeListener('notification', handleNotification);
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  };

  const handleNotification = async (msg: any) => {
    try {
      if (msg.channel === `new_messages_${started_case_id}`) {
        const payload = JSON.parse(msg.payload || '{}');
        
        const result = await client.query(
          `SELECT m.*, p.name as persona_name, p.role as persona_role 
           FROM messages m 
           LEFT JOIN personas p ON m.persona_id = p.persona_id 
           WHERE m.message_id = $1`,
          [payload.message_id]
        );

        if (result.rows.length > 0 && controller) {
          controller.enqueue(`data: ${JSON.stringify(result.rows[0])}\n\n`);
        }
      }
    } catch (error) {
      console.error('Error handling notification:', error);
      await cleanup();
    }
  };

  const stream = new ReadableStream({
    start: async (ctrl) => {
      controller = ctrl;
      try {
        await client.query(`LISTEN new_messages_${started_case_id}`);
        client.on('notification', handleNotification);
      } catch (error) {
        console.error('Stream start error:', error);
        controller.error(error);
        await cleanup();
      }
    },
    cancel: async () => {
      await cleanup();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
} 