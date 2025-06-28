import { useState, useEffect, useRef } from 'react';
import styles from './VoiceAgent.module.css';

export default function VoiceAgent({ 
  text, 
  onSpeakStart, 
  onSpeakEnd, 
  autoPlay = false,
  voice = 'default',
  rate = 1.0,
  pitch = 1.0,
  volume = 1.0
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const utteranceRef = useRef(null);
  const lastSpokenTextRef = useRef('');

  useEffect(() => {
    // Check if speech synthesis is supported
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      
      // Load available voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        
        // Set default voice (prefer English voices)
        const englishVoice = voices.find(v => 
          v.lang.startsWith('en') && v.name.includes('Google')
        ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
        
        setSelectedVoice(englishVoice);
      };

      // Load voices when they become available
      if (window.speechSynthesis.getVoices().length > 0) {
        loadVoices();
      } else {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  useEffect(() => {
    // Auto-play if enabled and text is provided and different from last spoken
    if (autoPlay && text && isSupported && !isSpeaking && text !== lastSpokenTextRef.current) {
      speak();
    }
  }, [text, autoPlay, isSupported, isSpeaking]);

  const speak = () => {
    if (!isSupported || !text || isSpeaking) return;

    // Stop any current speech
    stop();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      lastSpokenTextRef.current = text;
      onSpeakStart?.();
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      onSpeakEnd?.();
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
      onSpeakEnd?.();
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    if (window.speechSynthesis && isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      onSpeakEnd?.();
    }
  };

  const pause = () => {
    if (window.speechSynthesis && isSpeaking) {
      window.speechSynthesis.pause();
    }
  };

  const resume = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.resume();
    }
  };

  if (!isSupported) {
    return (
      <div className={styles.unsupported}>
        <span>🔊 Text-to-speech not supported in this browser</span>
      </div>
    );
  }

  return (
    <div className={styles.voiceAgentContainer}>
      <div className={styles.voiceControls}>
        <button
          className={`${styles.voiceButton} ${isSpeaking ? styles.speaking : ''}`}
          onClick={isSpeaking ? stop : speak}
          disabled={!text}
          title={isSpeaking ? 'Stop speaking' : 'Start speaking'}
        >
          {isSpeaking ? '⏹️' : '🔊'}
        </button>
        
        {isSpeaking && (
          <div className={styles.speakingIndicator}>
            <span className={styles.speakingDot}></span>
            <span>Speaking...</span>
          </div>
        )}
      </div>

      {availableVoices.length > 0 && (
        <div className={styles.voiceSettings}>
          <select
            value={selectedVoice?.name || ''}
            onChange={(e) => {
              const voice = availableVoices.find(v => v.name === e.target.value);
              setSelectedVoice(voice);
            }}
            className={styles.voiceSelect}
            title="Select voice"
          >
            {availableVoices.map((voice) => (
              <option key={voice.name} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </div>
      )}

      {text && (
        <div className={styles.textPreview}>
          <span className={styles.previewLabel}>AI will say:</span>
          <p className={styles.previewText}>{text}</p>
        </div>
      )}
    </div>
  );
} 