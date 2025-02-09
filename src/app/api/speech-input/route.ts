import { NextResponse } from 'next/server';
import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect();

export async function POST(request: Request) {
  console.log('Received POST request for /api/speech-input');
  
  try {
    const { audioData } = await request.json();
    return NextResponse.json({ message: 'Audio data received' });
  } catch (error) {
    console.error('Error processing speech input:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
} 