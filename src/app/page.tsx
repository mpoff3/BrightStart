"use client";
import { useRouter } from "next/navigation";
import styles from './page.module.css';
import { useEffect, useState, useRef } from 'react';
import Link from "next/link";

interface Case {
  case_id: number;
  title: string;
  description: string;
  file_name: string;
  file_path: string;
  file_hash: {
    type: string;
    data: number[];
  };
  file_size: string;
  is_public: boolean;
  uploader_id: number;
  uploaded_at: string;
  updated_at: string;
}

export default function Home() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add new state variables for audio recording
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await fetch('/api/cases');
        const data = await response.json();
        setCases(data);
      } catch (error) {
        console.error('Error fetching cases:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  // Add new functions for audio handling
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
        audioBitsPerSecond: 128000
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          console.log('Received audio chunk:', event.data.size, 'bytes');
        }
      };

      mediaRecorder.start(100); // Collect data in 100ms chunks
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return;

    return new Promise<void>((resolve) => {
      if (!mediaRecorderRef.current) return;

      mediaRecorderRef.current.onstop = async () => {
        // Create blob with specific options
        const audioBlob = new Blob(chunksRef.current, { 
          type: 'audio/webm' 
        });
        console.log('Created audio blob:', {
          type: audioBlob.type,
          size: audioBlob.size,
          chunks: chunksRef.current.length
        });
        
        const reader = new FileReader();

        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          console.log('Audio converted to base64, length:', base64Audio.length);
          
          try {
            console.log('Sending audio for transcription...');
            const response = await fetch('/api/transcribe', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                audio: base64Audio,
                mimeType: 'audio/webm;codecs=opus',
              }),
            });

            const data = await response.json();
            console.log('API response:', data);

            if (!response.ok) {
              throw new Error(
                `API error (${response.status}): ${data.error} - ${data.details}\nTimestamp: ${data.timestamp}`
              );
            }

            if (!data.transcription) {
              throw new Error('No transcription received from API');
            }

            setTranscription(data.transcription);
          } catch (error) {
            console.error('Error transcribing audio:', error);
            setTranscription(
              `Error: Failed to transcribe audio. ${error.message}\nPlease try again or check the console for more details.`
            );
          }
        };

        reader.onerror = (error) => {
          console.error('Error reading audio file:', error);
          setTranscription('Error: Failed to process audio file. Please try again.');
        };

        reader.readAsDataURL(audioBlob);
        resolve();
      };

      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    });
  };

  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.logo}>
          CaseAI
        </div>
        <div className={styles.navRight}>
        <Link href="/test" className={styles.testLink}>Test API</Link>
          <a href="#account">Account</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>AI-Driven Case Discussions</h1>
          <h2>Experience Harvard's Case Method Today</h2>
          
          {/* Add Audio Recording UI */}
          <div className={styles.audioSection}>
            <div className={styles.recordingControls}>
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className={styles.recordButton}
                >
                  Start Recording
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className={styles.stopButton}
                >
                  Stop Recording
                </button>
              )}
            </div>
            {transcription && (
              <div className={styles.transcriptionBox}>
                <h3>Transcription:</h3>
                <p>{transcription}</p>
              </div>
            )}
          </div>

          <div className={styles.heroCardsSection}>
            <div className={styles.heroCards}>
              {loading ? (
                <div className={styles.loading}>Loading cases...</div>
              ) : (
                cases.map((caseItem) => (
                  <div key={caseItem.case_id} className={styles.heroCardGroup}>
                    <div
                      onClick={() => router.push(`/case/${caseItem.case_id}`)}
                      className={styles.heroCard}
                    >
                      <div 
                        className={styles.heroCardImage}
                        style={{ 
                          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7))` 
                        }}
                      />
                      <div className={styles.heroCardContent}>
                        <h3 className={styles.heroCardTitle}>{caseItem.title}</h3>
                        <p className={styles.heroCardDescription}>{caseItem.description}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
