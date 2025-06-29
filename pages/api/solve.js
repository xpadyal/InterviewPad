import { generateTextGroq } from '../../utils/groq';

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
    const prompt = `You are an expert coding assistant. Given the following code or problem, write a complete, correct solution in ${language}. Only output code, no explanation, no comments unless required by the language.${questionContext}

${code ? `Write a complete solution in ${language} for the following code or problem:\n\n${code}` : `Write a complete solution in ${language} for the above problem.`}`;

    const solution = await generateTextGroq(prompt, 512);
    res.status(200).json({ solution: solution.trim() });
  } catch (err) {
    console.error('Solve error:', err);
    res.status(500).json({ error: 'Failed to solve code', details: err.message });
  }
} 