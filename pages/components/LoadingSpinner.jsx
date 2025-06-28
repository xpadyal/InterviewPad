import styles from './LoadingSpinner.module.css';

export default function LoadingSpinner({ 
  size = 'medium', 
  color = 'primary', 
  text = 'Loading...',
  showText = true 
}) {
  return (
    <div className={styles.loadingContainer}>
      <div className={`${styles.spinner} ${styles[size]} ${styles[color]}`}>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
      </div>
      {showText && text && (
        <p className={styles.loadingText}>{text}</p>
      )}
    </div>
  );
} 