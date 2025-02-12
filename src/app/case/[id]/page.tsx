"use client";
import styles from './page.module.css';
import Image from 'next/image';
import { motion } from "framer-motion";
import { useState, useRef, useMemo, useEffect } from 'react';
import { FaMicrophone, FaHandPaper } from 'react-icons/fa';
import { useRouter, useParams } from 'next/navigation';

// Add this type for case details
type CaseDetails = {
  title: string;
  scenario: string;
  keyData: string[];
  results: string[];
  discussionQuestions: string[];
};

// Add this before your component
const caseDetails: { [key: string]: CaseDetails } = {
  '1': {
    title: 'Healthcare Innovation',
    scenario: 'A major hospital system is implementing AI-powered diagnostic tools to assist medical professionals. The system aims to improve accuracy and efficiency while maintaining the human element of healthcare.',
    keyData: [
      '87% reduction in diagnostic time',
      '35% improvement in early detection rates',
      '$2.3M annual cost savings',
      'Currently implemented in 3 departments'
    ],
    results: [
      'Increased patient satisfaction by 42%',
      'Reduced wait times by 56%',
      'Improved diagnostic accuracy by 23%',
      'Enhanced staff productivity by 31%'
    ],
    discussionQuestions: [
      'How can we balance AI automation with human medical expertise?',
      'What are the ethical implications of AI in healthcare decision-making?',
      'How should we handle patient data privacy with AI systems?',
      'What training protocols should be implemented for staff?'
    ]
  },
  '2': {
    title: 'Energy Systems',
    scenario: 'A growing metropolitan area is transitioning to renewable energy sources while maintaining grid stability. The challenge is to integrate smart grid technology with existing infrastructure.',
    keyData: [
      '45% renewable energy integration',
      '30% reduction in carbon emissions',
      '$5.2M infrastructure investment',
      '12,000 smart meters installed'
    ],
    results: [
      'Decreased power outages by 65%',
      'Reduced energy costs by 28%',
      'Improved grid efficiency by 40%',
      'Carbon footprint reduced by 50,000 tons annually'
    ],
    discussionQuestions: [
      'How can we ensure grid stability with renewable integration?',
      'What role should government incentives play?',
      'How do we manage peak demand with variable energy sources?',
      'What are the social equity considerations in this transition?'
    ]
  },
  '3': {
    title: 'Organization Design',
    scenario: 'A Fortune 500 company is restructuring its organizational model to become more agile and responsive to market changes. The challenge is to maintain productivity while transforming traditional hierarchies into cross-functional teams.',
    keyData: [
      '15,000 employees affected',
      '40% reduction in decision-making layers',
      '$8.5M transformation budget',
      '25% increase in cross-department collaboration'
    ],
    results: [
      'Project delivery time reduced by 35%',
      'Employee satisfaction increased by 45%',
      'Innovation output improved by 60%',
      'Market response time decreased by 50%'
    ],
    discussionQuestions: [
      'How can we maintain stability during organizational transformation?',
      'What metrics should be used to measure transformation success?',
      'How do we address resistance to change?',
      'What role should technology play in the new structure?'
    ]
  },
  '4': {
    title: 'Portfolio Strategy',
    scenario: 'An investment firm is developing a new portfolio strategy incorporating AI-driven market analysis while balancing traditional investment principles. The focus is on sustainable long-term growth with managed risk.',
    keyData: [
      '$2.5B assets under management',
      '28% improvement in risk assessment accuracy',
      '15% reduction in transaction costs',
      'Real-time analysis of 500+ market indicators'
    ],
    results: [
      'Portfolio volatility reduced by 25%',
      'Return on investment increased by 18%',
      'Client satisfaction improved by 40%',
      'Market prediction accuracy up by 32%'
    ],
    discussionQuestions: [
      'How do we balance AI insights with human judgment?',
      'What risk management frameworks should be implemented?',
      'How can we ensure transparency in AI-driven decisions?',
      'What role should ESG factors play in portfolio selection?'
    ]
  },
  // Add other cases similarly...
};

// Add this before the component
const getCaseSpecificRoles = (caseId: string) => {
  switch (caseId) {
    case '1': // Healthcare Innovation
      return {
        '0': '(Professor)',
        '1': '(Physician Assistant)',
        '2': '(Patient Advocate)',
        '3': '(Doctor)',
        '4': '(Nurse)'
      };
    case '2': // Energy Systems
      return {
        '0': '(Professor)',
        '1': '(Energy Consultant)',
        '2': '(Sustainability Director)',
        '3': '(Grid Engineer)',
        '4': '(Environmental Analyst)'
      };
    case '3': // Leadership Innovation
      return {
        '0': '(Professor)',
        '1': '(HR Director)',
        '2': '(Change Manager)',
        '3': '(Team Lead)',
        '4': '(Operations Manager)'
      };
    case '4': // Portfolio Strategy
      return {
        '0': '(Professor)',
        '1': '(Portfolio Manager)',
        '2': '(Risk Analyst)',
        '3': '(Investment Strategist)',
        '4': '(Quantitative Analyst)'
      };
    default:
      return {
        '0': '(Professor)',
        '1': '(Physician Assistant)',
        '2': '(Patient Advocate)',
        '3': '(Doctor)',
        '4': '(Nurse)'
      };
  }
};

export default function CasePage() {
  const params = useParams();
  const router = useRouter();
  const [speakingId, setSpeakingId] = useState('1');
  const [selectedRecipient, setSelectedRecipient] = useState('all');
  const [isRecording, setIsRecording] = useState(false);
  const [raisedHand, setRaisedHand] = useState(false);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const [messages, setMessages] = useState<Array<{
    id: number;
    participantId: string;
    content: string;
    timestamp: string;
    fromTextInput?: boolean;
  }>>([]);
  const [isFinishingThought, setIsFinishingThought] = useState(false);
  const [audioData, setAudioData] = useState<number[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showModal, setShowModal] = useState(true);

  // Memoize the participant ID to prevent infinite updates
  const participantId = useMemo(() => `user-${Date.now()}`, []);

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

  // Update the roles call to use params.id as string
  const roles = getCaseSpecificRoles(params.id as string);
  const participants = [
    { 
      id: '0', 
      avatar: '/images/A0.png', 
      name: 'Professor Bob', 
      role: roles['0']
    },
    { 
      id: '1', 
      avatar: '/images/A1.png', 
      name: 'James Rodriguez', 
      role: roles['1']
    },
    { 
      id: '2', 
      avatar: '/images/A2.png',
      name: 'Sarah Ogle', 
      role: roles['2']
    },
    { 
      id: '3', 
      avatar: '/images/A3.png',
      name: 'Nathan Chen', 
      role: roles['3']
    },
    { 
      id: '4', 
      avatar: '/images/A4.png', 
      name: 'Emma Wilson', 
      role: roles['4']
    }
  ];

  // Update the participantResponses object to include James (id '1')
  const participantResponses = {
    '0': [
      "AI ethics in healthcare require careful consideration.",
      "We need to balance innovation with patient care.",
      "Training healthcare staff on AI systems is crucial.",
      "Data privacy must be our top priority.",
    ],
    '1': [  // Add responses for James
      "As a PA, I see great potential in AI assistance.",
      "We need to ensure AI tools support our clinical workflow.",
      "Patient interaction should remain our primary focus.",
      "Integration with existing systems is key.",
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

  const handleParticipantClick = useMemo(() => (participantId: string) => {
    setSpeakingId(participantId);
    
    const response = getRandomResponse(participantId);
    if (response) {
      const newMessage = {
        id: Date.now(),
        participantId,
        content: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fromTextInput: false
      };
      
      setMessages(prev => [...prev, newMessage]);
    }
  }, [getRandomResponse]);

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
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fromTextInput: true
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

  const handleRaiseHand = () => {
    setRaisedHand(!raisedHand);
    setSpeakingId('1');
  };

  // Modify the audio visualization effect
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 32; // Smaller FFT size for smoother animation
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateAudioData = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArray);
      // Calculate average volume for smoother animation
      const avgVolume = dataArray.reduce((sum, val) => sum + val, 0) / bufferLength;
      setAudioData([avgVolume]);
      requestAnimationFrame(updateAudioData);
    };

    updateAudioData();

    return () => {
      audioContext.close();
    };
  }, []);

  const renderParticipant = (participant: any) => {
    const isSpeaking = participant.id === speakingId;
    const intensity = audioData.length > 0 ? audioData[0] / 255 : 0;
    
    // Get the color based on participant ID
    const getRingColor = (id: string) => {
      switch(id) {
        case '0': return 'rgba(10, 132, 255, 0.4)';    // Professor Bob - Keep original blue
        case '1': return 'rgba(0, 59, 70, 0.4)';       // James - Dark turquoise
        case '2': return 'rgba(0, 91, 106, 0.4)';      // Sarah - Medium turquoise
        case '3': return 'rgba(0, 121, 137, 0.4)';     // Nathan - Light turquoise
        case '4': return 'rgba(0, 150, 169, 0.4)';     // Emma - Lightest turquoise
        default: return 'rgba(0, 121, 137, 0.4)';
      }
    };

    const ringColor = getRingColor(participant.id);
    
    return (
      <motion.div
        key={participant.id}
        className={`${styles.participant} ${isSpeaking ? styles.speaking : ''}`}
        onClick={() => handleParticipantClick(participant.id)}
        style={{ cursor: 'pointer' }}
      >
        {isSpeaking && (
          <>
            <motion.div
              className={styles.audioRing}
              animate={{
                scale: [1, 1.4 + intensity * 0.3],
                opacity: [0.8, 0],
              }}
              style={{
                transformOrigin: 'center center',
                borderColor: ringColor,
                boxShadow: `0 0 20px ${ringColor}`
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
            <motion.div
              className={styles.audioRing}
              animate={{
                scale: [1, 1.8 + intensity * 0.3],
                opacity: [0.6, 0],
              }}
              style={{
                transformOrigin: 'center center',
                borderColor: ringColor,
                boxShadow: `0 0 20px ${ringColor}`
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.5
              }}
            />

            {/* Floating Particles */}
            {particlePositions.map((pos, i) => (
              <motion.div
                key={i}
                className={styles.particle}
                style={{
                  top: pos.top,
                  left: pos.left,
                }}
                animate={{
                  y: [-pos.yOffset/2, pos.yOffset/2, -pos.yOffset/2],
                  x: [-pos.xOffset/2, pos.xOffset/2, -pos.xOffset/2],
                  opacity: [0.2, 0.4, 0.2],
                  scale: [0.9, 1.1, 0.9],
                }}
                transition={{
                  repeat: Infinity,
                  duration: pos.duration * 2,
                  delay: pos.delay,
                  ease: "easeInOut",
                }}
              />
            ))}
          </>
        )}

        <motion.div
          className={`${styles.participantBackground} ${
            participant.id === '0' ? styles.blueBackground :    // Professor Bob - now blue
            participant.id === '1' ? styles.purpleBackground :  // James Rodriguez - now purple
            participant.id === '2' ? styles.greenBackground :
            participant.id === '3' ? styles.orangeBackground :
            styles.pinkBackground
          }`}
          animate={isSpeaking ? {
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8],
            borderRadius: ["50%", "50%", "50%"],
          } : {}}
          transition={{
            repeat: Infinity,
            duration: 2,
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

  // Update the getParticipantName function to differentiate between text input and clicks
  const getParticipantName = (id: string, fromTextInput?: boolean) => {
    // Only show "You" for messages from text input
    if (id === '1' && fromTextInput) return 'You';
    const participant = participants.find(p => p.id === id);
    return participant ? participant.name : 'Unknown';
  };

  const currentCase = caseDetails[params.id as string];

  // Add this JSX before your main return statement
  if (showModal && currentCase) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <h1 className={styles.modalTitle}>{currentCase.title}</h1>
          
          <section className={styles.modalSection}>
            <h2>Scenario</h2>
            <p>{currentCase.scenario}</p>
          </section>

          <section className={styles.modalSection}>
            <h2>Key Data</h2>
            <ul>
              {currentCase.keyData.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className={styles.modalSection}>
            <h2>Results</h2>
            <ul>
              {currentCase.results.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className={styles.modalSection}>
            <h2>Discussion Questions</h2>
            <ul>
              {currentCase.discussionQuestions.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <button 
            className={styles.modalButton}
            onClick={() => setShowModal(false)}
          >
            I'm Ready to Enter Class
          </button>
        </div>
      </div>
    );
  }

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
            return (
              <div 
                key={message.id} 
                className={`${styles.message} ${styles[`message${message.participantId}`]}`}
              >
                <div className={styles.messageHeader}>
                  <div className={styles.messageAvatar} 
                    style={{ 
                      backgroundColor: 
                        message.participantId === '0' ? '#0A84FF' :   // Professor Bob - Keep original blue
                        message.participantId === '1' && !message.fromTextInput ? '#003B46' :   // James - Dark turquoise
                        message.participantId === '1' && message.fromTextInput ? '#7CB9E8' :    // You (when typing) - Light Blue
                        message.participantId === '2' ? '#005B6A' :   // Sarah - Medium turquoise
                        message.participantId === '3' ? '#007989' :   // Nathan - Light turquoise
                        '#0096A9'                                     // Emma - Lightest turquoise
                    }}
                  />
                  <span className={styles.messageName}>
                    {getParticipantName(message.participantId, message.fromTextInput)}
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