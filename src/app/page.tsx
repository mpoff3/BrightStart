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
  const [hoveredCase, setHoveredCase] = useState<number | null>(null);
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);

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

  const tempCases = [
    {
      case_id: 1,
      title: "Healthcare Innovation",
      description: "AI diagnostic systems in hospitals",
      image_url: "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?q=80&w=2940&auto=format&fit=crop"
    },
    {
      case_id: 2,
      title: "Energy Systems",
      description: "Renewable energy solutions",
      image_url: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=2940&auto=format&fit=crop"
    },
    {
      case_id: 3,
      title: "Organization Design",
      description: "Modern business structures",
      image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2940&auto=format&fit=crop"
    },
    {
      case_id: 4,
      title: "Portfolio Strategy",
      description: "Investment approaches",
      image_url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2940&auto=format&fit=crop"
    },
    {
      case_id: 5,
      title: "Leadership Innovation",
      description: "Modern leadership methods",
      image_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2940&auto=format&fit=crop"
    },
    {
      case_id: 6,
      title: "Food Truck Business",
      description: "Mobile food entrepreneurship",
      image_url: "https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?q=80&w=2940&auto=format&fit=crop"
    },
    {
      case_id: 7,
      title: "Learning Styles",
      description: "Educational innovation methods",
      image_url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2940&auto=format&fit=crop"
    },
    {
      case_id: 8,
      title: "Luxury Retail",
      description: "High-end retail strategies",
      image_url: "https://images.unsplash.com/photo-1541744573515-478c959628a0?q=80&w=2940&auto=format&fit=crop"
    }
  ].map(c => ({
    ...c,
    file_name: "",
    file_path: "",
    file_hash: { type: "", data: [] },
    file_size: "",
    is_public: true,
    uploader_id: 1,
    uploaded_at: "",
    updated_at: ""
  }));

  const visibleCases = tempCases.slice(visibleStartIndex, visibleStartIndex + 4);

  const handleCardClick = (caseId: number) => {
    router.push(`/case/${caseId}`);
  };

  const handleNext = () => {
    if (visibleStartIndex < tempCases.length - 4) {
      setVisibleStartIndex(prev => prev + 4);
      setScrollPosition((visibleStartIndex + 4) * (280 + 32));
    }
  };

  const handlePrev = () => {
    if (visibleStartIndex >= 4) {
      setVisibleStartIndex(prev => prev - 4);
      setScrollPosition((visibleStartIndex - 4) * (280 + 32));
    }
  };

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <div className={styles.logo}>
          CaseAI
        </div>
        <div className={styles.navRight}>
          <Link href="/test" className={styles.navLink}>Test API</Link>
          <Link href="#account" className={styles.navLink}>Account</Link>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.titleSection}>
            <h1>AI-Driven Case Discussions</h1>
            <h2>Experience Harvard's Case Method Today</h2>
          </div>
          
          <div className={styles.casesSection}>
            <h3 className={styles.sectionTitle}>Choose Your Case</h3>
            
            <div className={styles.casesDisplay}>
              <div className={styles.casesContainer}>
                <div 
                  ref={cardsRef}
                  className={styles.cases}
                >
                  {loading ? (
                    <div className={styles.loading}>Loading cases...</div>
                  ) : (
                    tempCases.slice(0, 4).map((caseItem) => (
                      <div 
                        key={caseItem.case_id} 
                        className={`${styles.caseCard} ${
                          hoveredCase === caseItem.case_id ? styles.hovered : styles.dimmed
                        }`}
                        onClick={() => handleCardClick(caseItem.case_id)}
                        onMouseEnter={() => setHoveredCase(caseItem.case_id)}
                        onMouseLeave={() => setHoveredCase(null)}
                      >
                        <div 
                          className={styles.caseImage}
                          style={{ backgroundImage: `url(${caseItem.image_url})` }}
                        />
                        <div className={styles.caseContent}>
                          <h3 className={styles.caseTitle}>{caseItem.title}</h3>
                          <p className={styles.caseDescription}>{caseItem.description}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}