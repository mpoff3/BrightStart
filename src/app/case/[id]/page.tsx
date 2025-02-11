"use client";
import styles from './page.module.css';
import Image from 'next/image';
import { motion } from "framer-motion";
import { useState, useRef, useMemo } from 'react';
import { FaMicrophone, FaHandPaper } from 'react-icons/fa';

export default function CasePage({ params }: { params: { id: string } }) {
  const [speakingId, setSpeakingId] = useState('1');
  const [selectedRecipient, setSelectedRecipient] = useState('all');
  const [isRecording, setIsRecording] = useState(false);
  const [raisedHand, setRaisedHand] = useState(false);
  const textInputRef = useRef<HTMLTextAreaElement>(null);

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

  const messages = [
    {
      id: 1,
      participantId: '1',
      content: "From a clinical perspective, I believe AI implementation needs to prioritize patient safety above all else.",
      timestamp: "10:30 AM"
    }
  ];

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
      // Create new message
      const newMessage = {
        id: messages.length + 1,
        participantId: selectedRecipient === 'all' ? '1' : selectedRecipient, // Default to first participant if sending to all
        content: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      // Add message to messages array
      messages.push(newMessage);
      
      // Clear input
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

  const renderParticipant = (participant: any) => {
    const isSpeaking = participant.id === speakingId;
    
    return (
      <motion.div
        key={participant.id}
        className={`${styles.participant} ${isSpeaking ? styles.speaking : ''}`}
        onClick={() => setSpeakingId(participant.id)}
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
              <div key={message.id} className={styles.message}>
                <div className={styles.messageHeader}>
                  <Image
                    src={participant?.avatar || ''}
                    alt={participant?.name || ''}
                    width={32}
                    height={32}
                    className={styles.messageAvatar}
                  />
                  <span className={styles.messageName}>{participant?.name}</span>
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
              onClick={() => setRaisedHand(!raisedHand)}
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