import { generateTextGroq } from '../../utils/groq';

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
    const prompt = `You are a professional coding interviewer. Generate a Leetcode-style coding question of ${level} difficulty. Return only a JSON object with the following fields: title (string), description (string), constraints (array of strings), and examples (array of objects). Each example object must have: input (string), output (string), and optionally explanation (string). The examples array must contain at least one valid example. Do not include any explanation or extra text outside the JSON.\n\nGenerate a ${level} Leetcode-style coding question.`;

    const response = await generateTextGroq(prompt, 512);

    // Try to extract JSON from the response
    const match = response.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON found in response');
    const question = JSON.parse(match[0]);

    // Defensive: filter/transform examples to only include valid objects
    if (Array.isArray(question.examples)) {
      question.examples = question.examples.filter(
        ex => ex && typeof ex.input === 'string' && typeof ex.output === 'string'
      ).map(ex => ({
        input: ex.input,
        output: ex.output,
        explanation: typeof ex.explanation === 'string' ? ex.explanation : undefined
      }));
    } else {
      question.examples = [];
    }

    res.status(200).json({ question });
  } catch (err) {
    console.error('Question error:', err);
    res.status(500).json({ error: 'Failed to generate question', details: err.message });
  }
} 