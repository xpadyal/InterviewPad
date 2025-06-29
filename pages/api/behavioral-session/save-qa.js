import { saveBehavioralQA } from '../../../utils/database';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get token from cookie
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    const { 
      sessionId, 
      questionNumber, 
      questionText, 
      userResponse, 
      aiFeedback, 
      score, 
      followUpQuestions, 
      followUpResponses 
    } = req.body;

    if (!sessionId || !questionNumber || !questionText) {
      return res.status(400).json({ error: 'SessionId, questionNumber, and questionText are required' });
    }

    // Save Q&A
    await saveBehavioralQA(
      sessionId,
      questionNumber,
      questionText,
      userResponse,
      aiFeedback,
      score,
      followUpQuestions,
      followUpResponses
    );

    res.status(200).json({
      success: true,
      message: 'Q&A saved successfully'
    });

  } catch (error) {
    console.error('Save Q&A error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
} 