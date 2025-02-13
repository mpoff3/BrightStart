"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import InputRequestNotification from "@/components/InputRequestNotification";

interface Persona {
  persona_id: string; // UUID
  name: string;
  role: string;
  background: string;
  personality: string;
  expertise: string;
  started_case_id: string; // UUID
  is_human: boolean;
  voice: string; // Add voice field
}

interface Message {
  message_id: string; // UUID
  content: string;
  persona_id: string | null; // UUID
  awaiting_user_input: boolean;
  is_human: boolean;
  started_case_id: string; // UUID
  metadata: string;
  time_sent: string;
}

interface Case {
  case_id: string; // UUID
  title: string;
  content: string;
}

// Add constant for dummy started case ID
const DUMMY_STARTED_CASE_ID = "c592f770-d69c-4366-bcd5-0a1037153f51";

export default function CasePage() {
  const params = useParams();
  const router = useRouter();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentInput, setCurrentInput] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [speakingPersonaId, setSpeakingPersonaId] = useState<string | null>(
    null
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [lastMessageId, setLastMessageId] = useState<string>("");
  const [messageQueue, setMessageQueue] = useState<Message[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const isFirstLoad = useRef(true);
  const [pageFullyLoaded, setPageFullyLoaded] = useState(false);
  const pageLoadTime = useRef<Date>(new Date());
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasAudioPermission, setHasAudioPermission] = useState<boolean | null>(
    null
  );
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [userId] = useState<string>("1"); // Hardcode userId to '1' for testing
  const [awaitingInput, setAwaitingInput] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        pageLoadTime.current = new Date();
        console.log(
          "Page load time set to:",
          pageLoadTime.current.toISOString()
        );

        // Fetch case data as normal
        const caseResponse = await fetch(`/api/cases/${params.id}`);
        const caseData = await caseResponse.json();
        setCaseData(caseData);

        // Use dummy started_case_id for personas and messages
        const personasResponse = await fetch(
          `/api/personas?started_case_id=${DUMMY_STARTED_CASE_ID}`
        );
        const personasData = await personasResponse.json();
        setPersonas(personasData);

        const messagesResponse = await fetch(
          `/api/messages?started_case_id=${DUMMY_STARTED_CASE_ID}`
        );
        const messagesData = await messagesResponse.json();

        if (messagesData.length > 0) {
          setMessages(messagesData);
          setLastMessageId(messagesData[messagesData.length - 1].message_id);
          console.log(
            "Initial messages loaded, last ID:",
            messagesData[messagesData.length - 1].message_id
          );
        }

        setInitialLoadDone(true);
        setPageFullyLoaded(true);
        console.log("Page fully loaded");
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      setPageFullyLoaded(false);
      setInitialLoadDone(false);
    };
  }, [params.id]);

  const playTextToSpeech = async (
    text: string,
    personaId: string
  ): Promise<void> => {
    try {
      // Get voice from persona object directly
      const persona = personas.find((p) => p.persona_id === personaId);
      const voice = persona?.voice || "aura-asteria-en"; // Default voice if not found

      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, voice }), // Send voice instead of personaId
      });

      if (!response.ok) throw new Error("Text-to-speech request failed");

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
          reject(new Error("Audio element not found"));
        }
      });
    } catch (error) {
      console.error("Error playing text-to-speech:", error);
      setSpeakingPersonaId(null);
      throw error;
    }
  };

  const scrollToBottom = () => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update message polling to use dummy started_case_id and handle TTS
  useEffect(() => {
    if (!initialLoadDone) return;

    const pollMessages = async () => {
      try {
        const response = await fetch(
          `/api/messages?started_case_id=${DUMMY_STARTED_CASE_ID}&after_id=${lastMessageId}`
        );
        const newMessages = await response.json();

        if (newMessages.length > 0) {
          const newNonUserMessages = newMessages.filter((msg: Message) => {
            const messageTime = new Date(msg.time_sent);
            const isAIMessage = !msg.is_human && msg.persona_id;
            const isAfterPageLoad = messageTime > pageLoadTime.current;

            return isAIMessage && isAfterPageLoad;
          });

          // Check if any new message is awaiting user input
          const hasAwaitingInput = newMessages.some(
            (msg: Message) => msg.awaiting_user_input
          );
          setAwaitingInput(hasAwaitingInput);

          setMessages((prev) => [...prev, ...newMessages]);
          setLastMessageId(newMessages[newMessages.length - 1].message_id);

          // Add AI messages to TTS queue
          if (newNonUserMessages.length > 0) {
            console.log("Adding to TTS queue:", newNonUserMessages);
            setMessageQueue((prev) => [...prev, ...newNonUserMessages]);
          }
        }
      } catch (error) {
        console.error("Error polling messages:", error);
      }
    };

    const interval = setInterval(pollMessages, 1000);
    return () => clearInterval(interval);
  }, [initialLoadDone, lastMessageId]);

  // Add TTS queue processing
  useEffect(() => {
    const processQueue = async () => {
      if (messageQueue.length > 0 && !isPlaying) {
        console.log("Processing message from queue:", messageQueue[0]);
        setIsPlaying(true);
        const message = messageQueue[0];

        try {
          await playTextToSpeech(message.content, message.persona_id || "");
          setMessageQueue((prev) => prev.slice(1));
        } catch (error) {
          console.error("Error playing message:", error);
        } finally {
          setIsPlaying(false);
        }
      }
    };

    const queueInterval = setInterval(processQueue, 500);
    return () => clearInterval(queueInterval);
  }, [messageQueue, isPlaying]);

  // Update handleSubmit to use dummy started_case_id
  const handleSubmit = async () => {
    if (!currentInput.trim()) return;

    const userMessage = {
      started_case_id: DUMMY_STARTED_CASE_ID,
      content: currentInput,
      is_human: true,
    };

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userMessage),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setCurrentInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasAudioPermission(true);
      return stream;
    } catch (error) {
      console.error("Microphone permission denied:", error);
      setHasAudioPermission(false);
      return null;
    }
  };

  const startRecording = async () => {
    // Connecting to Websocket
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/speech-to-text`;
    console.log("Connecting to WebSocket:", wsUrl);

    let socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // Dont Need This
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received message:", data);
    };

    const stream = await requestMicrophonePermission();
    if (!stream) return;

    streamRef.current = stream;
    audioChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);

        // TOOD: SEND THROUGH THE WEBSOCKET
      }
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/mp3",
      });
      // await handleAudioSubmission(audioBlob);
      await socket.send(await audioBlob.arrayBuffer());

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Update handleAudioSubmission to use dummy started_case_id
  const handleAudioSubmission = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");
    formData.append("started_case_id", DUMMY_STARTED_CASE_ID);
    formData.append("is_human", "true");

    try {
      console.log("Sending audio for transcription...");
      const response = await fetch("/api/speech-input", {
        method: "POST",
        body: formData,
      });

      const contentType = response.headers.get("content-type");
      let result;

      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        throw new Error("Received non-JSON response from server");
      }

      if (!response.ok) {
        throw new Error(
          `Failed to send audio message: ${result.error || response.statusText}`
        );
      }

      console.log("Transcription result:", result);
    } catch (error) {
      console.error("Error sending audio message:", error);
      alert("Failed to process audio message. Please try again.");
    }
  };

  useEffect(() => {
    const checkMicrophonePermission = async () => {
      try {
        const result = await navigator.permissions.query({
          name: "microphone" as PermissionName,
        });
        setHasAudioPermission(result.state === "granted");
      } catch (error) {
        console.error("Error checking microphone permission:", error);
        setHasAudioPermission(false);
      }
    };

    checkMicrophonePermission();
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const getGridCols = () => {
    const count = personas.length;
    if (count <= 4) return 2;
    if (count <= 9) return 3;
    return 4;
  };

  const getPersonaName = (
    personaId: string | null,
    personas: Persona[]
  ): string => {
    if (!personaId) return "AI";
    const persona = personas.find((p) => p.persona_id === personaId);
    return persona ? persona.name : "AI";
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-900">
      <nav className="h-16 bg-gray-900/90 backdrop-blur-sm border-b border-gray-800">
        <div className="h-full px-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
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

          <h1 className="text-white text-xl font-medium absolute left-1/2 transform -translate-x-1/2">
            {caseData?.title || "Loading..."}
          </h1>
        </div>
      </nav>

      <div className="h-[calc(100vh-4rem)]">
        <div className="h-full flex">
          <div
            className={`h-full transition-all duration-300 ease-in-out ${
              showTranscript ? "w-[calc(100%-400px)]" : "w-full"
            }`}
          >
            <div className="h-full p-4">
              <div
                className="grid gap-6 h-full"
                style={{
                  gridTemplateColumns: `repeat(${getGridCols()}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${Math.ceil(
                    personas.length / getGridCols()
                  )}, 1fr)`,
                }}
              >
                {personas.map((persona) => (
                  <div
                    key={persona.persona_id}
                    className={`relative bg-gray-800 rounded-lg overflow-hidden
                      ${
                        speakingPersonaId === persona.persona_id
                          ? "ring-2 ring-white"
                          : ""
                      }
                      transition-all duration-300 hover:ring-2 hover:ring-blue-400
                      flex flex-col items-center justify-center`}
                  >
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 mb-4">
                      <Image
                        src="/avatars/placeholder-avatar.png"
                        alt={persona.name}
                        width={200}
                        height={200}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-white font-semibold text-lg">
                        {persona.name}
                      </div>
                      <div className="text-gray-300 text-sm">
                        {persona.role}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className={`fixed right-0 top-16 h-[calc(100vh-4rem)] transform transition-transform duration-300 ease-in-out ${
              showTranscript ? "translate-x-0" : "translate-x-[400px]"
            }`}
          >
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className={`absolute left-0 bottom-8 bg-gray-800 text-gray-200 px-4 py-2 
                rounded-l-lg hover:bg-gray-700 transition-colors transform -translate-x-full
                border border-gray-700 backdrop-blur-sm`}
            >
              {showTranscript ? "Hide Transcript" : "Show Transcript"}
            </button>

            <div className="bg-gray-900 w-[400px] h-full flex flex-col rounded-l-lg shadow-xl border-l border-gray-800">
              <div className="p-4 border-b border-gray-800 bg-gray-900/90 backdrop-blur-sm">
                <h2 className="text-xl font-semibold text-gray-200">
                  Transcript
                </h2>
              </div>

              <div
                ref={transcriptRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
              >
                {messages && messages.length > 0 ? (
                  messages.map((message) => (
                    <div
                      key={`msg-${
                        message.message_id || Date.now()
                      }-${Math.random().toString(36).substr(2, 9)}`}
                      className={`mb-4 ${
                        message.is_human ? "text-right" : "text-left"
                      }`}
                    >
                      <div
                        className={`inline-block p-3 rounded-lg max-w-[80%] ${
                          message.is_human
                            ? "bg-blue-600 text-gray-100"
                            : "bg-gray-800 text-gray-100"
                        }`}
                      >
                        <div className="text-sm text-gray-400 mb-1">
                          {message.is_human
                            ? "You"
                            : getPersonaName(message.persona_id, personas)}
                        </div>
                        <div className="text-sm whitespace-pre-wrap break-words">
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
                    placeholder="Type your message..."
                  />
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      {hasAudioPermission === false && (
                        <div className="text-red-500 text-sm flex items-center gap-1">
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
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                          <span>Microphone access needed</span>
                          <button
                            onClick={requestMicrophonePermission}
                            className="text-blue-500 hover:text-blue-400 underline"
                          >
                            Enable
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => setIsHandRaised(!isHandRaised)}
                        className={`p-2 rounded-lg transition-colors ${
                          isHandRaised
                            ? "bg-yellow-500 text-gray-900"
                            : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                        }`}
                        title="Raise Hand"
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
                            d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={
                          isHandRaised
                            ? isRecording
                              ? stopRecording
                              : startRecording
                            : undefined
                        }
                        className={`p-2 rounded-lg transition-colors ${
                          isRecording
                            ? "bg-red-500 text-white animate-pulse"
                            : isHandRaised
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
                        }`}
                        title={
                          isHandRaised
                            ? isRecording
                              ? "Stop Recording"
                              : "Start Recording"
                            : "Raise hand to record"
                        }
                        disabled={!isHandRaised}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          {isRecording ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                            />
                          ) : (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                            />
                          )}
                        </svg>
                      </button>
                    </div>
                    <button
                      onClick={handleSubmit}
                      className="px-4 py-2 bg-blue-600 text-gray-100 rounded-lg 
                        hover:bg-blue-700 transition-colors disabled:opacity-50
                        disabled:cursor-not-allowed flex items-center gap-2"
                      disabled={!currentInput.trim()}
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

      <InputRequestNotification
        isVisible={awaitingInput}
        isQueueEmpty={messageQueue.length === 0}
        onRecordingStart={() => {
          // Optional: Add any logic needed when recording starts
        }}
        onRecordingStop={async (audioBlob) => {
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm");
          formData.append("started_case_id", DUMMY_STARTED_CASE_ID);
          formData.append("is_human", "true");

          try {
            const response = await fetch("/api/speech-input", {
              method: "POST",
              body: formData,
            });

            if (!response.ok) {
              throw new Error("Failed to send audio message");
            }

            setAwaitingInput(false);
          } catch (error) {
            console.error("Error sending audio message:", error);
            alert("Failed to send audio message. Please try again.");
          }
        }}
      />

      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
