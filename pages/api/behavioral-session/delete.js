import { deleteBehavioralSession } from '../../../utils/database';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'SessionId is required' });
    }
    const result = await deleteBehavioralSession(sessionId, decoded.userId);
    if (result === 0) {
      return res.status(404).json({ error: 'Session not found or not owned by user' });
    }
    res.status(200).json({ success: true, message: 'Session deleted successfully' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 