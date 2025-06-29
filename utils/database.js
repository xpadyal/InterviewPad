import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}

// User functions
export async function createUser(email, password, name) {
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await query(
    'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name',
    [email, hashedPassword, name]
  );
  return result.rows[0];
}

export async function findUserByEmail(email) {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

export async function findUserById(id) {
  const result = await query('SELECT id, email, name, created_at FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

// Add other functions (sessions, progress, resumes, behavioral_sessions, etc.) as needed, using the same pattern.

export async function saveUserSession(userId, sessionData) {
  const result = await query(
    'INSERT INTO user_sessions (user_id, session_data) VALUES ($1, $2) RETURNING id',
    [userId, JSON.stringify(sessionData)]
  );
  return result.rows[0].id;
}

export async function getUserSessions(userId) {
  const result = await query('SELECT * FROM user_sessions WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  return result.rows.map(session => ({
    ...session,
    session_data: JSON.parse(session.session_data)
  }));
}

export async function saveUserProgress(userId, interviewType, questionId, response, score, feedback) {
  const result = await query(
    'INSERT INTO user_progress (user_id, interview_type, question_id, response, score, feedback) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
    [userId, interviewType, questionId, response, score, feedback]
  );
  return result.rows[0].id;
}

export async function getUserProgress(userId, interviewType = null) {
  let query = 'SELECT * FROM user_progress WHERE user_id = $1';
  let params = [userId];
  
  if (interviewType) {
    query += ' AND interview_type = $2';
    params.push(interviewType);
  }
  
  query += ' ORDER BY completed_at DESC';
  
  const result = await query(query, params);
  return result.rows;
}

// New functions for behavioral sessions
export async function createBehavioralSession(userId, sessionId, categories, totalQuestions) {
  const result = await query(
    'INSERT INTO behavioral_sessions (user_id, session_id, categories, total_questions) VALUES ($1, $2, $3, $4) RETURNING id, session_id',
    [userId, sessionId, JSON.stringify(categories), totalQuestions]
  );
  return result.rows[0];
}

export async function saveBehavioralQA(sessionId, questionNumber, questionText, userResponse, aiFeedback, score, followUpQuestions = null, followUpResponses = null) {
  const result = await query(
    'INSERT INTO behavioral_qa (session_id, question_number, question_text, user_response, ai_feedback, score, follow_up_questions, follow_up_responses) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
    [
      sessionId, 
      questionNumber, 
      questionText, 
      userResponse, 
      aiFeedback, 
      score,
      followUpQuestions ? JSON.stringify(followUpQuestions) : null,
      followUpResponses ? JSON.stringify(followUpResponses) : null
    ]
  );
  return result.rows[0].id;
}

export async function updateBehavioralSession(sessionId, completedQuestions, overallScore, overallFeedback, status = 'completed') {
  const completedAt = status === 'completed' ? new Date().toISOString() : null;
  
  const result = await query(
    'UPDATE behavioral_sessions SET completed_questions = $1, overall_score = $2, overall_feedback = $3, status = $4, completed_at = $5 WHERE session_id = $6 RETURNING id',
    [completedQuestions, overallScore, overallFeedback, status, completedAt, sessionId]
  );
  return result.rows[0].id;
}

export async function getBehavioralSession(sessionId) {
  const result = await query('SELECT * FROM behavioral_sessions WHERE session_id = $1', [sessionId]);
  if (result.rows.length > 0) {
    const session = result.rows[0];
    return {
      ...session,
      categories: session.categories
    };
  }
  return null;
}

export async function getBehavioralSessionQA(sessionId) {
  const result = await query('SELECT * FROM behavioral_qa WHERE session_id = $1 ORDER BY question_number ASC', [sessionId]);
  const qa = result.rows.map(row => ({
    ...row,
    follow_up_questions: row.follow_up_questions,
    follow_up_responses: row.follow_up_responses
  }));
  return qa;
}

export async function getUserBehavioralSessions(userId) {
  const result = await query('SELECT * FROM behavioral_sessions WHERE user_id = $1 ORDER BY started_at DESC', [userId]);
  const sessions = result.rows.map(session => ({
    ...session,
    categories: session.categories
  }));
  return sessions;
}

// Resume management functions
export async function saveResume(userId, filename, content, fileType) {
  const result = await query(
    'INSERT INTO resumes (user_id, filename, content, file_type) VALUES ($1, $2, $3, $4) RETURNING id, filename',
    [userId, filename, content, fileType]
  );
  return result.rows[0];
}

export async function getUserResumes(userId) {
  const result = await query('SELECT * FROM resumes WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  return result.rows;
}

export async function getResumeById(resumeId, userId) {
  const result = await query('SELECT * FROM resumes WHERE id = $1 AND user_id = $2', [resumeId, userId]);
  return result.rows[0];
}

export async function deleteResume(resumeId, userId) {
  const result = await query('DELETE FROM resumes WHERE id = $1 AND user_id = $2 RETURNING id', [resumeId, userId]);
  return result.rows.length; // returns number of deleted rows
}

export async function deleteBehavioralSession(sessionId, userId) {
  await query('DELETE FROM behavioral_qa WHERE session_id = $1', [sessionId]);
  const result = await query('DELETE FROM behavioral_sessions WHERE session_id = $1 AND user_id = $2 RETURNING id', [sessionId, userId]);
  return result.rows.length;
} 