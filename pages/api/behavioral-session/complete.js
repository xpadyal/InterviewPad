import { updateBehavioralSession } from '../../../utils/database';
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
    const { sessionId, completedQuestions, overallScore, overallFeedback } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'SessionId is required' });
    }

    // Update session
    await updateBehavioralSession(
      sessionId,
      completedQuestions,
      overallScore,
      overallFeedback,
      'completed'
    );

    res.status(200).json({
      success: true,
      message: 'Session completed successfully'
    });

  } catch (error) {
    console.error('Complete session error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
} 