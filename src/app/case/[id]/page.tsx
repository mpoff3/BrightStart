"use client";
import styles from './page.module.css';
import Image from 'next/image';
import { motion } from "framer-motion";
import { useState, useRef, useMemo, useEffect } from 'react';
import { FaMicrophone, FaHandPaper } from 'react-icons/fa';

export default function CasePage({ params }: { params: { id: string } }) {
  const [speakingId, setSpeakingId] = useState('1');
  const [selectedRecipient, setSelectedRecipient] = useState('all');
  const [isRecording, setIsRecording] = useState(false);
  const [raisedHand, setRaisedHand] = useState(false);
  const [autoSpeaking, setAutoSpeaking] = useState(true);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const [messages, setMessages] = useState<Array<{
    id: number;
    participantId: string;
    content: string;
    timestamp: string;
  }>>([]);
  const [isFinishingThought, setIsFinishingThought] = useState(false);

  // Move particle positions to component level
  const particlePositions = useMemo(() => 
    Array(20).fill(0).map((_, i) => ({
      top: `${(i * 11) % 100}%`,
      left: `${(i * 17) % 100}%`,
      yOffset: 10 + (i % 5) * 8,
      xOffset: 10 + (i % 6) * 8,
      duration: 2 + (i % 4),
      delay: i * 0.1
    })), []
  );

  const participants = [
    { 
      id: '0', 
      avatar: '/images/A0.png', 
      name: 'Professor Bob', 
      role: '(Professor)'
    },
    { 
      id: '1', 
      avatar: '/images/A1.png', 
      name: 'James Rodriguez', 
      role: '(Physician Assistant)'
    },
    { 
      id: '2', 
      avatar: '/images/A2.png',
      name: 'Sarah Ogle', 
      role: '(Patient Advocate)'
    },
    { 
      id: '3', 
      avatar: '/images/A3.png',
      name: 'Nathan Chen', 
      role: '(Doctor)'
    },
    { 
      id: '4', 
      avatar: '/images/A4.png', 
      name: 'Emma Wilson', 
      role: '(Nurse)'
    }
  ];

  // Add more varied responses for each participant
  const participantResponses = {
    '0': [
      "AI ethics in healthcare require careful consideration.",
      "We need to balance innovation with patient care.",
      "Training healthcare staff on AI systems is crucial.",
      "Data privacy must be our top priority.",
    ],
    '2': [
      "Patients need to be informed about AI use in their care.",
      "We should ensure AI doesn't replace human connection.",
      "Accessibility of AI solutions is a key concern.",
      "Patient feedback should guide AI implementation.",
    ],
    '3': [
      "Clinical workflows need careful AI integration.",
      "AI should augment, not replace, medical judgment.",
      "We need clear protocols for AI-assisted diagnosis.",
      "Real-time monitoring of AI performance is essential.",
    ],
    '4': [
      "Nursing staff need proper AI training programs.",
      "AI should help reduce administrative burden.",
      "Patient care quality must remain our focus.",
      "We need clear escalation procedures.",
    ],
  };

  // Add these memoized functions at the top level of the component
  const getRandomResponse = useMemo(() => (participantId: string) => {
    const responses = participantResponses[participantId as keyof typeof participantResponses] || [];
    return responses[Math.floor(Math.random() * responses.length)];
  }, [participantResponses]);

  const handleParticipantClick = useMemo(() => (participantId: string, customMessage?: string, timestamp?: number) => {
    setSpeakingId(participantId);
    
    const newMessage = {
      id: timestamp || Date.now(),
      participantId: participantId,
      content: customMessage || getRandomResponse(participantId) || "...",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMessage]);
  }, [getRandomResponse]);

  // Modify the useEffect
  useEffect(() => {
    let speakingInterval: NodeJS.Timeout;

    if (autoSpeaking && !raisedHand && !isFinishingThought) {
      const selectAndSpeak = () => {
        const availableParticipants = participants.filter(p => p.id !== '1');
        const nextSpeaker = availableParticipants[Math.floor(Math.random() * availableParticipants.length)];
        
        const response = getRandomResponse(nextSpeaker.id);
        if (response) {
          const timestamp = Date.now();
          handleParticipantClick(nextSpeaker.id, response, timestamp);
        }
      };

      selectAndSpeak();
      speakingInterval = setInterval(selectAndSpeak, 7000);
    }

    return () => {
      if (speakingInterval) {
        clearInterval(speakingInterval);
      }
    };
  }, [autoSpeaking, raisedHand, isFinishingThought, getRandomResponse, handleParticipantClick]);

  const handleVoiceInput = () => {
    if (!isRecording) {
      // Start recording logic here
      setIsRecording(true);
    } else {
      // Stop recording logic here
      setIsRecording(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = textInputRef.current?.value;
    if (message?.trim()) {
      const newMessage = {
        id: Date.now(),
        participantId: '1',
        content: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      if (textInputRef.current) {
        textInputRef.current.value = '';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Modify hand raise handler
  const handleRaiseHand = () => {
    if (!raisedHand) {
      // When raising hand
      setIsFinishingThought(true);
      // Wait for current speaker to finish (10 seconds)
      setTimeout(() => {
        setAutoSpeaking(false);
        setIsFinishingThought(false);
        setSpeakingId('1');
        setRaisedHand(true);
      }, 10000);
    } else {
      // When lowering hand
      setRaisedHand(false);
      setAutoSpeaking(true);
    }
  };

  const renderParticipant = (participant: any) => {
    const isSpeaking = participant.id === speakingId;
    
    return (
      <motion.div
        key={participant.id}
        className={`${styles.participant} ${isSpeaking ? styles.speaking : ''}`}
        onClick={() => handleParticipantClick(participant.id)}
        data-participant-id={participant.id}
        animate={isSpeaking ? {
          scale: [0.98, 1.02, 0.98],
        } : {}}
        transition={{ 
          repeat: Infinity, 
          duration: 3, 
          ease: "easeInOut" 
        }}
      >
        {/* Floating Particles - only show when speaking */}
        {isSpeaking && particlePositions.map((pos, i) => (
          <motion.div
            key={i}
            className={styles.particle}
            style={{
              top: pos.top,
              left: pos.left,
            }}
            animate={{
              y: [-pos.yOffset, pos.yOffset, -pos.yOffset],
              x: [-pos.xOffset, pos.xOffset, -pos.xOffset],
              opacity: [0.4, 1, 0.4],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              repeat: Infinity,
              duration: pos.duration,
              delay: pos.delay,
              ease: "easeInOut",
            }}
          />
        ))}

        <motion.div
          className={`${styles.participantBackground} ${
            participant.id === '0' ? styles.purpleBackground :
            participant.id === '1' ? styles.blueBackground :
            participant.id === '2' ? styles.greenBackground :
            participant.id === '3' ? styles.orangeBackground :
            styles.pinkBackground
          }`}
          animate={isSpeaking ? {
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8],
            borderRadius: [
              "50% 50% 50% 50%",
              "60% 40% 60% 40%",
              "40% 60% 40% 60%",
              "50% 50% 50% 50%"
            ],
          } : {}}
          transition={{
            repeat: Infinity,
            duration: 6,
            ease: "easeInOut",
          }}
        />

        <div className={styles.participantInfo}>
          <span className={styles.participantName}>{participant.name}</span>
          <span className={styles.participantRole}>{participant.role}</span>
        </div>
      </motion.div>
    );
  };

  return (
    <main className={styles.main}>
      <div className={styles.galleryView}>
        <div className={styles.professorContainer}>
          {renderParticipant(participants[0])}
        </div>
        <div className={styles.galleryGrid}>
          {participants.slice(1).map(renderParticipant)}
        </div>
      </div>
      
      <div className={styles.transcriptArea}>
        <div className={styles.messagesContainer}>
          {messages.map((message) => {
            const participant = participants.find(p => p.id === message.participantId);
            return (
              <div 
                key={message.id} 
                className={`${styles.message} ${styles[`message${participant?.id}`]}`}
              >
                <div className={styles.messageHeader}>
                  <div className={styles.messageAvatar} 
                       style={{ 
                         backgroundColor: 
                           participant?.id === '1' ? '#7CB9E8' : // Light blue for "You"
                           participant?.id === '0' ? '#0A84FF' :
                           participant?.id === '2' ? '#FF9F0A' :
                           participant?.id === '3' ? '#30D158' :
                           '#FF2D55'
                       }}
                  />
                  <span className={styles.messageName}>
                    {participant?.id === '1' ? 'You' : participant?.name}
                  </span>
                  <span className={styles.messageTime}>{message.timestamp}</span>
                </div>
                <div className={styles.messageContent}>
                  {message.content}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className={styles.inputArea}>
          <form className={styles.inputWrapper} onSubmit={handleSubmit}>
            <textarea
              ref={textInputRef}
              className={styles.textInput}
              placeholder={`Message ${selectedRecipient === 'all' ? 'everyone' : participants.find(p => p.id === selectedRecipient)?.name}`}
              rows={1}
              onKeyDown={handleKeyPress}
            />
            <button
              type="button"
              className={`${styles.handRaiseButton} ${raisedHand ? styles.handRaised : ''}`}
              onClick={handleRaiseHand}
            >
              <FaHandPaper />
            </button>
            <button
              type="button"
              className={`${styles.voiceButton} ${isRecording ? styles.recording : ''}`}
              onClick={handleVoiceInput}
            >
              <FaMicrophone />
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}