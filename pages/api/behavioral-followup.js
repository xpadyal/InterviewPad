import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { originalQuestion, response, starStructure, followUpCount = 2 } = req.body;

    if (!originalQuestion || !response) {
      return res.status(400).json({ error: 'Original question and response are required' });
    }

    const prompt = `You are an expert interviewer conducting a behavioral interview. Based on the candidate's response, generate ${followUpCount} relevant follow-up questions.

Original Question: "${originalQuestion}"

Candidate's Response:
- Situation: ${response.situation}
- Task: ${response.task}
- Action: ${response.action}
- Result: ${response.result}

Generate ${followUpCount} follow-up questions that:
1. **Probe deeper** into specific aspects of their response
2. **Seek clarification** on unclear points
3. **Explore alternative scenarios** or "what if" situations
4. **Ask for specific details** like numbers, timelines, or outcomes
5. **Challenge assumptions** or explore different perspectives
6. **Connect to other competencies** or skills

The questions should be:
- Specific and actionable
- Based on what they actually said
- Designed to elicit more detailed responses
- Professional and appropriate for an interview setting

Format the response as a JSON array of strings, where each string is a follow-up question.

Example format:
[
  "You mentioned that the project was behind schedule. What specific steps did you take to get it back on track?",
  "How did you handle resistance from team members who disagreed with your approach?",
  "What would you do differently if you faced a similar situation in the future?"
]`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert HR professional and interview coach with 15+ years of experience. You specialize in behavioral interviewing and know how to ask insightful follow-up questions that help assess candidates' real-world experience and competencies."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const response_text = completion.choices[0].message.content;
    
    // Parse the JSON response
    let followUpQuestions;
    try {
      followUpQuestions = JSON.parse(response_text);
    } catch (parseError) {
      // If JSON parsing fails, try to extract questions from the response
      const lines = response_text.split('\n').filter(line => line.trim());
      followUpQuestions = lines
        .map(line => line.replace(/^\d+\.\s*/, '').replace(/^["']|["']$/g, ''))
        .filter(line => line.length > 10 && line.includes('?'))
        .slice(0, followUpCount);
    }

    // Ensure we have valid questions
    if (!Array.isArray(followUpQuestions) || followUpQuestions.length === 0) {
      throw new Error('Failed to generate valid follow-up questions');
    }

    // Limit to requested count
    followUpQuestions = followUpQuestions.slice(0, followUpCount);

    res.status(200).json({ 
      followUpQuestions,
      count: followUpQuestions.length
    });
  } catch (error) {
    console.error('Error generating follow-up questions:', error);
    res.status(500).json({ error: 'Failed to generate follow-up questions' });
  }
} 