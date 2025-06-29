import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../utils/auth';
import ProtectedRoute from '../components/ProtectedRoute';
import Navigation from '../components/Navigation';
import styles from './Index.module.css';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
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
    <ProtectedRoute>
      <div className={styles.container}>
        <Navigation />
        
        <div className={styles.hero}>
          <h1 className={styles.title}>Welcome back, {user?.name}! 👋</h1>
          <p className={styles.subtitle}>
            Continue your interview preparation journey with AI-powered practice
          </p>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>2</span>
              <span className={styles.statLabel}>Interview Types</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>8</span>
              <span className={styles.statLabel}>Categories</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>🎤</span>
              <span className={styles.statLabel}>Voice Features</span>
            </div>
          </div>
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
              <div className={styles.demoLinks}>
                <a href="/voice-demo" className={styles.demoLink}>
                  🎤 Try Voice Input Demo
                </a>
                <a href="/voice-agent-demo" className={styles.demoLink}>
                  🔊 Try Voice Agent Demo
                </a>
              </div>
            </div>
          </div>

          <div className={styles.features}>
            <h3>🎯 Quick Start Guide</h3>
            <div className={styles.quickStart}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h4>Choose Your Path</h4>
                  <p>Select between coding or behavioral interviews based on your needs</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h4>Practice & Learn</h4>
                  <p>Use AI-powered feedback to improve your skills and responses</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h4>Master Voice Features</h4>
                  <p>Try voice input and AI voice agent for realistic practice</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className={styles.footer}>
          <p>Built with ❤️ for interview preparation</p>
        </footer>
      </div>
    </ProtectedRoute>
  );
} 