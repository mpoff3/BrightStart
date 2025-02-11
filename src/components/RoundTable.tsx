'use client';

import Image from 'next/image';
import styles from './RoundTable.module.css';

interface Participant {
  name: string;
  role: string;
  imageUrl: string;
  isActive?: boolean;
}

export default function RoundTable() {
  const participants: Participant[] = [
    { 
      name: "You",
      role: "Student",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&q=80&w=500&h=500",
      isActive: true
    },
    { 
      name: "Sarah",
      role: "Doctor",
      imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?fit=crop&q=80&w=500&h=500",
    },
    { 
      name: "Michael",
      role: "Hospital Admin",
      imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?fit=crop&q=80&w=500&h=500",
    },
    { 
      name: "Hannah",
      role: "AI Specialist",
      imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?fit=crop&q=80&w=500&h=500",
    }
  ];

  return (
    <div className={styles.discussionLayout}>
      <div className={styles.videoGrid}>
        {participants.map((participant, index) => (
          <div 
            key={index} 
            className={`${styles.videoCard} ${participant.isActive ? styles.activeVideo : ''}`}
          >
            <div className={styles.videoContainer}>
              <Image
                src={participant.imageUrl}
                alt={participant.name}
                fill
                className={styles.participantImage}
                priority
              />
              <div className={styles.participantInfo}>
                <div className={styles.participantStatus}></div>
                <span className={styles.participantName}>{participant.name}</span>
                <span className={styles.participantRole}>{participant.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className={styles.transcriptPanel}>
        {/* Transcript content */}
      </div>
    </div>
  );
} 