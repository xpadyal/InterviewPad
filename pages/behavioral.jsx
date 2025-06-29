import { useState, useEffect, useRef } from 'react';
import styles from './Behavioral.module.css';
import Navigation from '../components/Navigation';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import VoiceInput from './VoiceInput';
import VoiceAgent from './VoiceAgent';
import Modal from './Modal';
import ProtectedRoute from '../components/ProtectedRoute';

// Behavioral question categories
const categories = [
  { id: 'leadership', name: 'Leadership', icon: '👑', description: 'Team management and leadership scenarios' },
  { id: 'conflict', name: 'Conflict Resolution', icon: '🤝', description: 'Handling disagreements and difficult situations' },
  { id: 'problem-solving', name: 'Problem Solving', icon: '🧩', description: 'Analytical thinking and creative solutions' },
  { id: 'communication', name: 'Communication', icon: '💬', description: 'Clear communication and presentation skills' },
  { id: 'adaptability', name: 'Adaptability', icon: '🔄', description: 'Handling change and learning new skills' },
  { id: 'teamwork', name: 'Teamwork', icon: '👥', description: 'Collaboration and team dynamics' },
  { id: 'stress', name: 'Stress Management', icon: '😰', description: 'Working under pressure and deadlines' },
  { id: 'initiative', name: 'Initiative', icon: '🚀', description: 'Taking ownership and driving projects' },
  { id: 'resume', name: 'Resume Interview', icon: '📄', description: 'Questions based on your resume and experience' }
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

  // Session management state
  const [sessionId, setSessionId] = useState(null);
  const [sessionData, setSessionData] = useState([]);

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

  // Resume and job description state
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescFile, setJobDescFile] = useState(null);
  const [jobDescText, setJobDescText] = useState('');
  const [fileError, setFileError] = useState(null);

  // Resume modal state
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [modalResumeFile, setModalResumeFile] = useState(null);
  const [modalResumeText, setModalResumeText] = useState('');
  const [modalJobDescText, setModalJobDescText] = useState('');
  const [modalFileError, setModalFileError] = useState(null);

  // Saved resumes state
  const [savedResumes, setSavedResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState(null);

  // Add state for config modal
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('');
  const [industry, setIndustry] = useState('Software');

  const industryOptions = [
    'Software', 'Finance', 'Healthcare', 'Education', 'Retail', 'Manufacturing', 'Consulting', 'Government', 'Other'
  ];

  // Initialize PDF.js on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initPDF = async () => {
        const { GlobalWorkerOptions, getDocument } = await import('pdfjs-dist/build/pdf');
        // Use local worker file for better reliability
        GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
        // Make getDocument available globally
        window.pdfjsLib = { getDocument };
      };
      initPDF();
    }
  }, []);

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
    if (categoryId === 'resume') {
      setShowResumeModal(true);
      return;
    }
    
    // If Resume Interview is selected, prevent other categories from being selected
    if (selectedCategories.includes('resume') && categoryId !== 'resume') {
      return;
    }
    
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

  // Create a new behavioral session
  const createSession = async () => {
    try {
      const response = await fetch('/api/behavioral-session/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories: selectedCategories,
          totalQuestions: totalQuestions
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();
      setSessionId(data.sessionId);
      return data.sessionId;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };

  // Save Q&A data to session
  const saveQAToSession = async (questionNumber, questionText, userResponse, aiFeedback, score) => {
    if (!sessionId) return;

    try {
      await fetch('/api/behavioral-session/save-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionNumber,
          questionText,
          userResponse,
          aiFeedback,
          score,
          followUpQuestions: followUpQuestions.length > 0 ? followUpQuestions : null,
          followUpResponses: Object.keys(followUpResponses).length > 0 ? followUpResponses : null
        })
      });
    } catch (error) {
      console.error('Error saving Q&A:', error);
    }
  };

  // Complete the session
  const completeSession = async () => {
    if (!sessionId) return;

    try {
      const overallScore = Math.round(interviewScore / questionHistory.length);
      const overallFeedback = `Interview completed with ${questionHistory.length} questions. Total score: ${interviewScore}/${questionHistory.length * 10}. Average score: ${overallScore}%.`;

      await fetch('/api/behavioral-session/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          completedQuestions: questionHistory.length,
          overallScore,
          overallFeedback
        })
      });
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  // Open config modal on Start Interview
  const handleStartInterview = () => {
    setShowConfigModal(true);
  };

  // Confirm config and generate questions
  const handleConfirmConfig = async () => {
    setShowConfigModal(false);
    await generateQuestions();
  };

  // Update generateQuestions to use config
  const generateQuestions = async () => {
    setQuestionLoading(true);
    setError(null);
    try {
      // Create a new session first
      const newSessionId = await createSession();
      setSessionId(newSessionId);

      // Determine which API to use based on selected categories
      const isResumeInterview = selectedCategories.includes('resume');
      const apiEndpoint = isResumeInterview ? '/api/resume-questions' : '/api/behavioral-questions';
      
      const requestBody = isResumeInterview 
        ? {
            resumeText: resumeText,
            jobDescription: jobDescText,
            count: totalQuestions,
            role,
            experience,
            industry
          }
        : {
            categories: selectedCategories,
            count: totalQuestions,
            role,
            experience,
            industry
          };

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
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
      // Complete the session when interview is finished
      completeSession();
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
      // Determine which API to use based on selected categories
      const isResumeInterview = selectedCategories.includes('resume');
      const apiEndpoint = isResumeInterview ? '/api/resume-feedback' : '/api/behavioral-feedback';
      
      const requestBody = isResumeInterview 
        ? {
            question: currentQuestion,
            response: currentResponse,
            resumeText: resumeText,
            jobDescription: jobDescText,
            followUpQuestions: followUpQuestions,
            followUpResponses: followUpResponses
          }
        : {
            question: currentQuestion,
            response: currentResponse,
            followUpQuestions: followUpQuestions,
            followUpResponses: followUpResponses
          };

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error('Failed to get feedback. Please try again.');
      }
      
      const data = await response.json();
      setResponseFeedback(data.feedback);
      setInterviewScore(prev => prev + data.score);
      
      // Save Q&A to session
      await saveQAToSession(
        currentQuestionIndex + 1,
        currentQuestion,
        currentResponse,
        JSON.stringify(data.feedback),
        data.score
      );
      
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

  // End interview early and save session
  const endInterviewEarly = async () => {
    if (confirm('Are you sure you want to end this interview? Your progress will be saved.')) {
      // Complete the session with current progress
      await completeSession();
      setInterviewComplete(true);
    }
  };

  // Restart interview with same settings
  const restartInterview = async () => {
    if (confirm('Are you sure you want to restart this interview? Your current progress will be lost.')) {
      // Reset all state
      resetInterview();
      // Generate new questions with same settings
      await generateQuestions();
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
    setSessionId(null);
    setSessionData([]);
  };

  // Helper: Read file as text
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  // Helper: Read PDF as text
  const readPdfAsText = async (file) => {
    try {
      if (!window.pdfjsLib) {
        throw new Error('PDF.js not initialized');
      }
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
      }
      return text;
    } catch (error) {
      console.error('PDF reading error:', error);
      
      // Fallback: try to reinitialize PDF.js
      if (error.message === 'PDF.js not initialized') {
        try {
          const { GlobalWorkerOptions, getDocument } = await import('pdfjs-dist/build/pdf');
          GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
          window.pdfjsLib = { getDocument };
          
          // Retry reading the PDF
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let text = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(' ') + '\n';
          }
          return text;
        } catch (retryError) {
          console.error('PDF retry failed:', retryError);
          throw new Error('Failed to read PDF file. Please try uploading a text file instead.');
        }
      }
      
      throw new Error('Failed to read PDF file. Please try uploading a text file instead.');
    }
  };

  // Handle resume upload
  const handleResumeUpload = async (e) => {
    setFileError(null);
    const file = e.target.files[0];
    if (!file) return;
    setResumeFile(file);
    try {
      let text = '';
      if (file.type === 'application/pdf') {
        text = await readPdfAsText(file);
      } else if (file.type === 'text/plain') {
        text = await readFileAsText(file);
      } else {
        setFileError('Only PDF or plain text files are supported for now.');
        setResumeText('');
        return;
      }
      setResumeText(text);
    } catch (err) {
      setFileError('Failed to read resume file.');
      setResumeText('');
    }
  };

  // Handle job description upload
  const handleJobDescUpload = async (e) => {
    setFileError(null);
    const file = e.target.files[0];
    if (!file) return;
    setJobDescFile(file);
    try {
      let text = '';
      if (file.type === 'application/pdf') {
        text = await readPdfAsText(file);
      } else if (file.type === 'text/plain') {
        text = await readFileAsText(file);
      } else {
        setFileError('Only PDF or plain text files are supported for now.');
        setJobDescText('');
        return;
      }
      setJobDescText(text);
    } catch (err) {
      setFileError('Failed to read job description file.');
      setJobDescText('');
    }
  };

  // Modal resume upload handler
  const handleModalResumeUpload = async (e) => {
    setModalFileError(null);
    const file = e.target.files[0];
    if (!file) return;
    setModalResumeFile(file);
    
    // Show loading state
    setModalFileError('Processing PDF... Please wait.');
    
    try {
      let text = '';
      if (file.type === 'application/pdf') {
        text = await readPdfAsText(file);
      } else if (file.type === 'text/plain') {
        text = await readFileAsText(file);
      } else {
        setModalFileError('Only PDF or plain text files are supported for now.');
        setModalResumeText('');
        return;
      }
      setModalResumeText(text);
      setModalFileError(null); // Clear loading message
    } catch (err) {
      console.error('File reading error:', err);
      setModalFileError(err.message || 'Failed to read resume file.');
      setModalResumeText('');
    }
  };

  // Load saved resumes when modal opens
  useEffect(() => {
    if (showResumeModal) {
      loadSavedResumes();
    }
  }, [showResumeModal]);

  // Confirm modal and add resume category
  const confirmResumeModal = async () => {
    if (!modalResumeText.trim()) {
      setModalFileError('Please upload a resume first.');
      return;
    }
    
    try {
      // If it's a new upload (not a selected saved resume), save it to database
      if (modalResumeFile && !selectedResumeId) {
        await saveResumeToDatabase(
          modalResumeFile.name,
          modalResumeText,
          modalResumeFile.type
        );
      }
      
      // Add resume category and set the resume data
      setSelectedCategories(prev => 
        prev.includes('resume') ? prev : [...prev, 'resume']
      );
      setResumeFile(modalResumeFile);
      setResumeText(modalResumeText);
      setJobDescText(modalJobDescText);
      
      // Close modal and reset modal state
      setShowResumeModal(false);
      setModalResumeFile(null);
      setModalResumeText('');
      setModalJobDescText('');
      setModalFileError(null);
      setSelectedResumeId(null);
    } catch (error) {
      setModalFileError('Failed to save resume. Please try again.');
    }
  };

  // Cancel modal
  const cancelResumeModal = () => {
    setShowResumeModal(false);
    setModalResumeFile(null);
    setModalResumeText('');
    setModalJobDescText('');
    setModalFileError(null);
  };

  // Remove Resume Interview category
  const removeResumeCategory = () => {
    setSelectedCategories(prev => prev.filter(id => id !== 'resume'));
    setResumeFile(null);
    setResumeText('');
    setJobDescText('');
  };

  // Load saved resumes
  const loadSavedResumes = async () => {
    setLoadingResumes(true);
    try {
      const response = await fetch('/api/user/resumes');
      if (response.ok) {
        const data = await response.json();
        setSavedResumes(data.resumes);
      }
    } catch (error) {
      console.error('Error loading resumes:', error);
    } finally {
      setLoadingResumes(false);
    }
  };

  // Save resume to database
  const saveResumeToDatabase = async (filename, content, fileType) => {
    try {
      const response = await fetch('/api/user/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, content, fileType })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Reload resumes after saving
        await loadSavedResumes();
        return data.resume;
      } else {
        throw new Error('Failed to save resume');
      }
    } catch (error) {
      console.error('Error saving resume:', error);
      throw error;
    }
  };

  // Select a saved resume
  const selectSavedResume = (resume) => {
    setSelectedResumeId(resume.id);
    setModalResumeText(resume.content);
    setModalResumeFile({ name: resume.filename, type: resume.file_type });
  };

  // Delete a saved resume
  const deleteSavedResume = async (resumeId) => {
    if (confirm('Are you sure you want to delete this resume?')) {
      try {
        const response = await fetch('/api/user/resumes', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeId })
        });
        
        if (response.ok) {
          await loadSavedResumes();
          if (selectedResumeId === resumeId) {
            setSelectedResumeId(null);
            setModalResumeText('');
            setModalResumeFile(null);
          }
        }
      } catch (error) {
        console.error('Error deleting resume:', error);
      }
    }
  };

  return (
    <ProtectedRoute>
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
                      } ${category.id === 'resume' && resumeText && jobDescText ? styles.resumeComplete : ''}`}
                      onClick={() => handleCategoryToggle(category.id)}
                      style={{
                        opacity: selectedCategories.includes('resume') && category.id !== 'resume' ? 0.5 : 1,
                        cursor: selectedCategories.includes('resume') && category.id !== 'resume' ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <div className={styles.categoryIcon}>{category.icon}</div>
                      <div className={styles.categoryInfo}>
                        <h3>{category.name}</h3>
                        <p>{category.description}</p>
                      </div>
                      {category.id === 'resume' && resumeText && jobDescText && (
                        <div className={styles.resumeTick}>✅</div>
                      )}
                      {category.id === 'resume' && selectedCategories.includes('resume') && (
                        <button 
                          className={styles.removeResumeButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeResumeCategory();
                          }}
                          title="Remove Resume Interview"
                        >
                          ✕
                        </button>
                      )}
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
                onClick={handleStartInterview}
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
                  <div className={styles.interviewControls}>
                    <button 
                      onClick={endInterviewEarly}
                      className={styles.endButton}
                      title="End interview and save progress"
                    >
                      🏁 End Interview
                    </button>
                    <button 
                      onClick={restartInterview}
                      className={styles.restartButton}
                      title="Restart interview with same settings"
                    >
                      🔄 Restart
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
                        {responseFeedback.resumeAlignment && (
                          <>
                            <h5>Resume Alignment:</h5>
                            <p>{responseFeedback.resumeAlignment}</p>
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
        
        {/* Resume Interview Modal */}
        <Modal
          open={showResumeModal}
          onClose={cancelResumeModal}
          title="Resume Interview Setup"
        >
          <div className={styles.modalContent}>
            {/* Saved Resumes Section */}
            <div className={styles.modalSection}>
              <h3>Saved Resumes</h3>
              <p>Select from your previously uploaded resumes or upload a new one below.</p>
              {loadingResumes ? (
                <div className={styles.modalLoading}>Loading saved resumes...</div>
              ) : savedResumes.length > 0 ? (
                <div className={styles.savedResumesList}>
                  {savedResumes.map((resume) => (
                    <div 
                      key={resume.id} 
                      className={`${styles.savedResumeItem} ${selectedResumeId === resume.id ? styles.selected : ''}`}
                      onClick={() => selectSavedResume(resume)}
                    >
                      <div className={styles.savedResumeInfo}>
                        <span className={styles.savedResumeName}>{resume.filename}</span>
                        <span className={styles.savedResumeDate}>
                          {new Date(resume.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className={styles.savedResumeActions}>
                        <button 
                          className={styles.savedResumeSelect}
                          onClick={(e) => {
                            e.stopPropagation();
                            selectSavedResume(resume);
                          }}
                        >
                          {selectedResumeId === resume.id ? '✓ Selected' : 'Select'}
                        </button>
                        <button 
                          className={styles.savedResumeDelete}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSavedResume(resume.id);
                          }}
                          title="Delete resume"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.noSavedResumes}>
                  <p>No saved resumes yet. Upload your first resume below.</p>
                </div>
              )}
            </div>

            <div className={styles.modalSection}>
              <h3>Upload New Resume</h3>
              <p>Upload your resume (PDF or TXT) to get personalized interview questions based on your experience.</p>
              <div className={styles.modalUploadField}>
                <input 
                  type="file" 
                  accept=".pdf,.txt" 
                  onChange={handleModalResumeUpload}
                  className={styles.modalFileInput}
                />
                {modalResumeFile && (
                  <div className={styles.modalFileInfo}>
                    <span className={styles.modalFileName}>{modalResumeFile.name}</span>
                    <button 
                      className={styles.modalRemoveButton} 
                      onClick={() => { 
                        setModalResumeFile(null); 
                        setModalResumeText(''); 
                        setSelectedResumeId(null);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.modalSection}>
              <h3>Job Description (Optional)</h3>
              <p>Add the job description to get more targeted questions.</p>
              <textarea
                value={modalJobDescText}
                onChange={(e) => setModalJobDescText(e.target.value)}
                placeholder="Paste the job description here..."
                className={styles.modalTextarea}
                rows={6}
              />
            </div>

            {modalFileError && (
              <div className={styles.modalError}>{modalFileError}</div>
            )}

            <div className={styles.modalActions}>
              <button 
                className={styles.modalCancelButton} 
                onClick={cancelResumeModal}
              >
                Cancel
              </button>
              <button 
                className={styles.modalConfirmButton} 
                onClick={confirmResumeModal}
                disabled={!modalResumeText.trim()}
              >
                Confirm & Add Resume Interview
              </button>
            </div>
          </div>
        </Modal>

        {/* Config Modal */}
        <Modal
          open={showConfigModal}
          onClose={() => setShowConfigModal(false)}
          title="Interview Configuration"
        >
          <div className={styles.modalContent}>
            <div className={styles.modalSection}>
              <h3>Customize Interview Context</h3>
              <label className={styles.configLabel}>
                Role/Position:
                <input
                  type="text"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className={styles.configInput}
                  placeholder="e.g. Software Engineer"
                />
              </label>
              <label className={styles.configLabel}>
                Years of Experience:
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={experience}
                  onChange={e => setExperience(e.target.value)}
                  className={styles.configInput}
                  placeholder="e.g. 3"
                />
              </label>
              <label className={styles.configLabel}>
                Industry:
                <select
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  className={styles.configInput}
                >
                  {industryOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.modalCancelButton} onClick={() => setShowConfigModal(false)}>
                Cancel
              </button>
              <button className={styles.modalConfirmButton} onClick={handleConfirmConfig}>
                Confirm & Start Interview
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </ProtectedRoute>
  );
} 