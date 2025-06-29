import sqlite3 from 'sqlite3';
import path from 'path';

let db = null;

export async function getDatabase() {
  if (db) {
    return db;
  }

  db = new sqlite3.Database(path.join(process.cwd(), 'interviewpad.db'));

  // Create tables if they don't exist
  await new Promise((resolve, reject) => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        session_data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        interview_type TEXT NOT NULL,
        question_id TEXT NOT NULL,
        response TEXT,
        score INTEGER,
        feedback TEXT,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS behavioral_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        session_id TEXT UNIQUE NOT NULL,
        categories TEXT NOT NULL,
        total_questions INTEGER DEFAULT 0,
        completed_questions INTEGER DEFAULT 0,
        overall_score INTEGER,
        overall_feedback TEXT,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        status TEXT DEFAULT 'active',
        FOREIGN KEY (user_id) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS behavioral_qa (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        question_number INTEGER NOT NULL,
        question_text TEXT NOT NULL,
        user_response TEXT,
        ai_feedback TEXT,
        score INTEGER,
        follow_up_questions TEXT,
        follow_up_responses TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES behavioral_sessions (session_id)
      );

      CREATE TABLE IF NOT EXISTS resumes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        filename TEXT NOT NULL,
        content TEXT NOT NULL,
        file_type TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  return db;
}

export async function createUser(email, password, name) {
  const db = await getDatabase();
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash(password, 10);
  
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name],
      function(err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            reject(new Error('User with this email already exists'));
          } else {
            reject(err);
          }
        } else {
          resolve({ id: this.lastID, email, name });
        }
      }
    );
  });
}

export async function findUserByEmail(email) {
  const db = await getDatabase();
  
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export async function findUserById(id) {
  const db = await getDatabase();
  
  return new Promise((resolve, reject) => {
    db.get('SELECT id, email, name, created_at FROM users WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export async function saveUserSession(userId, sessionData) {
  const db = await getDatabase();
  
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO user_sessions (user_id, session_data) VALUES (?, ?)',
      [userId, JSON.stringify(sessionData)],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

export async function getUserSessions(userId) {
  const db = await getDatabase();
  
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM user_sessions WHERE user_id = ? ORDER BY created_at DESC',
      [userId],
      (err, rows) => {
        if (err) reject(err);
        else {
          const sessions = rows.map(session => ({
            ...session,
            session_data: JSON.parse(session.session_data)
          }));
          resolve(sessions);
        }
      }
    );
  });
}

export async function saveUserProgress(userId, interviewType, questionId, response, score, feedback) {
  const db = await getDatabase();
  
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO user_progress (user_id, interview_type, question_id, response, score, feedback) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, interviewType, questionId, response, score, feedback],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

export async function getUserProgress(userId, interviewType = null) {
  const db = await getDatabase();
  
  return new Promise((resolve, reject) => {
    let query = 'SELECT * FROM user_progress WHERE user_id = ?';
    let params = [userId];
    
    if (interviewType) {
      query += ' AND interview_type = ?';
      params.push(interviewType);
    }
    
    query += ' ORDER BY completed_at DESC';
    
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// New functions for behavioral sessions
export async function createBehavioralSession(userId, sessionId, categories, totalQuestions) {
  const db = await getDatabase();
  
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO behavioral_sessions (user_id, session_id, categories, total_questions) VALUES (?, ?, ?, ?)',
      [userId, sessionId, JSON.stringify(categories), totalQuestions],
      function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, sessionId });
      }
    );
  });
}

export async function saveBehavioralQA(sessionId, questionNumber, questionText, userResponse, aiFeedback, score, followUpQuestions = null, followUpResponses = null) {
  const db = await getDatabase();
  
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO behavioral_qa (session_id, question_number, question_text, user_response, ai_feedback, score, follow_up_questions, follow_up_responses) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        sessionId, 
        questionNumber, 
        questionText, 
        userResponse, 
        aiFeedback, 
        score,
        followUpQuestions ? JSON.stringify(followUpQuestions) : null,
        followUpResponses ? JSON.stringify(followUpResponses) : null
      ],
      function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      }
    );
  });
}

export async function updateBehavioralSession(sessionId, completedQuestions, overallScore, overallFeedback, status = 'completed') {
  const db = await getDatabase();
  
  return new Promise((resolve, reject) => {
    const completedAt = status === 'completed' ? new Date().toISOString() : null;
    
    db.run(
      'UPDATE behavioral_sessions SET completed_questions = ?, overall_score = ?, overall_feedback = ?, status = ?, completed_at = ? WHERE session_id = ?',
      [completedQuestions, overallScore, overallFeedback, status, completedAt, sessionId],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

export async function getBehavioralSession(sessionId) {
  const db = await getDatabase();
  
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM behavioral_sessions WHERE session_id = ?',
      [sessionId],
      (err, session) => {
        if (err) reject(err);
        else if (session) {
          resolve({
            ...session,
            categories: JSON.parse(session.categories)
          });
        } else {
          resolve(null);
        }
      }
    );
  });
}

export async function getBehavioralSessionQA(sessionId) {
  const db = await getDatabase();
  
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM behavioral_qa WHERE session_id = ? ORDER BY question_number ASC',
      [sessionId],
      (err, rows) => {
        if (err) reject(err);
        else {
          const qa = rows.map(row => ({
            ...row,
            follow_up_questions: row.follow_up_questions ? JSON.parse(row.follow_up_questions) : null,
            follow_up_responses: row.follow_up_responses ? JSON.parse(row.follow_up_responses) : null
          }));
          resolve(qa);
        }
      }
    );
  });
}

export async function getUserBehavioralSessions(userId) {
  const db = await getDatabase();
  
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM behavioral_sessions WHERE user_id = ? ORDER BY started_at DESC',
      [userId],
      (err, rows) => {
        if (err) reject(err);
        else {
          const sessions = rows.map(session => ({
            ...session,
            categories: JSON.parse(session.categories)
          }));
          resolve(sessions);
        }
      }
    );
  });
}

// Resume management functions
export async function saveResume(userId, filename, content, fileType) {
  const db = await getDatabase();
  
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO resumes (user_id, filename, content, file_type) VALUES (?, ?, ?, ?)',
      [userId, filename, content, fileType],
      function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, filename });
      }
    );
  });
}

export async function getUserResumes(userId) {
  const db = await getDatabase();
  
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM resumes WHERE user_id = ? ORDER BY created_at DESC',
      [userId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
}

export async function getResumeById(resumeId, userId) {
  const db = await getDatabase();
  
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM resumes WHERE id = ? AND user_id = ?',
      [resumeId, userId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
}

export async function deleteResume(resumeId, userId) {
  const db = await getDatabase();
  
  return new Promise((resolve, reject) => {
    db.run(
      'DELETE FROM resumes WHERE id = ? AND user_id = ?',
      [resumeId, userId],
      function(err) {
        if (err) reject(err);
        else resolve({ deletedRows: this.changes });
      }
    );
  });
} 