import { generateTextGroq } from '../../utils/groq';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { code, question } = req.body;
  if (!code || code.trim() === '') {
    return res.status(200).json({ critique: 'Please write some code first to receive a critique.' });
  }

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
    const prompt = `You are an expert coding interviewer and code reviewer. Critique the candidate's code as if in a technical interview. Be strict but constructive. Point out code quality, style, efficiency, correctness, and possible improvements. Suggest best practices, but do not rewrite the code. End with a brief summary of the candidate's strengths and areas for improvement.${questionContext}

Here is my code:

${code}

Please critique my code as an interviewer would.`;

    const critique = await generateTextGroq(prompt, 800);
    res.status(200).json({ critique });
  } catch (err) {
    console.error('Critic error:', err);
    res.status(500).json({ error: 'Failed to fetch critique', details: err.message });
  }
} 