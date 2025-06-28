import { useState } from 'react';
import styles from './AssistantBar.module.css';

export function HintButton({ onHint, disabled }) {
  return (
    <button className={styles.hintButton} onClick={onHint} disabled={disabled} type="button">
      💡 Hint
    </button>
  );
}

export function CriticButton({ onCritique, disabled }) {
  return (
    <button className={styles.criticButton} onClick={onCritique} disabled={disabled} type="button">
      🧐 Code Critic
    </button>
  );
}

export function SolveButton({ onSolve, disabled }) {
  return (
    <button className={styles.completeButton} onClick={onSolve} disabled={disabled} type="button">
      🧩 Solve
    </button>
  );
} 