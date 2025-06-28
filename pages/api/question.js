import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const DIFFICULTY_MAP = {
  easy: 'easy',
  medium: 'medium',
  hard: 'hard',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { difficulty } = req.body;
  const level = DIFFICULTY_MAP[(difficulty || '').toLowerCase()] || 'easy';

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: `You are a professional coding interviewer. Generate a Leetcode-style coding question of ${level} difficulty. Return only a JSON object with the following fields: title, description, constraints (array), and examples (array of {input, output, explanation}). Do not include any explanation or extra text outside the JSON.` },
        { role: 'user', content: `Generate a ${level} Leetcode-style coding question.` },
      ],
      temperature: 0.7,
      max_tokens: 512,
    });

    // Try to extract JSON from the response
    const match = completion.choices[0].message.content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON found in response');
    const question = JSON.parse(match[0]);
    res.status(200).json({ question });
  } catch (err) {
    console.error('Question error:', err);
    res.status(500).json({ error: 'Failed to generate question', details: err.message });
  }
} 