import { generateTextGroq } from '../../utils/groq';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { originalQuestion, response, followUpCount = 3 } = req.body;

    if (!originalQuestion || !response) {
      return res.status(400).json({ error: 'Original question and response are required' });
    }

    const prompt = `You are an expert HR professional generating follow-up questions for a behavioral interview.

ORIGINAL QUESTION:
${originalQuestion}

CANDIDATE'S RESPONSE:
${response}

Generate ${followUpCount} follow-up questions that:
- Probe deeper into the candidate's response
- Ask for more specific details or examples
- Challenge assumptions or explore alternative scenarios
- Help assess the candidate's critical thinking and problem-solving skills
- Are relevant to the original question and response

Format as a JSON array of strings, where each string is a follow-up question.`;

    const response_text = await generateTextGroq(prompt, 500);
    
    // Try to parse JSON from the response
    let followUpQuestions;
    try {
      const jsonMatch = response_text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        followUpQuestions = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON found, split by lines and clean up
        const lines = response_text.split('\n').filter(line => line.trim());
        followUpQuestions = lines
          .map(line => line.replace(/^\d+\.\s*/, '').replace(/^["']|["']$/g, ''))
          .filter(line => line.length > 10 && line.includes('?'))
          .slice(0, followUpCount);
      }
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      // Fallback: return the raw response split into questions
      followUpQuestions = response_text.split('\n')
        .filter(line => line.trim() && line.includes('?'))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, followUpCount);
    }

    res.status(200).json({ followUpQuestions });
  } catch (error) {
    console.error('Error generating follow-up questions:', error);
    res.status(500).json({ error: 'Failed to generate follow-up questions' });
  }
} 