"use client";
import { useRouter } from "next/navigation";
import styles from './page.module.css';
import { useEffect, useState } from 'react';
import Link from "next/link";
import axios from 'axios';
interface UserProfile {
  experiences: string;
  skills: string;
  summary: string;
  
}

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
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProcessingCV, setIsProcessingCV] = useState(false);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await fetch('/api/cases');
        if (!response.ok) {
          throw new Error('Failed to fetch cases');
        }
        const data = await response.json();
        // Ensure we're setting an array
        setCases(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching cases:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch cases');
        setCases([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingCV(true);
    const formData = new FormData();
    formData.append('cv', file);

    try {
      const response = await fetch('/api/process-cv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to process CV');
      
      const profile = await response.json();
      setUserProfile(profile);
      // Store the profile in localStorage for persistence
      localStorage.setItem('userProfile', JSON.stringify(profile));
    } catch (error) {
      console.error('Error processing CV:', error);
      setError('Failed to process CV');
    } finally {
      setIsProcessingCV(false);
    }
  };

  const handleCaseSelection = async (caseId: number) => {
    if (!userProfile) {
      alert('Please upload your CV first');
      return;
    }

    try {
      console.log(userProfile);
      console.log(caseId);
      // Call FastAPI endpoint to initialize case
      const axios = require('axios');
      const response = await axios.post('http://localhost:8000/start-discussion', {
        case_content: "This is a sample case content",
        user_profile: JSON.stringify(userProfile),
        case_id: caseId
      });
      console.log(response);
      if (!response.ok) {
        const errorDetails = await response.json();
        console.error('Error details:', errorDetails);
        throw new Error('Failed to initialize case');
      }

      const { started_case_id, persona_id } = await response.json();
      
      // Store IDs in localStorage
      localStorage.setItem('startedCaseId', started_case_id);
      localStorage.setItem('userPersonaId', persona_id);

      // Navigate to case page
      router.push(`/case/${caseId}`);
    } catch (error) {
      console.error('Error initializing case:', error);
      setError('Failed to initialize case');
    }
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
          
          <div className={styles.cvUpload}>
            {!userProfile ? (
              <div className={styles.uploadSection}>
                <h3>Upload your CV to get started</h3>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleCVUpload}
                  disabled={isProcessingCV}
                  className={styles.fileInput}
                />
                {isProcessingCV && <div>Processing CV...</div>}
              </div>
            ) : (
              <div className={styles.profileComplete}>
                <h3>Profile Ready</h3>
                <p>You can now access cases</p>
              </div>
            )}
          </div>

          <div className={styles.heroCardsSection}>
            <div className={styles.heroCards}>
              {loading ? (
                <div className={styles.loading}>Loading cases...</div>
              ) : error ? (
                <div className={styles.error}>{error}</div>
              ) : cases.length === 0 ? (
                <div className={styles.empty}>No cases available</div>
              ) : (
                cases.map((caseItem) => (
                  <div key={caseItem.case_id} className={styles.heroCardGroup}>
                    <div
                      onClick={() => handleCaseSelection(caseItem.case_id)}
                      className={`${styles.heroCard} ${!userProfile ? styles.disabled : ''}`}
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
