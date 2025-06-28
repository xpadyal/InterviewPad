import styles from './Modal.module.css';
import { useEffect, useRef } from 'react';

export default function Modal({ open, onClose, title, children }) {
  const contentRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open && contentRef.current) {
      contentRef.current.focus();
    }
  }, [open]);

  if (!open) return null;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        tabIndex={-1}
        ref={contentRef}
        onClick={e => e.stopPropagation()}
        aria-modal="true"
        role="dialog"
      >
        <div className={styles.modalHeader}>
          <span>{title}</span>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close modal">×</button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
} 