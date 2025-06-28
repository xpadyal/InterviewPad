import { useState, useEffect, useRef } from 'react';
import styles from './Behavioral.module.css';
import Navigation from './components/Navigation';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import VoiceInput from './VoiceInput';
import VoiceAgent from './VoiceAgent';

// Behavioral question categories
const categories = [
  { id: 'leadership', name: 'Leadership', icon: '👑', description: 'Team management and leadership scenarios' },
  { id: 'conflict', name: 'Conflict Resolution', icon: '🤝', description: 'Handling disagreements and difficult situations' },
  { id: 'problem-solving', name: 'Problem Solving', icon: '🧩', description: 'Analytical thinking and creative solutions' },
  { id: 'communication', name: 'Communication', icon: '💬', description: 'Clear communication and presentation skills' },
  { id: 'adaptability', name: 'Adaptability', icon: '🔄', description: 'Handling change and learning new skills' },
  { id: 'teamwork', name: 'Teamwork', icon: '👥', description: 'Collaboration and team dynamics' },
  { id: 'stress', name: 'Stress Management', icon: '😰', description: 'Working under pressure and deadlines' },
  { id: 'initiative', name: 'Initiative', icon: '🚀', description: 'Taking ownership and driving projects' }
];

export default function BehavioralInterview() {
  const [selectedCategories, setSelectedCategories] = useState(['leadership', 'problem-solving']);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [currentResponse, setCurrentResponse] = useState('');
  const [responseFeedback, setResponseFeedback] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [questionHistory, setQuestionHistory] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [interviewScore, setInterviewScore] = useState(0);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const timerRef = useRef(null);

  // Follow-up questions state
  const [followUpQuestions, setFollowUpQuestions] = useState([]);
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [showFollowUps, setShowFollowUps] = useState(false);
  const [followUpResponses, setFollowUpResponses] = useState({});
  const [currentFollowUpIndex, setCurrentFollowUpIndex] = useState(0);

  // Voice agent state
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [currentSpeakingText, setCurrentSpeakingText] = useState('');
  const lastSpokenTextRef = useRef('');

  // Error state
  const [error, setError] = useState(null);

  // Timer effect
  useEffect(() => {
    if (interviewStarted && !interviewComplete) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [interviewStarted, interviewComplete]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleVoiceTranscript = (transcript) => {
    setCurrentResponse(prev => prev + (prev ? ' ' : '') + transcript);
  };

  const handleFollowUpVoiceTranscript = (questionId) => (transcript) => {
    setFollowUpResponses(prev => ({
      ...prev,
      [questionId]: (prev[questionId] || '') + (prev[questionId] ? ' ' : '') + transcript
    }));
  };

  const speakQuestion = (question) => {
    if (voiceEnabled && question && question !== lastSpokenTextRef.current) {
      lastSpokenTextRef.current = question;
      setCurrentSpeakingText(question);
    }
  };

  const speakFeedback = (feedback) => {
    if (voiceEnabled && feedback) {
      const feedbackText = `Here's your feedback. Your score is ${feedback.score} out of 10. ${feedback.strengths.join(' ')} ${feedback.improvements.join(' ')} ${feedback.suggestions}`;
      if (feedbackText !== lastSpokenTextRef.current) {
        lastSpokenTextRef.current = feedbackText;
        setCurrentSpeakingText(feedbackText);
      }
    }
  };

  const speakFollowUp = (question) => {
    if (voiceEnabled && question && question !== lastSpokenTextRef.current) {
      lastSpokenTextRef.current = question;
      setCurrentSpeakingText(question);
    }
  };

  const generateQuestions = async () => {
    setQuestionLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/behavioral-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories: selectedCategories,
          count: totalQuestions
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate questions. Please try again.');
      }
      
      const data = await response.json();
      setQuestionHistory(data.questions);
      setCurrentQuestion(data.questions[0]);
      setCurrentQuestionIndex(0);
      setInterviewStarted(true);
      setTimer(0);
      setInterviewComplete(false);
      setInterviewScore(0);
      setFollowUpQuestions([]);
      setShowFollowUps(false);
      setFollowUpResponses({});
      setCurrentFollowUpIndex(0);
      
      // Speak the first question
      if (voiceEnabled) {
        setTimeout(() => speakQuestion(data.questions[0]), 1000);
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      setError(error.message);
    } finally {
      setQuestionLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questionHistory.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      const nextQuestion = questionHistory[currentQuestionIndex + 1];
      setCurrentQuestion(nextQuestion);
      setCurrentResponse('');
      setResponseFeedback(null);
      setFollowUpQuestions([]);
      setShowFollowUps(false);
      setFollowUpResponses({});
      setCurrentFollowUpIndex(0);
      
      // Speak the next question
      if (voiceEnabled) {
        setTimeout(() => speakQuestion(nextQuestion), 500);
      }
    } else {
      setInterviewComplete(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      const prevQuestion = questionHistory[currentQuestionIndex - 1];
      setCurrentQuestion(prevQuestion);
      setCurrentResponse('');
      setResponseFeedback(null);
      setFollowUpQuestions([]);
      setShowFollowUps(false);
      setFollowUpResponses({});
      setCurrentFollowUpIndex(0);
      
      // Speak the previous question
      if (voiceEnabled) {
        setTimeout(() => speakQuestion(prevQuestion), 500);
      }
    }
  };

  const getFeedback = async () => {
    setFeedbackLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/behavioral-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion,
          response: currentResponse,
          followUpQuestions: followUpQuestions,
          followUpResponses: followUpResponses
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get feedback. Please try again.');
      }
      
      const data = await response.json();
      setResponseFeedback(data.feedback);
      setInterviewScore(prev => prev + data.score);
      
      // Speak the feedback
      if (voiceEnabled) {
        setTimeout(() => speakFeedback(data.feedback), 500);
      }
    } catch (error) {
      console.error('Error getting feedback:', error);
      setError(error.message);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const generateFollowUpQuestions = async () => {
    setFollowUpLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/behavioral-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalQuestion: currentQuestion,
          response: currentResponse,
          followUpCount: 3
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate follow-up questions. Please try again.');
      }
      
      const data = await response.json();
      setFollowUpQuestions(data.followUpQuestions);
      setShowFollowUps(true);
      setCurrentFollowUpIndex(0);
      
      // Speak the first follow-up question
      if (voiceEnabled && data.followUpQuestions.length > 0) {
        setTimeout(() => speakFollowUp(data.followUpQuestions[0]), 500);
      }
    } catch (error) {
      console.error('Error generating follow-up questions:', error);
      setError(error.message);
    } finally {
      setFollowUpLoading(false);
    }
  };

  const handleNextFollowUp = () => {
    if (currentFollowUpIndex < followUpQuestions.length - 1) {
      const nextIndex = currentFollowUpIndex + 1;
      setCurrentFollowUpIndex(nextIndex);
      
      // Speak the next follow-up question
      if (voiceEnabled) {
        setTimeout(() => speakFollowUp(followUpQuestions[nextIndex]), 500);
      }
    }
  };

  const handlePreviousFollowUp = () => {
    if (currentFollowUpIndex > 0) {
      const prevIndex = currentFollowUpIndex - 1;
      setCurrentFollowUpIndex(prevIndex);
      
      // Speak the previous follow-up question
      if (voiceEnabled) {
        setTimeout(() => speakFollowUp(followUpQuestions[prevIndex]), 500);
      }
    }
  };

  const resetInterview = () => {
    setInterviewStarted(false);
    setCurrentQuestion(null);
    setQuestionHistory([]);
    setCurrentQuestionIndex(0);
    setCurrentResponse('');
    setResponseFeedback(null);
    setInterviewComplete(false);
    setInterviewScore(0);
    setTimer(0);
    setFollowUpQuestions([]);
    setShowFollowUps(false);
    setFollowUpResponses({});
    setCurrentFollowUpIndex(0);
    setCurrentSpeakingText('');
    setError(null);
  };

  return (
    <div className={styles.container}>
      <Navigation />
      
      <div className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>Behavioral Interview</h1>
          <div className={styles.headerControls}>
            <div className={styles.voiceToggle}>
              <label>
                <input
                  type="checkbox"
                  checked={voiceEnabled}
                  onChange={(e) => setVoiceEnabled(e.target.checked)}
                  className={styles.voiceToggleInput}
                />
                🔊 Voice Agent
              </label>
            </div>
            <div className={styles.timer}>
              ⏱️ {formatTime(timer)}
            </div>
          </div>
        </header>

        {error && (
          <ErrorMessage 
            error={error} 
            onRetry={() => setError(null)}
            onDismiss={() => setError(null)}
          />
        )}

        {!interviewStarted ? (
          <div className={styles.setup}>
            <div className={styles.setupSection}>
              <h2>Select Question Categories</h2>
              <div className={styles.categories}>
                {categories.map(category => (
                  <div
                    key={category.id}
                    className={`${styles.categoryCard} ${
                      selectedCategories.includes(category.id) ? styles.selected : ''
                    }`}
                    onClick={() => handleCategoryToggle(category.id)}
                  >
                    <div className={styles.categoryIcon}>{category.icon}</div>
                    <div className={styles.categoryInfo}>
                      <h3>{category.name}</h3>
                      <p>{category.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.setupSection}>
              <h2>Interview Settings</h2>
              <div className={styles.settings}>
                <label>
                  Number of Questions:
                  <select 
                    value={totalQuestions} 
                    onChange={(e) => setTotalQuestions(Number(e.target.value))}
                    className={styles.select}
                  >
                    <option value={3}>3 Questions</option>
                    <option value={5}>5 Questions</option>
                    <option value={8}>8 Questions</option>
                    <option value={10}>10 Questions</option>
                  </select>
                </label>
              </div>
            </div>

            <button 
              className={styles.startButton}
              onClick={generateQuestions}
              disabled={questionLoading || selectedCategories.length === 0}
            >
              {questionLoading ? (
                <LoadingSpinner size="small" text="Generating Questions..." />
              ) : (
                'Start Interview'
              )}
            </button>
          </div>
        ) : interviewComplete ? (
          <div className={styles.completion}>
            <div className={styles.completionCard}>
              <h2>Interview Complete! 🎉</h2>
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Total Time</span>
                  <span className={styles.statValue}>{formatTime(timer)}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Questions Answered</span>
                  <span className={styles.statValue}>{questionHistory.length}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Average Score</span>
                  <span className={styles.statValue}>
                    {Math.round(interviewScore / questionHistory.length)}/10
                  </span>
                </div>
              </div>
              <button className={styles.resetButton} onClick={resetInterview}>
                Start New Interview
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.interview}>
            <div className={styles.questionSection}>
              <div className={styles.questionHeader}>
                <span className={styles.questionNumber}>
                  Question {currentQuestionIndex + 1} of {questionHistory.length}
                </span>
                <div className={styles.navigation}>
                  <button 
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className={styles.navButton}
                  >
                    ← Previous
                  </button>
                  <button 
                    onClick={handleNextQuestion}
                    className={styles.navButton}
                  >
                    Next →
                  </button>
                </div>
              </div>
              
              <div className={styles.questionCard}>
                <h3>{currentQuestion}</h3>
                {voiceEnabled && currentSpeakingText === currentQuestion && (
                  <VoiceAgent
                    text={currentQuestion}
                    autoPlay={true}
                    onSpeakEnd={() => {
                      setCurrentSpeakingText('');
                      lastSpokenTextRef.current = '';
                    }}
                  />
                )}
              </div>
            </div>

            <div className={styles.responseSection}>
              <h3>Your Response</h3>
              <div className={styles.voiceInfo}>
                <span className={styles.voiceIndicator}>
                  🎤 Voice input available - Click the microphone icon to speak your response
                </span>
                <div className={styles.voiceTips}>
                  <p><strong>Response Tips:</strong></p>
                  <ul>
                    <li>Speak clearly and at a normal pace</li>
                    <li>Use specific examples and numbers when possible</li>
                    <li>You can edit the text after voice input</li>
                  </ul>
                </div>
              </div>
              <div className={styles.responseForm}>
                <div className={styles.responseField}>
                  <div className={styles.responseFieldHeader}>
                    <label className={styles.responseLabel}>
                      Your Answer:
                    </label>
                    <VoiceInput
                      onTranscript={handleVoiceTranscript}
                      placeholder="Click to speak"
                    />
                  </div>
                  <textarea
                    value={currentResponse}
                    onChange={(e) => setCurrentResponse(e.target.value)}
                    placeholder="Provide a detailed response to the question..."
                    className={styles.responseTextarea}
                    rows={8}
                  />
                </div>
              </div>

              <div className={styles.responseActions}>
                <button 
                  className={styles.feedbackButton}
                  onClick={getFeedback}
                  disabled={feedbackLoading || !currentResponse.trim()}
                >
                  {feedbackLoading ? (
                    <LoadingSpinner size="small" text="Analyzing..." />
                  ) : (
                    'Get Feedback'
                  )}
                </button>
                <button 
                  className={styles.followUpButton}
                  onClick={generateFollowUpQuestions}
                  disabled={followUpLoading || !currentResponse.trim() || showFollowUps}
                >
                  {followUpLoading ? (
                    <LoadingSpinner size="small" text="Generating..." />
                  ) : (
                    'Get Follow-up Questions'
                  )}
                </button>
              </div>

              {responseFeedback && (
                <div className={styles.feedbackSection}>
                  <h4>AI Feedback</h4>
                  <div className={styles.feedbackCard}>
                    <div className={styles.feedbackScore}>
                      Score: {responseFeedback.score || 'N/A'}/10
                    </div>
                    <div className={styles.feedbackContent}>
                      <h5>Strengths:</h5>
                      <ul>
                        {responseFeedback.strengths.map((strength, index) => (
                          <li key={index}>{strength}</li>
                        ))}
                      </ul>
                      <h5>Areas for Improvement:</h5>
                      <ul>
                        {responseFeedback.improvements.map((improvement, index) => (
                          <li key={index}>{improvement}</li>
                        ))}
                      </ul>
                      <h5>Suggestions:</h5>
                      <p>{responseFeedback.suggestions}</p>
                      {responseFeedback.starAnalysis && (
                        <>
                          <h5>STAR Method Analysis:</h5>
                          <div className={styles.starAnalysis}>
                            <div><strong>Situation:</strong> {responseFeedback.starAnalysis.situation}</div>
                            <div><strong>Task:</strong> {responseFeedback.starAnalysis.task}</div>
                            <div><strong>Action:</strong> {responseFeedback.starAnalysis.action}</div>
                            <div><strong>Result:</strong> {responseFeedback.starAnalysis.result}</div>
                          </div>
                        </>
                      )}
                      {responseFeedback.followUpAnalysis && (
                        <>
                          <h5>Follow-up Analysis:</h5>
                          <p>{responseFeedback.followUpAnalysis}</p>
                        </>
                      )}
                    </div>
                  </div>
                  {voiceEnabled && (
                    <VoiceAgent
                      text={`Here's your feedback. Your score is ${responseFeedback.score || 'N/A'} out of 10. ${responseFeedback.strengths.join(' ')} ${responseFeedback.improvements.join(' ')} ${responseFeedback.suggestions}`}
                      autoPlay={true}
                      onSpeakEnd={() => {
                        setCurrentSpeakingText('');
                        lastSpokenTextRef.current = '';
                      }}
                    />
                  )}
                </div>
              )}

              {showFollowUps && followUpQuestions.length > 0 && (
                <div className={styles.followUpSection}>
                  <h4>Follow-up Questions</h4>
                  <div className={styles.followUpCard}>
                    <div className={styles.followUpHeader}>
                      <span className={styles.followUpNumber}>
                        Follow-up {currentFollowUpIndex + 1} of {followUpQuestions.length}
                      </span>
                      <div className={styles.followUpNavigation}>
                        <button 
                          onClick={handlePreviousFollowUp}
                          disabled={currentFollowUpIndex === 0}
                          className={styles.navButton}
                        >
                          ← Previous
                        </button>
                        <button 
                          onClick={handleNextFollowUp}
                          disabled={currentFollowUpIndex === followUpQuestions.length - 1}
                          className={styles.navButton}
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                    
                    <div className={styles.followUpQuestion}>
                      <h5>{followUpQuestions[currentFollowUpIndex]}</h5>
                      {voiceEnabled && currentSpeakingText === followUpQuestions[currentFollowUpIndex] && (
                        <VoiceAgent
                          text={followUpQuestions[currentFollowUpIndex]}
                          autoPlay={true}
                          onSpeakEnd={() => {
                            setCurrentSpeakingText('');
                            lastSpokenTextRef.current = '';
                          }}
                        />
                      )}
                    </div>

                    <div className={styles.followUpResponse}>
                      <div className={styles.starFieldHeader}>
                        <label className={styles.starLabel}>Your Response:</label>
                        <VoiceInput
                          onTranscript={handleFollowUpVoiceTranscript(currentFollowUpIndex)}
                          placeholder="Click to speak"
                        />
                      </div>
                      <textarea
                        value={followUpResponses[currentFollowUpIndex] || ''}
                        onChange={(e) => setFollowUpResponses(prev => ({
                          ...prev,
                          [currentFollowUpIndex]: e.target.value
                        }))}
                        placeholder="Provide a detailed response to the follow-up question..."
                        className={styles.starTextarea}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 