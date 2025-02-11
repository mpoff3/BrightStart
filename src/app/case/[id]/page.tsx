"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from 'next/image';

interface Persona {
  persona_id: number;
  started_case_id: number;
  name: string;
  role: string;
  description: string;
  avatar_url: string;
  system_prompt: string;
  created_at: string;
}

interface Message {
  message_id: number;
  started_case_id: number;
  persona_id: number | null;
  user_id: number | null;
  content: string;
  is_user_message: boolean;
  sent_at: string;
  read_at: string | null;
  metadata: any;
}

interface Case {
  case_id: number;
  title: string;
  description: string;
  // ... other case fields
}

export default function CasePage() {
  const params = useParams();
  const router = useRouter();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentInput, setCurrentInput] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [speakingPersonaId, setSpeakingPersonaId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [lastMessageId, setLastMessageId] = useState<number>(0);
  const [messageQueue, setMessageQueue] = useState<Message[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const queueProcessorRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const caseResponse = await fetch(`/api/cases/${params.id}`);
        const caseData = await caseResponse.json();
        setCaseData(caseData);

        const personasResponse = await fetch(`/api/personas?started_case_id=${params.id}`);
        const personasData = await personasResponse.json();
        setPersonas(personasData);

        const messagesResponse = await fetch(`/api/messages?started_case_id=${params.id}`);
        const messagesData = await messagesResponse.json();
        setMessages(messagesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  // Modified playTextToSpeech function to return a promise that resolves when audio finishes
  const playTextToSpeech = async (text: string, personaId: number): Promise<void> => {
    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Text-to-speech request failed');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      return new Promise((resolve, reject) => {
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.onplay = () => setSpeakingPersonaId(personaId);
          audioRef.current.onended = () => {
            setSpeakingPersonaId(null);
            URL.revokeObjectURL(audioUrl);
            resolve();
          };
          audioRef.current.onerror = (e) => {
            URL.revokeObjectURL(audioUrl);
            reject(e);
          };
          audioRef.current.play().catch(reject);
        } else {
          reject(new Error('Audio element not found'));
        }
      });
    } catch (error) {
      console.error('Error playing text-to-speech:', error);
      setSpeakingPersonaId(null);
      throw error;
    }
  };

  // Modified fetchNewMessages to properly queue messages
  const fetchNewMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/messages?started_case_id=${params.id}&after_id=${lastMessageId}`);
      const newMessages = await response.json();
      
      if (newMessages.length > 0) {
        setMessages(prev => [...prev, ...newMessages]);
        setLastMessageId(newMessages[newMessages.length - 1].message_id);
        
        // Add non-user messages to the queue in order
        const nonUserMessages = newMessages.filter(msg => !msg.is_user_message);
        if (nonUserMessages.length > 0) {
          setMessageQueue(prev => [...prev, ...nonUserMessages]);
        }
      }
    } catch (error) {
      console.error('Error polling messages:', error);
    }
  }, [params.id, lastMessageId]);

  // Modified queue processor
  useEffect(() => {
    const processQueue = async () => {
      if (messageQueue.length > 0 && !isPlaying) {
        setIsPlaying(true);
        const message = messageQueue[0];
        
        try {
          await playTextToSpeech(message.content, message.persona_id);
          setMessageQueue(prev => prev.slice(1)); // Remove the processed message
        } catch (error) {
          console.error('Error playing message:', error);
        } finally {
          setIsPlaying(false);
        }
      }
    };

    // Clear any existing interval
    if (queueProcessorRef.current) {
      clearInterval(queueProcessorRef.current);
    }

    // Set up a new interval to check the queue regularly
    queueProcessorRef.current = setInterval(processQueue, 500);

    // Cleanup
    return () => {
      if (queueProcessorRef.current) {
        clearInterval(queueProcessorRef.current);
      }
    };
  }, [messageQueue, isPlaying]);

  // Initial messages fetch
  useEffect(() => {
    const fetchInitialMessages = async () => {
      try {
        const messagesResponse = await fetch(`/api/messages?started_case_id=${params.id}`);
        const messagesData = await messagesResponse.json();
        setMessages(messagesData);
        
        // Set the last message ID if there are messages
        if (messagesData.length > 0) {
          setLastMessageId(messagesData[messagesData.length - 1].message_id);
        }
      } catch (error) {
        console.error('Error fetching initial messages:', error);
      }
    };

    fetchInitialMessages();
  }, [params.id]);

  // Set up polling with a longer interval
  useEffect(() => {
    const pollInterval = setInterval(fetchNewMessages, 3000); // Poll every 3 seconds
    return () => clearInterval(pollInterval);
  }, [fetchNewMessages]);

  const handleSubmit = async () => {
    if (!currentInput.trim() || !selectedPersona) return;

    const userMessage = {
      started_case_id: parseInt(params.id as string),
      persona_id: selectedPersona.persona_id,
      content: currentInput,
      is_user_message: true
    };

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userMessage),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const result = await response.json();
      
      // Add the user message to the UI immediately
      setMessages(prev => [...prev, result.userMessage]);
      
      // Clear the input
      setCurrentInput('');
      
      // The AI responses will be picked up by the polling mechanism
      // and added to the message queue automatically
      
    } catch (error) {
      console.error('Error sending message:', error);
      // You might want to show an error message to the user here
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Calculate grid columns based on number of personas
  const getGridCols = () => {
    const count = personas.length;
    if (count <= 4) return 2;
    if (count <= 9) return 3;
    return 4;
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-900">
      {/* Navigation bar with home button and title */}
      <nav className="h-16 bg-gray-900/90 backdrop-blur-sm border-b border-gray-800">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left side - Home button */}
          <button
            onClick={() => router.push('/')}
            className="bg-gray-800 text-gray-200 p-2 rounded-lg
              hover:bg-gray-700 transition-all duration-300 group
              border border-gray-700 flex items-center gap-2"
            aria-label="Return to home"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
              />
            </svg>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Home
            </span>
          </button>

          {/* Center - Case Title */}
          <h1 className="text-white text-xl font-medium absolute left-1/2 transform -translate-x-1/2">
            {caseData?.title || 'Loading...'}
          </h1>
        </div>
      </nav>

      {/* Main content */}
      <div className="h-[calc(100vh-4rem)]"> {/* Subtract nav height */}
        <div className="h-full flex">
          {/* Main content area */}
          <div className={`h-full transition-all duration-300 ease-in-out ${
            showTranscript ? 'w-[calc(100%-400px)]' : 'w-full'
          }`}>
            {/* Grid container with padding */}
            <div className="h-full p-4">
              {/* Grid of personas */}
              <div 
                className="grid gap-6 h-full"
                style={{
                  gridTemplateColumns: `repeat(${getGridCols()}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${Math.ceil(personas.length / getGridCols())}, 1fr)`,
                }}
              >
                {personas.map((persona) => (
                  <div 
                    key={persona.persona_id}
                    className={`relative bg-gray-800 rounded-lg overflow-hidden
                      ${selectedPersona?.persona_id === persona.persona_id ? 'ring-2 ring-blue-500' : ''}
                      ${speakingPersonaId === persona.persona_id ? 'ring-2 ring-white' : ''}
                      transition-all duration-300 hover:ring-2 hover:ring-blue-400
                      flex flex-col items-center justify-center`}
                    onClick={() => setSelectedPersona(persona)}
                  >
                    {/* Circular avatar container */}
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 mb-4">
                      <Image
                        src="/avatars/placeholder-avatar.png"
                        alt={persona.name}
                        width={200}
                        height={200}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    {/* Text content */}
                    <div className="text-center">
                      <div className="text-white font-semibold text-lg">{persona.name}</div>
                      <div className="text-gray-300 text-sm">{persona.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Transcript panel */}
          <div className={`fixed right-0 top-16 h-[calc(100vh-4rem)] transform transition-transform duration-300 ease-in-out ${
            showTranscript ? 'translate-x-0' : 'translate-x-[400px]'
          }`}>
            {/* Toggle transcript button */}
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className={`absolute left-0 bottom-8 bg-gray-800 text-gray-200 px-4 py-2 
                rounded-l-lg hover:bg-gray-700 transition-colors transform -translate-x-full
                border border-gray-700 backdrop-blur-sm`}
            >
              {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
            </button>

            {/* Transcript panel content */}
            <div className="bg-gray-900 w-[400px] h-full flex flex-col rounded-l-lg shadow-xl border-l border-gray-800">
              <div className="p-4 border-b border-gray-800 bg-gray-900/90 backdrop-blur-sm">
                <h2 className="text-xl font-semibold text-gray-200">Transcript</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages && messages.length > 0 ? (
                  messages.map((message, index) => (
                    <div
                      key={`message-${message.message_id || `temp-${index}`}-${message.sent_at}`}
                      className={`mb-4 ${message.is_user_message ? 'text-right' : 'text-left'}`}
                    >
                      <div className={`inline-block p-3 rounded-lg max-w-[80%] ${
                        message.is_user_message
                          ? 'bg-blue-600 text-gray-100'
                          : 'bg-gray-800 text-gray-100'
                      }`}>
                        <div className="text-sm text-gray-400 mb-1">
                          {message.is_user_message ? 'You' : selectedPersona?.name || 'AI'}
                        </div>
                        <div className="text-sm">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No messages available</p>
                )}
              </div>

              <div className="p-4 border-t border-gray-800 bg-gray-900/90 backdrop-blur-sm">
                <div className="flex flex-col gap-2">
                  <textarea
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    className="w-full p-3 bg-gray-800 text-gray-100 rounded-lg resize-none h-20
                      border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                      placeholder-gray-500 transition-colors"
                    placeholder={selectedPersona 
                      ? `Ask ${selectedPersona.name} a question...` 
                      : "Type your message..."}
                  />
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {selectedPersona ? `Speaking to: ${selectedPersona.name}` : 'Select a persona'}
                    </div>
                    <button
                      onClick={handleSubmit}
                      className="px-4 py-2 bg-blue-600 text-gray-100 rounded-lg 
                        hover:bg-blue-700 transition-colors disabled:opacity-50
                        disabled:cursor-not-allowed flex items-center gap-2"
                      disabled={!currentInput.trim() || !selectedPersona}
                    >
                      <span>Send</span>
                      <svg 
                        className="w-4 h-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add audio element */}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
} 