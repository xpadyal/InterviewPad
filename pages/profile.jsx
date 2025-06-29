import { useState, useEffect } from 'react';
import { useAuth } from '../utils/auth';
import ProtectedRoute from '../components/ProtectedRoute';
import Navigation from '../components/Navigation';
import styles from './Profile.module.css';

export default function Profile() {
  const { user } = useAuth();
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    codingQuestions: 0,
    behavioralQuestions: 0,
    averageScore: 0
  });

  useEffect(() => {
    fetchUserProgress();
  }, []);

  const fetchUserProgress = async () => {
    try {
      const response = await fetch('/api/user/progress');
      if (response.ok) {
        const data = await response.json();
        setProgress(data.progress);
        
        // Calculate stats
        const total = data.progress.length;
        const coding = data.progress.filter(p => p.interview_type === 'coding').length;
        const behavioral = data.progress.filter(p => p.interview_type === 'behavioral').length;
        const avgScore = total > 0 
          ? Math.round(data.progress.reduce((sum, p) => sum + (p.score || 0), 0) / total)
          : 0;

        setStats({
          totalQuestions: total,
          codingQuestions: coding,
          behavioralQuestions: behavioral,
          averageScore: avgScore
        });
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
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

  return (
    <ProtectedRoute>
      <div className={styles.container}>
        <Navigation />
        
        <div className={styles.content}>
          <div className={styles.header}>
            <h1>Profile</h1>
            <p>Your interview preparation journey</p>
          </div>

          <div className={styles.profileSection}>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>
                <span>👤</span>
              </div>
              <div className={styles.userDetails}>
                <h2>{user?.name}</h2>
                <p>{user?.email}</p>
                <span className={styles.memberSince}>
                  Member since {user?.created_at ? formatDate(user.created_at) : 'Recently'}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.statsSection}>
            <h3>Your Statistics</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>📊</div>
                <div className={styles.statContent}>
                  <span className={styles.statNumber}>{stats.totalQuestions}</span>
                  <span className={styles.statLabel}>Total Questions</span>
                </div>
              </div>
              
              <div className={styles.statCard}>
                <div className={styles.statIcon}>💻</div>
                <div className={styles.statContent}>
                  <span className={styles.statNumber}>{stats.codingQuestions}</span>
                  <span className={styles.statLabel}>Coding Questions</span>
                </div>
              </div>
              
              <div className={styles.statCard}>
                <div className={styles.statIcon}>🎯</div>
                <div className={styles.statContent}>
                  <span className={styles.statNumber}>{stats.behavioralQuestions}</span>
                  <span className={styles.statLabel}>Behavioral Questions</span>
                </div>
              </div>
              
              <div className={styles.statCard}>
                <div className={styles.statIcon}>⭐</div>
                <div className={styles.statContent}>
                  <span className={styles.statNumber}>{stats.averageScore}%</span>
                  <span className={styles.statLabel}>Average Score</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.recentActivity}>
            <h3>Recent Activity</h3>
            {loading ? (
              <div className={styles.loading}>Loading your progress...</div>
            ) : progress.length > 0 ? (
              <div className={styles.activityList}>
                {progress.slice(0, 10).map((item, index) => (
                  <div key={index} className={styles.activityItem}>
                    <div className={styles.activityIcon}>
                      {item.interview_type === 'coding' ? '💻' : '🎯'}
                    </div>
                    <div className={styles.activityContent}>
                      <div className={styles.activityTitle}>
                        {item.interview_type === 'coding' ? 'Coding Question' : 'Behavioral Question'}
                      </div>
                      <div className={styles.activityDetails}>
                        <span className={styles.questionId}>Question ID: {item.question_id}</span>
                        {item.score && (
                          <span className={styles.score}>Score: {item.score}%</span>
                        )}
                      </div>
                      <div className={styles.activityDate}>
                        {formatDate(item.completed_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📝</div>
                <h4>No activity yet</h4>
                <p>Start practicing to see your progress here!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 