// pages/api/hint.js
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { code, question } = req.body;
  if ((!code || code.trim() === '') && !question) return res.status(400).json({ error: 'No code or question provided' });

  let questionContext = '';
  if (question) {
    questionContext = `\n\nQuestion:\nTitle: ${question.title}\nDescription: ${question.description}`;
    if (question.constraints && question.constraints.length > 0) {
      questionContext += `\nConstraints: ${question.constraints.join('; ')}`;
    }
    if (question.examples && question.examples.length > 0) {
      questionContext += `\nExamples: ${question.examples.map(e => `Input: ${e.input}, Output: ${e.output}${e.explanation ? ', Explanation: ' + e.explanation : ''}`).join(' | ')}`;
    }
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: `You are an expert coding interviewer. Only give small, progressive hints—never full solutions or direct answers. Your hints should help the candidate think, not solve the problem for them. If asked for the answer, politely refuse and encourage them to try.${questionContext}` },
        { role: 'user', content: code ? `Here is my code:\n\n${code}\n\nCan you give me a hint or explain what might be wrong?` : 'Can you give me a hint for this problem?' },
      ],
      temperature: 0.7,
    });

    const hint = completion.choices[0].message.content;
    res.status(200).json({ hint });
  } catch (err) {
    console.error('Hint error:', err);
    res.status(500).json({ error: 'Failed to fetch hint', details: err.message });
  }
}
