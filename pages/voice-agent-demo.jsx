import { useState } from 'react';
import VoiceAgent from './VoiceAgent';
import styles from './VoiceAgentDemo.module.css';

export default function VoiceAgentDemo() {
  const [selectedExample, setSelectedExample] = useState('question');

  const examples = {
    question: {
      title: 'Interview Question',
      text: 'Tell me about a time when you had to lead a team through a difficult project. What was the situation, and how did you handle it?',
      description: 'AI interviewer asking a behavioral question'
    },
    feedback: {
      title: 'AI Feedback',
      text: "Here's your feedback. Your score is 8 out of 10. You provided excellent structure using the STAR method. Your response included specific details and measurable outcomes. Consider adding more quantifiable results and reflecting on what you learned from the experience.",
      description: 'AI providing detailed feedback on a response'
    },
    followup: {
      title: 'Follow-up Question',
      text: 'You mentioned the project was behind schedule. What specific steps did you take to get it back on track, and how did you communicate these changes to stakeholders?',
      description: 'AI asking a contextual follow-up question'
    },
    custom: {
      title: 'Custom Text',
      text: '',
      description: 'Enter your own text to hear the AI speak'
    }
  };

  const handleExampleChange = (exampleKey) => {
    setSelectedExample(exampleKey);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Voice Agent Demo</h1>
        <a href="/" className={styles.backLink}>← Back to Home</a>
      </header>

      <div className={styles.content}>
        <div className={styles.intro}>
          <h2>AI Voice Agent</h2>
          <p>Experience the power of text-to-speech in your behavioral interviews. The AI interviewer can speak questions, provide feedback, and ask follow-up questions naturally.</p>
        </div>

        <div className={styles.demoSection}>
          <h3>Try Different Examples</h3>
          <div className={styles.exampleTabs}>
            {Object.entries(examples).map(([key, example]) => (
              <button
                key={key}
                className={`${styles.exampleTab} ${selectedExample === key ? styles.active : ''}`}
                onClick={() => handleExampleChange(key)}
              >
                {example.title}
              </button>
            ))}
          </div>

          <div className={styles.exampleContent}>
            <div className={styles.exampleInfo}>
              <h4>{examples[selectedExample].title}</h4>
              <p>{examples[selectedExample].description}</p>
            </div>

            {selectedExample === 'custom' ? (
              <div className={styles.customInput}>
                <textarea
                  placeholder="Enter text for the AI to speak..."
                  className={styles.customTextarea}
                  rows={4}
                  onChange={(e) => {
                    examples.custom.text = e.target.value;
                  }}
                />
              </div>
            ) : (
              <div className={styles.exampleText}>
                <p>{examples[selectedExample].text}</p>
              </div>
            )}

            <div className={styles.voiceAgentDemo}>
              <VoiceAgent
                text={selectedExample === 'custom' ? examples.custom.text : examples[selectedExample].text}
                autoPlay={false}
              />
            </div>
          </div>
        </div>

        <div className={styles.featuresSection}>
          <h3>Voice Agent Features</h3>
          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🎯</div>
              <h4>Natural Speech</h4>
              <p>Uses browser's text-to-speech with natural-sounding voices</p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🎛️</div>
              <h4>Voice Selection</h4>
              <p>Choose from multiple available voices and languages</p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>⏯️</div>
              <h4>Playback Control</h4>
              <p>Start, stop, and control speech playback</p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🔄</div>
              <h4>Auto-Play</h4>
              <p>Automatically speaks questions and feedback during interviews</p>
            </div>
          </div>
        </div>

        <div className={styles.interviewPreview}>
          <h3>Interview Experience</h3>
          <div className={styles.previewSteps}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>AI Asks Question</h4>
                <p>The voice agent speaks the behavioral question clearly</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>You Respond</h4>
                <p>Use voice input or text to provide your STAR response</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>AI Provides Feedback</h4>
                <p>Hear detailed feedback and scoring spoken naturally</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Follow-up Questions</h4>
                <p>AI asks contextual follow-up questions based on your response</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.cta}>
          <h3>Ready to Experience the Full Interview?</h3>
          <p>Try the complete behavioral interview with voice agent integration</p>
          <a href="/behavioral" className={styles.ctaButton}>
            Start Behavioral Interview
          </a>
        </div>
      </div>
    </div>
  );
} 