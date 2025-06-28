import { useState, useEffect, useRef } from 'react';
import styles from './VoiceInput.module.css';

export default function VoiceInput({ onTranscript, placeholder, disabled = false }) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check if speech recognition is supported
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
        };
        
        recognition.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          if (finalTranscript) {
            onTranscript(finalTranscript);
          }
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setError(getErrorMessage(event.error));
          setIsListening(false);
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current = recognition;
        setIsSupported(true);
      }
    }
  }, [onTranscript]);

  const getErrorMessage = (error) => {
    switch (error) {
      case 'no-speech':
        return 'No speech detected. Please try again.';
      case 'audio-capture':
        return 'Audio capture failed. Please check your microphone.';
      case 'not-allowed':
        return 'Microphone access denied. Please allow microphone access.';
      case 'network':
        return 'Network error. Please check your connection.';
      default:
        return 'Speech recognition error. Please try again.';
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !disabled && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        setError('Failed to start voice input. Please try again.');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (error) {
        console.error('Failed to stop speech recognition:', error);
        setIsListening(false);
      }
    }
  };

  const handleButtonClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <div className={styles.unsupported}>
        <span>🎤 Voice input not supported in this browser</span>
      </div>
    );
  }

  return (
    <div className={styles.voiceInputContainer}>
      <button
        className={`${styles.voiceButton} ${isListening ? styles.listening : ''} ${disabled ? styles.disabled : ''}`}
        onClick={handleButtonClick}
        disabled={disabled}
        title={isListening ? 'Stop recording' : 'Start voice input'}
        type="button"
      >
        {isListening ? '⏹️' : '🎤'}
      </button>
      
      {isListening && (
        <div className={styles.recordingIndicator}>
          <span className={styles.recordingDot}></span>
          <span>Recording... Click to stop</span>
        </div>
      )}
      
      {error && (
        <div className={styles.errorMessage}>
          <span>⚠️ {error}</span>
        </div>
      )}
      
      {placeholder && !isListening && !error && (
        <div className={styles.placeholder}>
          <span>{placeholder}</span>
        </div>
      )}
    </div>
  );
} 