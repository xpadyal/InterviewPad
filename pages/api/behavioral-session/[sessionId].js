import { getBehavioralSession, getBehavioralSessionQA } from '../../../utils/database';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
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
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({ error: 'SessionId is required' });
    }

    // Get session and Q&A data
    const session = await getBehavioralSession(sessionId);
    const qa = await getBehavioralSessionQA(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.status(200).json({
      success: true,
      session,
      qa
    });

  } catch (error) {
    console.error('Get session error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
} 