import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { categories, count } = req.body;

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
      initiative: 'initiative and taking ownership'
    };

    const selectedCategories = categories.map(cat => categoryMappings[cat] || cat).join(', ');

    const prompt = `Generate ${count} behavioral interview questions covering these areas: ${selectedCategories}.

Each question should be:
- Specific and actionable
- Relevant to professional work experience
- Designed to elicit detailed responses using the STAR method
- Varied in difficulty and scope
- Realistic and commonly asked in interviews

Format the response as a JSON array of strings, where each string is a question.

Example format:
[
  "Tell me about a time when you had to lead a team through a difficult project. What was the situation, and how did you handle it?",
  "Describe a situation where you had to resolve a conflict between team members. What steps did you take?",
  "Give me an example of a time when you had to solve a complex problem with limited resources."
]`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert HR professional and interview coach. Generate high-quality behavioral interview questions that help assess candidates' real-world experience and competencies."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0].message.content;
    
    // Parse the JSON response
    let questions;
    try {
      questions = JSON.parse(response);
    } catch (parseError) {
      // If JSON parsing fails, try to extract questions from the response
      const lines = response.split('\n').filter(line => line.trim());
      questions = lines
        .map(line => line.replace(/^\d+\.\s*/, '').replace(/^["']|["']$/g, ''))
        .filter(line => line.length > 10);
    }

    // Ensure we have the right number of questions
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Failed to generate valid questions');
    }

    // Limit to requested count
    questions = questions.slice(0, count);

    res.status(200).json({ questions });
  } catch (error) {
    console.error('Error generating behavioral questions:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
} 