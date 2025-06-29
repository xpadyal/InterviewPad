import { getUserResumes, saveResume, deleteResume } from '../../../utils/database';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req, res) {
  try {
    // Verify authentication
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const userId = decoded.userId;

    switch (req.method) {
      case 'GET':
        // Get user's resumes
        const resumes = await getUserResumes(userId);
        res.status(200).json({ resumes });
        break;

      case 'POST':
        // Save new resume
        const { filename, content, fileType } = req.body;
        
        if (!filename || !content || !fileType) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const savedResume = await saveResume(userId, filename, content, fileType);
        res.status(201).json({ 
          message: 'Resume saved successfully',
          resume: savedResume 
        });
        break;

      case 'DELETE':
        // Delete resume
        const { resumeId } = req.body;
        
        if (!resumeId) {
          return res.status(400).json({ error: 'Resume ID required' });
        }

        const result = await deleteResume(resumeId, userId);
        if (result === 0) {
          return res.status(404).json({ error: 'Resume not found' });
        }

        res.status(200).json({ message: 'Resume deleted successfully' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Resume API error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
} 