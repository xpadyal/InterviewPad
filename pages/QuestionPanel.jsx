import styles from './QuestionPanel.module.css';
import { useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function QuestionPanel({ question, questionLoading }) {
  const [tab, setTab] = useState('description');
  if (questionLoading) return (
    <div className={styles.questionPanel} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 220 }}>
      <LoadingSpinner text="Loading question..." />
    </div>
  );
  if (!question) return (
    <div className={styles.questionPanel} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 220, color: 'var(--text-secondary, #a1a1aa)' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.7rem' }}>📝</div>
      <div style={{ fontSize: '1.15rem', fontWeight: 500, textAlign: 'center' }}>
        Start an interview to get a coding question!
      </div>
    </div>
  );
  return (
    <div className={styles.questionPanel}>
      <div className={styles.questionTitle}>{question.title}</div>
      <div className={styles.questionTabs}>
        <button className={tab === 'description' ? styles.questionTabActive : styles.questionTab} onClick={() => setTab('description')}>Description</button>
        <button className={tab === 'constraints' ? styles.questionTabActive : styles.questionTab} onClick={() => setTab('constraints')}>Constraints</button>
        <button className={tab === 'examples' ? styles.questionTabActive : styles.questionTab} onClick={() => setTab('examples')}>Examples</button>
      </div>
      {tab === 'description' && (
        <div className={styles.questionDescription}>{question.description}</div>
      )}
      {tab === 'constraints' && question.constraints && question.constraints.length > 0 && (
        <div className={styles.constraints}>
          <b>Constraints:</b>
          <ul>
            {question.constraints.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      )}
      {tab === 'examples' && (
        question.examples && question.examples.length > 0 ? (
          <div className={styles.examples}>
            <b>Examples:</b>
            {question.examples.map((ex, i) => (
              <div className={styles.exampleBox} key={i}>
                <div><span className={styles.exampleInput}><b>Input:</b> {ex.input}</span></div>
                <div><span className={styles.exampleOutput}><b>Output:</b> {ex.output}</span></div>
                {ex.explanation && <div className={styles.exampleExplanation}><b>Explanation:</b> {ex.explanation}</div>}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.examples} style={{ color: 'var(--text-secondary, #a1a1aa)', padding: '1rem' }}>
            No valid examples available for this question.
          </div>
        )
      )}
    </div>
  );
} 