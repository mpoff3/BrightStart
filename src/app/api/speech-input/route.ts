import { NextResponse } from 'next/server';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { Pool } from 'pg';
import { Readable } from 'stream';
import { WebSocketServer } from 'ws';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  const deepgram = createClient(process.env.DEEPGRAM_API_KEY || '');
  let dgConnection: any;

  ws.on('message', async (message: Buffer) => {
    try {
      if (message.toString() === 'START_STREAM') {
        // Initialize Deepgram live transcription
        dgConnection = deepgram.listen.live({
          smart_format: true,
          model: 'nova-2',
          language: 'en-US',
          interim_results: true
        });

        // Forward Deepgram transcripts to the client
        dgConnection.on('transcriptReceived', (data: any) => {
          const transcript = data?.channel?.alternatives?.[0]?.transcript || '';
          if (transcript) {
            ws.send(JSON.stringify({ type: 'transcript', data: transcript }));
          }
        });

        ws.send(JSON.stringify({ type: 'status', data: 'ready' }));
      } else if (message.toString() === 'END_STREAM') {
        dgConnection?.finish();
      } else {
        // Forward audio data to Deepgram
        dgConnection?.send(message);
      }
    } catch (error) {
      console.error('WebSocket error:', error);
      ws.send(JSON.stringify({ type: 'error', data: 'Transcription error' }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    dgConnection?.finish();
  });
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const audioFile = formData.get('audio') as Blob;
  const startedCaseId = formData.get('started_case_id');
  const isHuman = true;

  console.log('Received audio submission:', {
    hasAudioFile: !!audioFile,
    startedCaseId,
    audioSize: audioFile?.size,
    audioType: audioFile?.type
  });

  if (!audioFile || !startedCaseId) {
    return NextResponse.json(
      { error: 'Audio file and started_case_id are required' },
      { status: 400 }
    );
  }

  let client;
  try {
    // Convert audio to buffer and create a readable stream
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = Readable.from(buffer);

    console.log('Audio buffer size:', buffer.length);

    // Create Deepgram client
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY || '');

    const transcriptionPromise = new Promise((resolve, reject) => {
      const live = deepgram.listen.live({
        smart_format: true,
        model: 'nova-2',
        language: 'en-US'
      });

      let transcript = '';

      live.on(LiveTranscriptionEvents.Open, () => {
        console.log('Deepgram connection opened');

        // Send audio data in chunks
        stream.on('data', (chunk) => {
          if (chunk.length > 0) {
            live.send(chunk);
          }
        });

        stream.on('end', () => {
          console.log('Finished sending audio data');
          live.finish();
        });
      });

      live.on(LiveTranscriptionEvents.Transcript, (data) => {
        try {
          const newTranscript = data.channel?.alternatives?.[0]?.transcript;
          if (newTranscript) {
            transcript += newTranscript + ' ';
            console.log('Received transcript chunk:', newTranscript);
          }
        } catch (error) {
          console.error('Error processing transcript:', error);
        }
      });

      live.on(LiveTranscriptionEvents.Close, () => {
        console.log('Deepgram connection closed');
        resolve(transcript.trim());
      });

      live.on(LiveTranscriptionEvents.Error, (error) => {
        console.error('Deepgram error:', error);
        reject(error);
      });

      // Set a timeout
      setTimeout(() => {
        live.finish();
        reject(new Error('Transcription timeout'));
      }, 30000);
    });

    const transcript = await transcriptionPromise;
    console.log('Final transcript:', transcript);

    if (!transcript) {
      throw new Error('No transcript generated');
    }

    // Save to database
    client = await pool.connect();
    console.log('Saving to database:', {
      startedCaseId,
      transcript,
      isHuman
    });

    const result = await client.query(
      `INSERT INTO messages 
        (started_case_id, content, is_human, time_sent) 
       VALUES ($1::uuid, $2, $3, CURRENT_TIMESTAMP) 
       RETURNING *`,
      [startedCaseId, transcript, isHuman]
    );

    console.log('Saved to database:', result.rows[0]);
    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error('Error processing audio:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process audio message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
} 