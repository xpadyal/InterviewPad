import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question, response, starStructure } = req.body;

    if (!question || !response) {
      return res.status(400).json({ error: 'Question and response are required' });
    }

    // Validate STAR response structure
    const requiredFields = ['situation', 'task', 'action', 'result'];
    const hasAllFields = requiredFields.every(field => 
      response[field] && response[field].trim().length > 0
    );

    if (!hasAllFields) {
      return res.status(400).json({ error: 'All STAR method fields are required' });
    }

    const prompt = `You are an expert interview coach evaluating a behavioral interview response using the STAR method.

Question: "${question}"

Candidate's Response:
- Situation: ${response.situation}
- Task: ${response.task}
- Action: ${response.action}
- Result: ${response.result}

Please evaluate this response and provide detailed feedback. Consider:

1. **STAR Method Structure**: How well does the response follow the STAR framework?
2. **Specificity**: Are the details specific and concrete?
3. **Relevance**: How well does the response address the question?
4. **Impact**: Does the candidate demonstrate measurable outcomes?
5. **Learning**: Does the candidate show reflection and growth?

Provide your evaluation in the following JSON format:
{
  "score": <number from 1-10>,
  "feedback": {
    "strengths": ["strength1", "strength2", "strength3"],
    "improvements": ["improvement1", "improvement2", "improvement3"],
    "suggestions": "Overall suggestions for improvement"
  }
}

Scoring criteria:
- 9-10: Exceptional response with clear STAR structure, specific details, measurable results
- 7-8: Good response with most STAR elements, some specific details
- 5-6: Adequate response with basic STAR structure, needs more specificity
- 3-4: Weak response with unclear structure or missing key elements
- 1-2: Poor response with major gaps or off-topic content

Be constructive and specific in your feedback.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert interview coach with 15+ years of experience in HR and talent acquisition. You specialize in behavioral interviewing and the STAR method. Provide constructive, specific feedback that helps candidates improve their interview skills."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const response_text = completion.choices[0].message.content;
    
    // Parse the JSON response
    let feedback;
    try {
      feedback = JSON.parse(response_text);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      console.error('Failed to parse feedback JSON:', parseError);
      feedback = {
        score: 5,
        feedback: {
          strengths: ["Response shows effort in using the STAR method"],
          improvements: ["Could provide more specific details", "Consider adding measurable outcomes"],
          suggestions: "Try to be more specific with numbers, timelines, and concrete actions taken."
        }
      };
    }

    // Validate feedback structure
    if (!feedback.score || !feedback.feedback) {
      throw new Error('Invalid feedback structure');
    }

    // Ensure score is within bounds
    feedback.score = Math.max(1, Math.min(10, Math.round(feedback.score)));

    // Ensure arrays exist
    if (!Array.isArray(feedback.feedback.strengths)) {
      feedback.feedback.strengths = ["Good effort in responding to the question"];
    }
    if (!Array.isArray(feedback.feedback.improvements)) {
      feedback.feedback.improvements = ["Consider adding more specific details"];
    }
    if (!feedback.feedback.suggestions) {
      feedback.feedback.suggestions = "Focus on providing specific examples and measurable outcomes.";
    }

    res.status(200).json({ 
      feedback: feedback.feedback,
      score: feedback.score
    });
  } catch (error) {
    console.error('Error providing behavioral feedback:', error);
    res.status(500).json({ error: 'Failed to provide feedback' });
  }
} 