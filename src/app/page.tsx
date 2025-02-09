"use client";
import { useRouter } from "next/navigation";
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();

  const cases = [
    {
      id: 1,
      title: "Healthcare Innovation",
      description: "AI in Medical Diagnostics",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d"
    },
    {
      id: 2,
      title: "Ethical AI",
      description: "Autonomous Decision Making",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e"
    },
    {
      id: 3,
      title: "Sustainable Future",
      description: "Green Tech Revolution",
      image: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9"
    },
    {
      id: 4,
      title: "Digital Transformation",
      description: "Enterprise Evolution",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa"
    },
    {
      id: 5,
      title: "Generate Custom Case",
      description: "Create Your Own Scenario",
      image: "https://images.unsplash.com/photo-1518729371765-4b87f844b1d6"
    }
  ];

  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.logo}>
          CaseAI
        </div>
        <div className={styles.navRight}>
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
              {cases.map((caseItem) => (
                <div key={caseItem.id} className={styles.heroCardGroup}>
                  <div
                    onClick={() => router.push(`/case/${caseItem.id}`)}
                    className={styles.heroCard}
                  >
                    <div 
                      className={styles.heroCardImage}
                      style={{ backgroundImage: `url(${caseItem.image})` }}
                    />
                  </div>
                  <h3 className={styles.heroCardTitle}>{caseItem.title}</h3>
                  <p className={styles.heroCardDescription}>{caseItem.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
