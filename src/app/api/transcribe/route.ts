import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { audio, mimeType } = await request.json();

    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      console.error('Missing Deepgram API key in environment variables');
      throw new Error('Deepgram API key is not configured');
    }

    console.log('API Key first 4 chars:', apiKey?.substring(0, 4));
    console.log('Received MIME type:', mimeType);

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audio, 'base64');
    console.log('Audio buffer size:', audioBuffer.length, 'bytes');

    try {
      // Send to Deepgram API with additional parameters
      const response = await fetch('https://api.deepgram.com/v1/listen?model=general&language=en-US&smart_format=true', {
        method: 'POST',
        headers: {
          'Authorization': 'Token ' + apiKey,
          'Content-Type': mimeType,
        },
        body: audioBuffer,
      });

      // Log request details
      console.log('Request details:', {
        url: 'https://api.deepgram.com/v1/listen',
        method: 'POST',
        contentType: mimeType,
        bufferSize: audioBuffer.length,
        responseStatus: response.status
      });

      const responseText = await response.text();
      console.log('Raw Deepgram response:', responseText);

      if (!response.ok) {
        throw new Error(`Deepgram API error: ${response.status} ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed Deepgram response:', JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.error('Failed to parse Deepgram response:', parseError);
        throw new Error('Invalid JSON response from Deepgram');
      }

      if (!data.results) {
        console.error('No results in Deepgram response:', data);
        throw new Error('No results in Deepgram response');
      }

      const channels = data.results.channels;
      if (!channels || channels.length === 0) {
        console.error('No channels in Deepgram response:', data.results);
        throw new Error('No channels in Deepgram response');
      }

      const alternatives = channels[0].alternatives;
      if (!alternatives || alternatives.length === 0) {
        console.error('No alternatives in Deepgram response:', channels[0]);
        throw new Error('No alternatives in Deepgram response');
      }

      const transcription = alternatives[0].transcript;
      if (!transcription) {
        console.error('Empty transcript in Deepgram response:', alternatives[0]);
        throw new Error('Empty transcript in Deepgram response');
      }

      // Store the transcription in the database
      try {
        const currentTime = new Date();
        
        // First, find an active user (for testing, use the first user)
        const user = await prisma.users.findFirst();
        if (!user) {
          throw new Error('No user found in the database');
        }

        // Find the first case
        const firstCase = await prisma.cases.findFirst();
        if (!firstCase) {
          throw new Error('No case found in the database');
        }

        // Find or create a started case
        let startedCase = await prisma.started_cases.findFirst({
          where: {
            user_id: user.user_id,
            case_id: firstCase.case_id, // Look for specific case
            status: {
              in: ['not_started', 'in_progress', 'paused']
            }
          },
        });

        if (!startedCase) {
          // Only create if one doesn't exist
          try {
            startedCase = await prisma.started_cases.create({
              data: {
                user_id: user.user_id,
                case_id: firstCase.case_id,
                status: 'in_progress',
              }
            });
          } catch (createError) {
            // If creation fails due to race condition, try finding again
            startedCase = await prisma.started_cases.findFirst({
              where: {
                user_id: user.user_id,
                case_id: firstCase.case_id,
              },
            });
            
            if (!startedCase) {
              throw new Error('Failed to create or find started case');
            }
          }
        } else if (startedCase.status !== 'in_progress') {
          // Update status if not in progress
          startedCase = await prisma.started_cases.update({
            where: {
              started_case_id: startedCase.started_case_id
            },
            data: {
              status: 'in_progress'
            }
          });
        }

        // Create the message
        const message = await prisma.messages.create({
          data: {
            started_case_id: startedCase.started_case_id,
            user_id: user.user_id,
            content: transcription,
            is_user_message: true,
            sent_at: currentTime,
            metadata: {
              source: 'speech-to-text',
              provider: 'deepgram'
            },
          },
        });

        console.log('Stored message in database:', message);
        return NextResponse.json({ transcription });

      } catch (dbError) {
        console.error('Database error details:', {
          name: dbError.name,
          message: dbError.message,
          code: dbError.code,
          meta: dbError.meta,
        });
        throw new Error(`Database error: ${dbError.message}`);
      }

    } catch (fetchError) {
      console.error('Deepgram API error:', fetchError);
      throw fetchError;
    }
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to transcribe audio', 
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 