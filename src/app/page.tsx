"use client";
import { useRouter } from "next/navigation";
import styles from './page.module.css';
import { useEffect, useState, useCallback, useRef } from 'react';
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
  image_url: string;
}

export default function Home() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await fetch('/api/cases');
        if (!response.ok) {
          throw new Error('Failed to fetch cases');
        }
        const data = await response.json();
        setCases(data || []);
      } catch (error) {
        console.error('Error fetching cases:', error);
        setCases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  const tempCases = [{
    case_id: 1,
    title: "Healthcare Innovation",
    description: "Explore the implementation of AI diagnostic systems in a major hospital setting.",
    file_name: "",
    file_path: "",
    file_hash: { type: "", data: [] },
    file_size: "",
    is_public: true,
    uploader_id: 1,
    uploaded_at: "",
    updated_at: "",
    image_url: ""
  }];

  const displayCases = cases.length > 0 ? cases : tempCases;

  const handleCardClick = (caseId: number) => {
    router.push(`/case/${caseId}`);
  };

  const totalSlides = Math.ceil(displayCases.length / 4);

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
  };

  const handleNext = () => {
    if (cardsRef.current) {
      const cardWidth = cardsRef.current.clientWidth / 3; // One third of the container width
      const gap = 32; // 2rem in pixels
      const scrollAmount = cardWidth + gap;
      const maxScroll = cardsRef.current.scrollWidth - cardsRef.current.clientWidth;
      
      const newPosition = scrollPosition + scrollAmount;
      setScrollPosition(Math.min(newPosition, maxScroll));
    }
  };

  const handlePrev = () => {
    const cardWidth = cardsRef.current?.clientWidth ? cardsRef.current.clientWidth / 3 : 0;
    const gap = 32;
    const scrollAmount = cardWidth + gap;
    
    const newPosition = scrollPosition - scrollAmount;
    setScrollPosition(Math.max(0, newPosition));
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
          
          <h3 className={styles.sectionTitle}>Choose Your Case</h3>
          
          <div className={styles.heroCardsSection}>
            <button 
              className={`${styles.navButton} ${styles.navPrev}`}
              onClick={handlePrev}
              disabled={scrollPosition <= 0}
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7" stroke="currentColor" fill="none" strokeWidth="2"/>
              </svg>
            </button>

            <div className={styles.heroCardsContainer}>
              <div 
                ref={cardsRef}
                className={styles.heroCards}
                style={{ 
                  transform: `translateX(-${scrollPosition}px)`,
                }}
              >
                {loading ? (
                  <div className={styles.loading}>Loading cases...</div>
                ) : (
                  displayCases.map((caseItem) => (
                    <div 
                      key={caseItem.case_id} 
                      className={styles.heroCardGroup}
                      onClick={() => handleCardClick(caseItem.case_id)}
                    >
                      <div className={styles.heroCard}>
                        <div 
                          className={styles.heroCardImage}
                          style={{ 
                            backgroundImage: `url(${caseItem.image_url})` 
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

            <button 
              className={`${styles.navButton} ${styles.navNext}`}
              onClick={handleNext}
              disabled={cardsRef.current && scrollPosition >= cardsRef.current.scrollWidth - cardsRef.current.clientWidth}
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" stroke="currentColor" fill="none" strokeWidth="2"/>
              </svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
