import { useState, useEffect } from 'react';
import { useAuth } from '../utils/auth';
import ProtectedRoute from '../components/ProtectedRoute';
import Navigation from '../components/Navigation';
import Link from 'next/link';
import styles from './Sessions.module.css';

export default function Sessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/user/behavioral-sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionDetails = async (sessionId) => {
    try {
      const response = await fetch(`/api/behavioral-session/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setSessionDetails(data);
        setSelectedSession(sessionId);
      }
    } catch (error) {
      console.error('Error fetching session details:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'active':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <ProtectedRoute>
      <div className={styles.container}>
        <Navigation />
        
        <div className={styles.content}>
          <div className={styles.header}>
            <h1>Interview Sessions</h1>
            <p>Review your past behavioral interview sessions</p>
          </div>

          <div className={styles.mainContent}>
            <div className={styles.sessionsList}>
              <h3>Your Sessions</h3>
              {loading ? (
                <div className={styles.loading}>Loading sessions...</div>
              ) : sessions.length > 0 ? (
                <div className={styles.sessionsGrid}>
                  {sessions.map((session) => (
                    <div 
                      key={session.session_id} 
                      className={`${styles.sessionCard} ${selectedSession === session.session_id ? styles.selected : ''}`}
                      onClick={() => fetchSessionDetails(session.session_id)}
                    >
                      <div className={styles.sessionHeader}>
                        <div className={styles.sessionInfo}>
                          <h4>Session #{session.session_id.slice(0, 8)}</h4>
                          <span 
                            className={styles.status}
                            style={{ backgroundColor: getStatusColor(session.status) }}
                          >
                            {session.status}
                          </span>
                        </div>
                        <div className={styles.sessionStats}>
                          <span>{session.completed_questions}/{session.total_questions} questions</span>
                          <span className={styles.score} style={{ color: getScoreColor(session.overall_score) }}>
                            {session.overall_score !== null && session.overall_score !== undefined ? session.overall_score : 'N/A'}
                          </span>
                          <button
                            className={styles.deleteButton}
                            title="Delete session"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (confirm('Are you sure you want to delete this session? This cannot be undone.')) {
                                await fetch('/api/behavioral-session/delete', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ sessionId: session.session_id })
                                });
                                fetchSessions();
                              }
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      
                      <div className={styles.sessionDetails}>
                        <div className={styles.categories}>
                          <strong>Categories:</strong>
                          <div className={styles.categoryTags}>
                            {session.categories.map((category, index) => (
                              <span key={index} className={styles.categoryTag}>
                                {category}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className={styles.sessionDate}>
                          <strong>Started:</strong> {formatDate(session.started_at)}
                        </div>
                        
                        {session.completed_at && (
                          <div className={styles.sessionDate}>
                            <strong>Completed:</strong> {formatDate(session.completed_at)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📝</div>
                  <h4>No sessions yet</h4>
                  <p>Start your first behavioral interview to see your sessions here!</p>
                  <Link href="/behavioral" className={styles.startButton}>
                    Start Interview
                  </Link>
                </div>
              )}
            </div>

            {sessionDetails && (
              <div className={styles.sessionDetailsPanel}>
                <div className={styles.detailsHeader}>
                  <h3>Session Details</h3>
                  <button 
                    onClick={() => setSelectedSession(null)}
                    className={styles.closeButton}
                  >
                    ✕
                  </button>
                </div>
                
                <div className={styles.detailsContent}>
                  <div className={styles.overallStats}>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>Overall Score</span>
                      <span 
                        className={styles.statValue}
                        style={{ color: getScoreColor(sessionDetails.session.overall_score || 0) }}
                      >
                        {sessionDetails.session.overall_score || 'N/A'}
                      </span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>Questions Completed</span>
                      <span className={styles.statValue}>
                        {sessionDetails.session.completed_questions}/{sessionDetails.session.total_questions}
                      </span>
                    </div>
                  </div>

                  {sessionDetails.session.overall_feedback && (
                    <div className={styles.feedback}>
                      <h4>Overall Feedback</h4>
                      <p>{sessionDetails.session.overall_feedback}</p>
                    </div>
                  )}

                  <div className={styles.qaSection}>
                    <h4>Question & Answer Transcript</h4>
                    <div className={styles.qaList}>
                      {sessionDetails.qa.map((item, index) => (
                        <div key={index} className={styles.qaItem}>
                          <div className={styles.question}>
                            <span className={styles.questionNumber}>Q{item.question_number}:</span>
                            <p>{item.question_text}</p>
                          </div>
                          
                          {item.user_response && (
                            <div className={styles.response}>
                              <strong>Your Response:</strong>
                              <p>{item.user_response}</p>
                            </div>
                          )}
                          
                          {item.ai_feedback && (
                            <div className={styles.feedback}>
                              <strong>AI Feedback:</strong>
                              <p>{item.ai_feedback}</p>
                            </div>
                          )}
                          
                          {item.score && (
                            <div className={styles.score}>
                              <strong>Score:</strong>
                              <span style={{ color: getScoreColor(item.score) }}>
                                {item.score}%
                              </span>
                            </div>
                          )}
                          
                          {item.follow_up_questions && item.follow_up_questions.length > 0 && (
                            <div className={styles.followUps}>
                              <strong>Follow-up Questions:</strong>
                              <ul>
                                {item.follow_up_questions.map((q, qIndex) => (
                                  <li key={qIndex}>{q}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {item.follow_up_responses && item.follow_up_responses.length > 0 && (
                            <div className={styles.followUpResponses}>
                              <strong>Follow-up Responses:</strong>
                              <ul>
                                {item.follow_up_responses.map((r, rIndex) => (
                                  <li key={rIndex}>{r}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 