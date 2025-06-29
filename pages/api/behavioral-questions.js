import { generateTextGroq } from '../../utils/groq';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { categories, count, role, experience, industry } = req.body;

    console.log('Received request:', { categories, count, role, experience, industry });

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ error: 'Categories are required' });
    }

    if (!count || count < 1 || count > 15) {
      return res.status(400).json({ error: 'Count must be between 1 and 15' });
    }

    // Category to question type mapping
    const categoryMappings = {
      leadership: 'leadership and team management',
      conflict: 'conflict resolution and difficult situations',
      'problem-solving': 'problem-solving and analytical thinking',
      communication: 'communication and presentation skills',
      adaptability: 'adaptability and learning new skills',
      teamwork: 'teamwork and collaboration',
      stress: 'stress management and working under pressure',
      initiative: 'initiative and taking ownership',
      resume: 'resume-based questions'
    };

    const selectedCategories = categories.map(cat => categoryMappings[cat] || cat);
    console.log('Selected categories:', selectedCategories);

    // Generate questions using Groq
    let context = '';
    if (role) context += `Role: ${role}. `;
    if (experience) context += `Experience: ${experience} years. `;
    if (industry) context += `Industry: ${industry}. `;

    const prompt = `${context}Generate ${count} behavioral interview questions covering these areas: ${selectedCategories.join(', ')}.

Each question should be:
- Specific and actionable
- Relevant to professional work experience
- Designed to elicit detailed responses using the STAR method
- Varied in difficulty and scope
- Realistic and commonly asked in interviews

Format as a JSON array of strings, where each string is a question.

Example format:
[
  "Tell me about a time when you had to lead a team through a difficult project. What was the situation, and how did you handle it?",
  "Describe a situation where you had to resolve a conflict between team members. What steps did you take?",
  "Give me an example of a time when you had to solve a complex problem with limited resources."
]`;

    const response = await generateTextGroq(prompt, 1000);
    console.log('Generated response:', response);

    // Try to parse JSON from the response
    let questions;
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON found, split by lines and clean up
        const lines = response.split('\n').filter(line => line.trim());
        questions = lines
          .map(line => line.replace(/^\d+\.\s*/, '').replace(/^["']|["']$/g, ''))
          .filter(line => line.length > 10 && line.includes('?'))
          .slice(0, count);
      }
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      // Fallback: return the raw response split into questions
      questions = response.split('\n')
        .filter(line => line.trim() && line.includes('?'))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, count);
    }

    console.log('Parsed questions:', questions);

    // Ensure we have the right number of questions
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Failed to generate valid questions');
    }

    // Limit to requested count
    const finalQuestions = questions.slice(0, count);

    res.status(200).json({ questions: finalQuestions });
  } catch (error) {
    console.error('Error generating behavioral questions:', error);
    res.status(500).json({ 
      error: 'Failed to generate questions',
      details: error.message 
    });
  }
} 