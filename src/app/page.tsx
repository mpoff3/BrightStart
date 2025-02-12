"use client";
import { useRouter } from "next/navigation";
import styles from './page.module.css';
import { useEffect, useState } from 'react';
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
  const [error, setError] = useState<string | null>(null);

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
