import { useState } from 'react';
import styles from './ErrorMessage.module.css';

export default function ErrorMessage({ 
  error, 
  onRetry, 
  onDismiss,
  showRetry = true,
  showDismiss = true 
}) {
  const [isVisible, setIsVisible] = useState(true);

  if (!error || !isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const handleRetry = () => {
    onRetry?.();
  };

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorIcon}>⚠️</div>
      <div className={styles.errorContent}>
        <h4 className={styles.errorTitle}>Something went wrong</h4>
        <p className={styles.errorMessage}>{error}</p>
        <div className={styles.errorActions}>
          {showRetry && onRetry && (
            <button 
              onClick={handleRetry}
              className={styles.retryButton}
            >
              Try Again
            </button>
          )}
          {showDismiss && (
            <button 
              onClick={handleDismiss}
              className={styles.dismissButton}
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 