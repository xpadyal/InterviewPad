import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question, response, followUpQuestions = [], followUpResponses = {} } = req.body;

    if (!question || !response) {
      return res.status(400).json({ error: 'Question and response are required' });
    }

    // Build the complete response context including follow-ups
    let completeResponse = `Original Question: ${question}\n\nCandidate's Response:\n${response}\n`;

    // Add follow-up questions and responses if they exist
    if (followUpQuestions.length > 0) {
      completeResponse += `\nFollow-up Questions and Responses:\n`;
      followUpQuestions.forEach((followUpQuestion, index) => {
        const followUpResponse = followUpResponses[index] || 'No response provided';
        completeResponse += `\nFollow-up ${index + 1}: ${followUpQuestion}\n`;
        completeResponse += `Response: ${followUpResponse}\n`;
      });
    }

    const prompt = `You are an expert HR professional and interview coach with 15+ years of experience. Evaluate the following behavioral interview response using the STAR method framework.

${completeResponse}

Please provide a comprehensive evaluation including:

1. **Overall Score (1-10)**: Rate the response based on:
   - STAR method structure and completeness (Situation, Task, Action, Result)
   - Specificity and detail level
   - Measurable outcomes and results
   - Relevance to the question
   - Quality of follow-up responses (if provided)

2. **Strengths (3-5 points)**: Identify what the candidate did well

3. **Areas for Improvement (3-5 points)**: Suggest specific ways to enhance the response

4. **Detailed Feedback**: Provide actionable suggestions for improvement

5. **STAR Method Analysis**: Evaluate how well the response follows the STAR framework:
   - Situation: Clarity and context
   - Task: Responsibility and challenge definition
   - Action: Specific actions and approach
   - Result: Outcomes and learnings

6. **Follow-up Quality** (if applicable): Assess the depth and relevance of follow-up responses

Format your response as JSON with the following structure:
{
  "score": number (1-10),
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "suggestions": "Detailed feedback and suggestions for improvement",
  "starAnalysis": {
    "situation": "analysis of situation component",
    "task": "analysis of task component", 
    "action": "analysis of action component",
    "result": "analysis of result component"
  },
  "followUpAnalysis": "analysis of follow-up responses if provided"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert HR professional and interview coach. Provide detailed, constructive feedback on behavioral interview responses. Always return valid JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const response_text = completion.choices[0].message.content;
    
    // Parse the JSON response
    let feedback;
    try {
      feedback = JSON.parse(response_text);
    } catch (parseError) {
      console.error('Failed to parse feedback JSON:', parseError);
      // Fallback feedback structure
      feedback = {
        score: 7,
        strengths: ["Good use of STAR method", "Clear structure", "Relevant example"],
        improvements: ["Add more specific details", "Include measurable outcomes", "Provide more context"],
        suggestions: "Your response shows good structure using the STAR method. Consider adding more specific details, measurable outcomes, and additional context to make your response more compelling.",
        starAnalysis: {
          situation: "Good context provided",
          task: "Clear responsibility outlined", 
          action: "Actions could be more specific",
          result: "Results could be more measurable"
        },
        followUpAnalysis: followUpQuestions.length > 0 ? "Follow-up responses show engagement with the interviewer's questions." : "No follow-up questions provided."
      };
    }

    // Ensure score is a number and within range
    const score = Math.min(10, Math.max(1, parseInt(feedback.score) || 7));

    res.status(200).json({ 
      feedback: {
        score,
        strengths: feedback.strengths || ["Good response structure"],
        improvements: feedback.improvements || ["Could provide more detail"],
        suggestions: feedback.suggestions || "Consider adding more specific examples and measurable outcomes.",
        starAnalysis: feedback.starAnalysis || {
          situation: "Good context",
          task: "Clear responsibility",
          action: "Actions described",
          result: "Outcomes mentioned"
        },
        followUpAnalysis: feedback.followUpAnalysis || "No follow-up questions provided."
      },
      score
    });
  } catch (error) {
    console.error('Error generating feedback:', error);
    res.status(500).json({ error: 'Failed to generate feedback' });
  }
} 