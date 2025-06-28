import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from './Index.module.css';

export default function Home() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState(null);

  const interviewTypes = [
    {
      id: 'coding',
      title: 'Coding Interview',
      icon: '💻',
      description: 'Practice algorithmic problems with real-time code execution, hints, and AI-powered feedback.',
      features: [
        'Multiple programming languages',
        'Real-time code execution',
        'AI hints and critiques',
        'Test case validation',
        'LeetCode-style interface'
      ],
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      path: '/editor'
    },
    {
      id: 'behavioral',
      title: 'Behavioral Interview',
      icon: '🎯',
      description: 'Master behavioral questions using the STAR method with AI-powered question generation and feedback.',
      features: [
        'STAR method framework',
        'AI question generation',
        'Detailed feedback analysis',
        'Multiple categories',
        'Interview scoring',
        'AI follow-up questions',
        'Voice input support',
        'AI voice agent'
      ],
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      path: '/behavioral'
    }
  ];

  const handleCardClick = (path) => {
    router.push(path);
  };

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>InterviewPad</h1>
        <p className={styles.subtitle}>
          Master both coding and behavioral interviews with AI-powered practice
        </p>
      </div>

      <div className={styles.content}>
        <h2 className={styles.sectionTitle}>Choose Your Interview Type</h2>
        
        <div className={styles.cards}>
          {interviewTypes.map((type) => (
            <div
              key={type.id}
              className={`${styles.card} ${hoveredCard === type.id ? styles.hovered : ''}`}
              style={{ background: type.color }}
              onMouseEnter={() => setHoveredCard(type.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handleCardClick(type.path)}
            >
              <div className={styles.cardIcon}>{type.icon}</div>
              <h3 className={styles.cardTitle}>{type.title}</h3>
              <p className={styles.cardDescription}>{type.description}</p>
              
              <div className={styles.features}>
                <h4>Key Features:</h4>
                <ul>
                  {type.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>

              <button className={styles.startButton}>
                Start {type.title}
              </button>
            </div>
          ))}
        </div>

        <div className={styles.info}>
          <div className={styles.infoCard}>
            <h3>🚀 Why InterviewPad?</h3>
            <ul>
              <li><strong>AI-Powered:</strong> Get intelligent hints, critiques, and feedback</li>
              <li><strong>Realistic Practice:</strong> Simulate actual interview conditions</li>
              <li><strong>Comprehensive:</strong> Cover both technical and behavioral aspects</li>
              <li><strong>Structured Learning:</strong> Follow proven frameworks like STAR method</li>
              <li><strong>Voice Input:</strong> Practice speaking naturally with speech-to-text</li>
              <li><strong>Voice Agent:</strong> AI interviewer speaks questions and feedback</li>
            </ul>
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <a href="/voice-demo" className={styles.demoLink}>
                🎤 Try Voice Input Demo
              </a>
              <span style={{ margin: '0 1rem' }}>|</span>
              <a href="/voice-agent-demo" className={styles.demoLink}>
                🔊 Try Voice Agent Demo
              </a>
            </div>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <p>Built with ❤️ for interview preparation</p>
      </footer>
    </div>
  );
} 