import dynamic from 'next/dynamic';
import { useState, useEffect, useRef } from 'react';
import styles from './Editor.module.css';
import { HintButton, CriticButton, SolveButton } from './AssistantBar';
import QuestionPanel from './QuestionPanel';
import Modal from './Modal';
import Navigation from './components/Navigation';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import Footer from './components/Footer';

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

// Language configurations
const languages = [
  { id: 71, name: 'Python 3', extension: 'py', icon: '🐍' },
  { id: 54, name: 'C++', extension: 'cpp', icon: '⚡' },
  { id: 50, name: 'C', extension: 'c', icon: '🔧' },
  { id: 62, name: 'Java', extension: 'java', icon: '☕' },
  { id: 63, name: 'JavaScript', extension: 'js', icon: '🟨' },
  { id: 51, name: 'C#', extension: 'cs', icon: '💜' },
  { id: 72, name: 'Ruby', extension: 'rb', icon: '💎' },
  { id: 73, name: 'Go', extension: 'go', icon: '🔵' },
];

// Default code templates
const codeTemplates = {
  71: `# Python 3
print("Hello, World!")

# Calculate fibonacci
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(f"Fibonacci of 10: {fibonacci(10)}")`,
  54: `// C++
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    
    // Calculate sum
    int sum = 0;
    for(int i = 1; i <= 10; i++) {
        sum += i;
    }
    cout << "Sum of 1 to 10: " << sum << endl;
    return 0;
}`,
  50: `// C
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    
    // Calculate factorial
    int n = 5, fact = 1;
    for(int i = 1; i <= n; i++) {
        fact *= i;
    }
    printf("Factorial of %d: %d\\n", n, fact);
    return 0;
}`,
  62: `// Java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Calculate power
        int base = 2, exponent = 8;
        long result = (long) Math.pow(base, exponent);
        System.out.println(base + "^" + exponent + " = " + result);
    }
}`,
  63: `// JavaScript
console.log("Hello, World!");

// Calculate factorial
function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

console.log("Factorial of 5:", factorial(5));`,
  51: `// C#
using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, World!");
        
        // Calculate prime numbers
        for(int i = 2; i <= 20; i++) {
            if(IsPrime(i)) {
                Console.WriteLine($"{i} is prime");
            }
        }
    }
    
    static bool IsPrime(int n) {
        if(n < 2) return false;
        for(int i = 2; i <= Math.Sqrt(n); i++) {
            if(n % i == 0) return false;
        }
        return true;
    }
}`,
  72: `# Ruby
puts "Hello, World!"

# Calculate fibonacci
def fibonacci(n)
  return n if n <= 1
  fibonacci(n-1) + fibonacci(n-2)
end

puts "Fibonacci of 10: #{fibonacci(10)}"`,
  73: `// Go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
    
    // Calculate fibonacci
    fmt.Printf("Fibonacci of 10: %d\\n", fibonacci(10))
}

func fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}`,
};

export default function CodeEditor() {
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [code, setCode] = useState(codeTemplates[71]);
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [hint, setHint] = useState('');
  const [hintLoading, setHintLoading] = useState(false);
  const [critique, setCritique] = useState('');
  const [critiqueLoading, setCritiqueLoading] = useState(false);
  const [solveLoading, setSolveLoading] = useState(false);
  const [question, setQuestion] = useState(null);
  const [difficulty, setDifficulty] = useState('easy');
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'hint' or 'critique'
  const [editorHeight, setEditorHeight] = useState(350);
  const dragRef = useRef(null);
  const isDraggingRef = useRef(false);
  const [questionPanelWidth, setQuestionPanelWidth] = useState(380); // px, default width
  const splitterRef = useRef(null);
  const isSplitterDragging = useRef(false);
  const [testTab, setTestTab] = useState('output'); // 'output' or 'testcase'
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [testRunning, setTestRunning] = useState(false);
  // Leetcode-style test cases
  const [testCases, setTestCases] = useState([
    { input: '', expectedOutput: '', actualOutput: '', passed: null, id: Date.now() }
  ]);
  const [testCasesRunning, setTestCasesRunning] = useState(false);
  const [questionLoading, setQuestionLoading] = useState(false);

  const handleLanguageChange = (e) => {
    const lang = languages.find(l => l.id === Number(e.target.value));
    setSelectedLanguage(lang);
    setCode(codeTemplates[lang.id] || '');
    setOutput('');
  };

  async function runCode() {
    setRunning(true);
    setOutput('Running...');

    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code,
          languageId: selectedLanguage.id 
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
      
      const result = await res.json();
      
      if (result.error) {
        setOutput(`Error: ${result.error}`);
      } else {
        setOutput(result.stdout || result.stderr || result.compile_output || 'No output');
      }
    } catch (err) {
      console.error('Execution error:', err);
      setOutput(`Error: ${err.message}`);
    } finally {
      setRunning(false);
    }
  }

  const clearOutput = () => {
    setOutput('');
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'bright' : 'dark');

  const handleHint = async () => {
    setHintLoading(true);
    setHint('');
    setModalType('hint');
    setModalOpen(true);
    try {
      const res = await fetch('/api/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, question }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setHint(data.hint || 'No hint available.');
    } catch (err) {
      setHint('Failed to fetch hint.');
    } finally {
      setHintLoading(false);
    }
  };

  const handleCritique = async () => {
    setCritiqueLoading(true);
    setCritique('');
    setModalType('critique');
    setModalOpen(true);
    try {
      const res = await fetch('/api/critic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, question }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setCritique(data.critique || 'No critique available.');
    } catch (err) {
      setCritique('Failed to fetch critique.');
    } finally {
      setCritiqueLoading(false);
    }
  };

  const handleSolve = async () => {
    setSolveLoading(true);
    try {
      const res = await fetch('/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, languageId: selectedLanguage.id, question }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setCode(data.solution || '');
    } catch (err) {
      // Optionally show an error message
    } finally {
      setSolveLoading(false);
    }
  };

  // Timer logic
  useEffect(() => {
    if (interviewStarted) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [interviewStarted]);

  const handleStartInterview = async () => {
    setInterviewStarted(false);
    setTimer(0);
    setQuestion(null);
    setCode('');
    setOutput('');
    setHint('');
    setCritique('');
    setSolveLoading(false);
    setHintLoading(false);
    setCritiqueLoading(false);
    setQuestionLoading(true);
    try {
      const res = await fetch('/api/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty }),
      });
      if (!res.ok) throw new Error('Failed to fetch question');
      const data = await res.json();
      setQuestion(data.question);
      setInterviewStarted(true);
      setTimer(0);
      setCode('');
      // Pre-fill test cases from examples
      if (data.question.examples && data.question.examples.length > 0) {
        setTestCases(
          data.question.examples.slice(0, 2).map((ex, i) => ({
            input: ex.input,
            expectedOutput: ex.output,
            actualOutput: '',
            passed: null,
            id: Date.now() + i,
          }))
        );
      } else {
        setTestCases([{ input: '', expectedOutput: '', actualOutput: '', passed: null, id: Date.now() }]);
      }
    } catch (err) {
      setQuestion({ title: 'Error', description: 'Could not fetch question.' });
    } finally {
      setQuestionLoading(false);
    }
  };

  const formatTime = (t) => {
    const m = Math.floor(t / 60).toString().padStart(2, '0');
    const s = (t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const closeModal = () => setModalOpen(false);

  const handleStopTimer = () => {
    setInterviewStarted(false);
  };

  // Resizing logic
  useEffect(() => {
    function onMouseMove(e) {
      if (!isDraggingRef.current) return;
      const rect = dragRef.current.parentElement.getBoundingClientRect();
      let newHeight = e.clientY - rect.top;
      newHeight = Math.max(200, Math.min(newHeight, window.innerHeight * 0.8));
      setEditorHeight(newHeight);
    }
    function onMouseUp() {
      isDraggingRef.current = false;
      document.body.style.cursor = '';
    }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const startDrag = () => {
    isDraggingRef.current = true;
    document.body.style.cursor = 'ns-resize';
  };

  // Splitter drag logic
  useEffect(() => {
    function onMouseMove(e) {
      if (!isSplitterDragging.current) return;
      // Calculate new width for question panel
      const minWidth = 220;
      const maxWidth = 600;
      let newWidth = e.clientX - document.querySelector(`.${styles.leetcodeLayout}`).getBoundingClientRect().left;
      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      setQuestionPanelWidth(newWidth);
    }
    function onMouseUp() {
      isSplitterDragging.current = false;
      document.body.style.cursor = '';
    }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);
  const startSplitterDrag = () => {
    isSplitterDragging.current = true;
    document.body.style.cursor = 'ew-resize';
  };

  async function runTestCase() {
    setTestRunning(true);
    setTestOutput('Running...');
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          languageId: selectedLanguage.id,
          stdin: testInput,
        }),
      });
      const result = await res.json();
      setTestOutput(result.stdout || result.stderr || result.compile_output || 'No output');
    } catch (err) {
      setTestOutput('Error running test case');
    } finally {
      setTestRunning(false);
    }
  }

  // Handlers for test case table
  const handleTestCaseChange = (idx, field, value) => {
    setTestCases(tc => tc.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  };
  const handleAddTestCase = () => {
    setTestCases(tc => [...tc, { input: '', expectedOutput: '', actualOutput: '', passed: null, id: Date.now() + Math.random() }]);
  };
  const handleRemoveTestCase = (idx) => {
    setTestCases(tc => tc.length === 1 ? tc : tc.filter((_, i) => i !== idx));
  };

  const runAllTestCases = async () => {
    setTestCasesRunning(true);
    setTestCases(tc => tc.map(t => ({ ...t, passed: null, actualOutput: '' })));
    try {
      const res = await fetch('/api/testcases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          languageId: selectedLanguage.id,
          testCases: testCases.map(({ input, expectedOutput }) => ({ input, expectedOutput })),
        }),
      });
      const data = await res.json();
      if (data.results) {
        setTestCases(tc => tc.map((t, i) => ({ ...t, actualOutput: data.results[i]?.actualOutput ?? '', passed: data.results[i]?.passed ?? null })));
      } else {
        setTestCases(tc => tc.map(t => ({ ...t, actualOutput: data.error || 'Error', passed: false })));
      }
    } catch (err) {
      setTestCases(tc => tc.map(t => ({ ...t, actualOutput: 'Error running test', passed: false })));
    } finally {
      setTestCasesRunning(false);
    }
  };

  // Add this reset handler
  const handleReset = () => {
    setCode('');
    setOutput('');
    setTestInput('');
    setTestOutput('');
    setTestCases([{ input: '', expectedOutput: '', actualOutput: '', passed: null, id: Date.now() }]);
    setHint('');
    setCritique('');
    setSolveLoading(false);
    setHintLoading(false);
    setCritiqueLoading(false);
    setInterviewStarted(false);
    setTimer(0);
    setModalOpen(false);
    setModalType('');
    setQuestion(null);
    setDifficulty('easy');
  };

  return (
    <div className={styles.container}>
      <Navigation />
      
      <div className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>Coding Interview</h1>
          <div className={styles.headerControls}>
            <div className={styles.languageSelector}>
              <select
                value={selectedLanguage.id}
                onChange={handleLanguageChange}
                className={styles.select}
              >
                {languages.map(lang => (
                  <option key={lang.id} value={lang.id}>{lang.icon} {lang.name}</option>
                ))}
              </select>
            </div>
            <div className={styles.themeToggle}>
              <button className={styles.themeButton} onClick={toggleTheme}>
                {theme === 'dark' ? '🌙' : '☀️'}
              </button>
            </div>
            <div className={styles.timer}>
              ⏱️ {formatTime(timer)}
            </div>
          </div>
        </header>

        {/* Interview Controls Bar */}
        <div className={styles.interviewControls}>
          <div className={styles.interviewSettings}>
            <select 
              value={difficulty} 
              onChange={e => setDifficulty(e.target.value)} 
              disabled={interviewStarted}
              className={styles.difficultySelect}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <button 
              onClick={handleStartInterview} 
              disabled={interviewStarted}
              className={styles.startButton}
            >
              {interviewStarted ? 'Interview Started' : 'Start Interview'}
            </button>
            <button 
              onClick={handleStopTimer} 
              disabled={!interviewStarted}
              className={styles.stopButton}
            >
              Stop Timer
            </button>
          </div>
        </div>

        <div className={styles.leetcodeLayout}>
          <div className={styles.leetcodeQuestionCol} style={{ width: questionPanelWidth, minWidth: 180, maxWidth: 600, transition: isSplitterDragging.current ? 'none' : 'width 0.18s' }}>
            <QuestionPanel question={question} questionLoading={questionLoading} />
          </div>
          {/* Splitter bar */}
          <div
            className={styles.splitter}
            ref={splitterRef}
            onMouseDown={startSplitterDrag}
            title="Drag to resize panels"
          >
            <span style={{ width: 6, height: 36, background: '#fff', opacity: 0.7, borderRadius: 4, display: 'block', margin: '0 auto' }} />
          </div>
          <div className={styles.leetcodeCodeCol} style={{ minWidth: 0, flex: 1 }}>
            <div className={styles.panelHeader}>
              <span className={styles.languageName}>{selectedLanguage.name}</span>
              <div className={styles.editorControls}>
                <HintButton onHint={handleHint} disabled={hintLoading} />
                <CriticButton onCritique={handleCritique} disabled={critiqueLoading} />
                <SolveButton onSolve={handleSolve} disabled={solveLoading} />
                <button
                  className={styles.runButton}
                  onClick={runCode}
                  disabled={running}
                >
                  {running ? (
                    <LoadingSpinner size="small" text="Running..." />
                  ) : (
                    'Run Code'
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className={styles.resetButton}
                  title="Reset session"
                >
                  Reset
                </button>
              </div>
            </div>
            <Modal open={modalOpen} onClose={closeModal} title={modalType === 'hint' ? '💡 Hint' : modalType === 'critique' ? '🧐 Critique' : ''}>
              {(modalType === 'hint' && hintLoading) && <LoadingSpinner text="Loading hint..." />}
              {(modalType === 'critique' && critiqueLoading) && <LoadingSpinner text="Loading critique..." />}
              {(modalType === 'hint' && !hintLoading) && <span>{hint}</span>}
              {(modalType === 'critique' && !critiqueLoading) && <span>{critique}</span>}
            </Modal>
            <div className={styles.resizableEditor} style={{ height: editorHeight }}>
              <div className={styles.editorContainer} style={{ height: '100%' }}>
                <MonacoEditor
                  height="100%"
                  language={selectedLanguage.extension}
                  theme={theme === 'dark' ? 'vs-dark' : 'light'}
                  value={code}
                  onChange={value => setCode(value || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: 'JetBrains Mono, Consolas, monospace',
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: true,
                    automaticLayout: true,
                    wordWrap: 'on',
                    bracketPairColorization: { enabled: true },
                    guides: { bracketPairs: true },
                    scrollbar: {
                      vertical: 'visible',
                      horizontal: 'visible',
                      verticalScrollbarSize: 14,
                      horizontalScrollbarSize: 14,
                      useShadows: false
                    },
                    mouseWheelScrollSensitivity: 1,
                    fastScrollSensitivity: 5,
                    cursorBlinking: 'blink',
                    cursorSmoothCaretAnimation: 'on',
                    smoothScrolling: true
                  }}
                />
              </div>
              <div
                className={styles.dragHandle}
                ref={dragRef}
                onMouseDown={startDrag}
                title="Drag to resize editor"
              >
                <span className={styles.dragHandleBar} />
              </div>
            </div>
            <div className={styles.leetcodeOutputPanel}>
              <div className={styles.outputTabs}>
                <button
                  className={`${styles.outputTab} ${testTab === 'output' ? styles.outputTabActive : ''}`}
                  onClick={() => setTestTab('output')}
                  type="button"
                >
                  Output
                </button>
                <button
                  className={`${styles.outputTab} ${testTab === 'testcase' ? styles.outputTabActive : ''}`}
                  onClick={() => setTestTab('testcase')}
                  type="button"
                >
                  Test Case
                  <span className={styles.betaBadge}>Beta</span>
                </button>
              </div>
              {testTab === 'output' && (
                <div className={styles.outputContent}>
                  <div className={styles.outputHeader}>Output</div>
                  {output || <span className={styles.outputPlaceholder}>// Output will appear here...</span>}
                </div>
              )}
              {testTab === 'testcase' && (
                <div className={styles.testCaseContent}>
                  <div className={styles.outputHeader}>Test Case</div>
                  <div className={styles.testCaseTable}>
                    <table className={styles.testCaseTableInner}>
                      <thead>
                        <tr>
                          <th>Input</th>
                          <th>Expected Output</th>
                          <th>Result</th>
                          <th>Actual Output</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {testCases.map((tc, idx) => (
                          <tr key={tc.id}>
                            <td>
                              <input
                                type="text"
                                value={typeof tc.input === 'string' ? tc.input : JSON.stringify(tc.input)}
                                onChange={e => handleTestCaseChange(idx, 'input', e.target.value)}
                                placeholder="e.g. 12345"
                                className={styles.testCaseInput}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={tc.expectedOutput}
                                onChange={e => handleTestCaseChange(idx, 'expectedOutput', e.target.value)}
                                placeholder="e.g. 15"
                                className={styles.testCaseInput}
                              />
                            </td>
                            <td className={styles.testCaseResult}>
                              {tc.passed === null ? '' : tc.passed ? <span className={styles.passIcon}>✅</span> : <span className={styles.failIcon}>❌</span>}
                            </td>
                            <td className={`${styles.testCaseOutput} ${tc.passed === false ? styles.testCaseOutputFail : ''}`}>
                              {JSON.stringify(tc.actualOutput)}
                            </td>
                            <td>
                              <button
                                onClick={() => handleRemoveTestCase(idx)}
                                disabled={testCases.length === 1}
                                className={styles.removeTestCaseButton}
                                title="Remove test case"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className={styles.testCaseActions}>
                      <button
                        onClick={handleAddTestCase}
                        className={styles.addTestCaseButton}
                      >
                        + Add Test Case
                      </button>
                      <button
                        onClick={runAllTestCases}
                        disabled={testCasesRunning}
                        className={styles.runAllButton}
                      >
                        {testCasesRunning ? (
                          <LoadingSpinner size="small" text="Running..." />
                        ) : (
                          'Run All'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 