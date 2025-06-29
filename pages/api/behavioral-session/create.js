import { createBehavioralSession } from '../../../utils/database';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

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
    const { categories, totalQuestions } = req.body;

    if (!categories || !totalQuestions) {
      return res.status(400).json({ error: 'Categories and totalQuestions are required' });
    }

    // Generate unique session ID
    const sessionId = uuidv4();

    // Create session
    await createBehavioralSession(decoded.userId, sessionId, categories, totalQuestions);

    res.status(201).json({
      success: true,
      sessionId,
      message: 'Behavioral session created successfully'
    });

  } catch (error) {
    console.error('Create session error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
} 