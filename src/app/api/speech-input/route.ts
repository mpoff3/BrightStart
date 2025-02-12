import { NextResponse } from 'next/server';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const audioFile = formData.get('audio') as Blob;
  const startedCaseId = formData.get('started_case_id');
  const isHuman = true; // Audio messages are always from humans

  console.log('Received audio submission:', {
    hasAudioFile: !!audioFile,
    startedCaseId,
    isHuman,
    audioSize: audioFile?.size
  });

  if (!audioFile || !startedCaseId) {
    return NextResponse.json(
      { error: 'Audio file and started_case_id are required' },
      { status: 400 }
    );
  }

  let client;
  try {
    // Convert audio to buffer
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    console.log('Audio buffer size:', buffer.length);

    // Create Deepgram client
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY || '');

    // Create a promise to handle the transcription
    const transcriptionPromise = new Promise((resolve, reject) => {
      // Create a live transcription connection
      const connection = deepgram.listen.live({
        model: 'nova-3',
        language: 'en-US',
        smart_format: true,
      });

      let transcript = '';

      // Handle events
      connection.on(LiveTranscriptionEvents.Open, () => {
        console.log('Connection opened');
        
        // Send the audio data
        connection.send(buffer);
        
        // Close the connection after sending
        connection.finish();
      });

      connection.on(LiveTranscriptionEvents.Transcript, (data) => {
        const newTranscript = data.channel.alternatives[0].transcript;
        if (newTranscript) {
          transcript += newTranscript + ' ';
        }
      });

      connection.on(LiveTranscriptionEvents.Close, () => {
        console.log('Connection closed, final transcript:', transcript);
        resolve(transcript.trim());
      });

      connection.on(LiveTranscriptionEvents.Error, (error) => {
        console.error('Deepgram error:', error);
        reject(error);
      });

      // Set a timeout in case the connection hangs
      setTimeout(() => {
        connection.finish();
        reject(new Error('Transcription timeout'));
      }, 30000); // 30 second timeout
    });

    // Wait for transcription to complete
    const transcript = await transcriptionPromise;
    console.log('Received transcript:', transcript);

    if (!transcript) {
      throw new Error('No transcript generated');
    }

    // Save to database
    client = await pool.connect();
    console.log('Saving to database:', {
      startedCaseId,
      isHuman,
      transcript,
    });

    const result = await client.query(
      `INSERT INTO messages 
        (started_case_id, content, is_human, time_sent) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP) 
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