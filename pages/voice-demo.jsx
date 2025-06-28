import { useState } from 'react';
import VoiceInput from './VoiceInput';
import styles from './VoiceDemo.module.css';

export default function VoiceDemo() {
  const [transcript, setTranscript] = useState('');

  const handleTranscript = (text) => {
    setTranscript(prev => prev + (prev ? ' ' : '') + text);
  };

  const clearTranscript = () => {
    setTranscript('');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Voice Input Demo</h1>
        <a href="/" className={styles.backLink}>← Back to Home</a>
      </header>

      <div className={styles.content}>
        <div className={styles.demoSection}>
          <h2>Test Voice Input</h2>
          <p>Click the microphone button below and start speaking. Your speech will be converted to text.</p>
          
          <div className={styles.voiceDemo}>
            <VoiceInput 
              onTranscript={handleTranscript}
              placeholder="Click to start speaking..."
            />
          </div>

          <div className={styles.transcriptSection}>
            <div className={styles.transcriptHeader}>
              <h3>Transcript</h3>
              <button onClick={clearTranscript} className={styles.clearButton}>
                Clear
              </button>
            </div>
            <div className={styles.transcriptBox}>
              {transcript || 'Your speech will appear here...'}
            </div>
          </div>
        </div>

        <div className={styles.infoSection}>
          <h3>Voice Input Features</h3>
          <ul>
            <li>✅ Real-time speech recognition</li>
            <li>✅ Continuous listening mode</li>
            <li>✅ Error handling and user feedback</li>
            <li>✅ Browser compatibility detection</li>
            <li>✅ Visual recording indicators</li>
          </ul>
          
          <div className={styles.browserSupport}>
            <h4>Browser Support</h4>
            <p>Voice input works best in Chrome, Edge, and Safari. Firefox support may be limited.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 