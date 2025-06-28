import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <span>© {new Date().getFullYear()} InterviewPad. All rights reserved.</span>
        <span className={styles.footerLinks}>
          <a href="https://github.com/xpadyal/InterviewPad" target="_blank" rel="noopener noreferrer">GitHub</a>
          <span>·</span>
          <a href="/" >Home</a>
        </span>
      </div>
      <div className={styles.loveNote}>
        Made with <span style={{color: '#ef4444', fontSize: '1.1em', verticalAlign: 'middle'}}>❤️</span> by Sahil Padyal
      </div>
    </footer>
  );
} 