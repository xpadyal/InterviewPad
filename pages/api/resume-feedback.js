import { generateTextGroq } from '../../utils/groq';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question, response, resumeText, jobDescription, followUpQuestions = [], followUpResponses = {} } = req.body;

    if (!question || !response || !resumeText) {
      return res.status(400).json({ error: 'Question, response, and resume text are required' });
    }

    const prompt = `You are an expert HR professional providing feedback on a resume-based behavioral interview response.

RESUME CONTENT:
${resumeText}

${jobDescription ? `JOB DESCRIPTION:
${jobDescription}` : ''}

INTERVIEW QUESTION:
${question}

CANDIDATE'S RESPONSE:
${response}

${followUpQuestions.length > 0 ? `FOLLOW-UP QUESTIONS:
${followUpQuestions.join('\n')}

FOLLOW-UP RESPONSES:
${Object.entries(followUpResponses).map(([index, resp]) => `Q${parseInt(index) + 1}: ${resp}`).join('\n')}` : ''}

Please provide comprehensive feedback on this response considering:

1. **Resume Alignment**: How well does the response align with their stated experience and achievements?
2. **STAR Method**: Does the response follow the Situation, Task, Action, Result structure?
3. **Specificity**: Are there concrete examples, metrics, and details?
4. **Relevance**: How relevant is the example to the question asked?
5. **${jobDescription ? 'Job Fit' : 'Professional Growth'}**: ${jobDescription ? 'How well does this demonstrate fit for the target role?' : 'How does this show professional development?'}
6. **Communication**: Is the response clear, concise, and well-structured?

Provide feedback in the following JSON format:
{
  "score": number (1-10),
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "suggestions": "Detailed suggestions for improvement",
  "starAnalysis": {
    "situation": "Analysis of situation description",
    "task": "Analysis of task description", 
    "action": "Analysis of actions taken",
    "result": "Analysis of results achieved"
  },
  "resumeAlignment": "How well the response connects to their resume experience"
}`;

    const response_text = await generateTextGroq(prompt, 1500);
    
    // Try to parse JSON from the response
    let feedback;
    try {
      const jsonMatch = response_text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        feedback = JSON.parse(jsonMatch[0]);
        
        // Ensure required fields exist
        if (!feedback.score) feedback.score = 7;
        if (!feedback.strengths) feedback.strengths = [];
        if (!feedback.improvements) feedback.improvements = [];
        if (!feedback.suggestions) feedback.suggestions = "Good response overall.";
        
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse feedback JSON:', parseError);
      // Fallback feedback structure
      feedback = {
        score: 7,
        strengths: ["Good response structure", "Relevant example provided"],
        improvements: ["Could provide more specific details", "Consider adding metrics"],
        suggestions: "Overall good response. Consider adding more specific details and metrics to strengthen your answer.",
        starAnalysis: {
          situation: "Situation was described",
          task: "Task was mentioned",
          action: "Actions were outlined",
          result: "Results were discussed"
        },
        resumeAlignment: "Response connects well to your experience"
      };
    }

    res.status(200).json({ feedback });
  } catch (error) {
    console.error('Error generating resume feedback:', error);
    res.status(500).json({ error: 'Failed to generate feedback' });
  }
} 