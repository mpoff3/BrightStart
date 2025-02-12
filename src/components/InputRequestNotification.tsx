"use client";
import { useEffect, useRef, useState } from 'react';

interface InputRequestNotificationProps {
  isVisible: boolean;
  isQueueEmpty: boolean;
  onRecordingStart: () => void;
  onRecordingStop: (audioBlob: Blob) => void;
}

export default function InputRequestNotification({
  isVisible,
  isQueueEmpty,
  onRecordingStart,
  onRecordingStop
}: InputRequestNotificationProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState<number[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Set up audio analysis
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyser = audioContextRef.current.createAnalyser();
      analyserRef.current = analyser;
      source.connect(analyser);
      analyser.fftSize = 256;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateAudioData = () => {
        if (!isRecording) return;
        analyser.getByteFrequencyData(dataArray);
        setAudioData(Array.from(dataArray));
        animationFrameRef.current = requestAnimationFrame(updateAudioData);
      };

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingStop(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };

      setIsRecording(true);
      onRecordingStart();
      mediaRecorder.start();
      updateAudioData();
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className={`fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2
      transition-all duration-300 ease-in-out ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
      <div className="bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700 
        p-8 flex flex-col items-center gap-6 w-[480px]">
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-gray-200 mb-2">Awaiting your input</h3>
          <p className="text-lg text-gray-400">
            {isQueueEmpty ? "Click the microphone to respond" : "Please wait for all messages to be read"}
          </p>
        </div>

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!isQueueEmpty}
          className={`relative p-8 rounded-full transition-all duration-300 ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600' 
              : isQueueEmpty
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          {/* Audio visualization - make it larger */}
          {isRecording && (
            <div className="absolute inset-0 flex items-center justify-center">
              {audioData.slice(0, 32).map((value, index) => (
                <div
                  key={index}
                  className="w-1 mx-px bg-white opacity-75"
                  style={{
                    height: `${(value / 255) * 100}%`,
                    transform: `scaleY(${(value / 255) * 1.5})`,
                    transition: 'transform 50ms',
                  }}
                />
              ))}
            </div>
          )}
          
          {/* Larger microphone icon */}
          <svg 
            className={`w-10 h-10 ${isRecording ? 'text-white' : 'text-gray-100'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
            />
          </svg>
        </button>
      </div>
    </div>
  );
} 