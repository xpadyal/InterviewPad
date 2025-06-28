import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Map Judge0 language IDs to language names
const languageMap = {
  71: 'Python 3',
  54: 'C++',
  50: 'C',
  62: 'Java',
  63: 'JavaScript',
  51: 'C#',
  72: 'Ruby',
  73: 'Go',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { code, languageId, question } = req.body;
  if ((!code || code.trim() === '') && !question) return res.status(400).json({ error: 'No code or question provided' });

  const language = languageMap[languageId] || 'code';

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
        { role: 'system', content: `You are an expert coding assistant. Given the following code or problem, write a complete, correct solution in ${language}. Only output code, no explanation, no comments unless required by the language.${questionContext}` },
        { role: 'user', content: code ? `Write a complete solution in ${language} for the following code or problem:\n\n${code}` : `Write a complete solution in ${language} for the above problem.` },
      ],
      temperature: 0.2,
      max_tokens: 512,
    });

    const solution = completion.choices[0].message.content.trim();
    res.status(200).json({ solution });
  } catch (err) {
    console.error('Solve error:', err);
    res.status(500).json({ error: 'Failed to solve code', details: err.message });
  }
} 