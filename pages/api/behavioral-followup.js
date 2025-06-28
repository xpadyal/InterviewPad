import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { originalQuestion, response, followUpCount = 3 } = req.body;

    if (!originalQuestion || !response) {
      return res.status(400).json({ error: 'Original question and response are required' });
    }

    const prompt = `You are an expert HR professional conducting a behavioral interview. Based on the candidate's response to the original question, generate ${followUpCount} relevant follow-up questions that will help you better understand their experience and capabilities.

Original Question: "${originalQuestion}"

Candidate's Response: "${response}"

Generate ${followUpCount} follow-up questions that:
1. Are specific and relevant to the candidate's response
2. Help clarify details or explore deeper aspects
3. Assess different dimensions of their experience
4. Are open-ended and encourage detailed responses
5. Follow good behavioral interviewing practices

Return the questions as a JSON array:
["question1", "question2", "question3"]`;

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