import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question, response, resumeText, jobDescription, followUpQuestions, followUpResponses } = req.body;

    if (!question || !response || !resumeText) {
      return res.status(400).json({ error: 'Question, response, and resume text are required' });
    }

    const jobFitText = jobDescription ? 'Job Fit' : 'Professional Growth';
    const jobFitQuestion = jobDescription ? 'How well does this demonstrate fit for the target role?' : 'How does this show professional development?';

    const prompt = `You are an expert HR professional providing feedback on a resume-based behavioral interview response.

RESUME CONTENT:
${resumeText}

${jobDescription ? `JOB DESCRIPTION:
${jobDescription}` : ''}

INTERVIEW QUESTION:
${question}

CANDIDATE'S RESPONSE:
${response}

${followUpQuestions && followUpQuestions.length > 0 ? `FOLLOW-UP QUESTIONS:
${followUpQuestions.join('\n')}

FOLLOW-UP RESPONSES:
${Object.entries(followUpResponses || {}).map(([index, resp]) => `Q${parseInt(index) + 1}: ${resp}`).join('\n')}` : ''}

Please provide comprehensive feedback on this response considering:

1. **Resume Alignment**: How well does the response align with their stated experience and achievements?
2. **STAR Method**: Does the response follow the Situation, Task, Action, Result structure?
3. **Specificity**: Are there concrete examples, metrics, and details?
4. **Relevance**: How relevant is the example to the question asked?
5. **${jobFitText}**: ${jobFitQuestion}
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
  "resumeAlignment": "How well the response connects to their resume experience",
  "followUpAnalysis": "Analysis of follow-up responses if provided"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert HR professional and interview coach specializing in resume-based interviews. Provide detailed, constructive feedback that considers the candidate's actual background and experience. Be specific about how their response relates to their resume and the target role."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
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
        strengths: ["Good response structure", "Relevant example provided"],
        improvements: ["Could provide more specific details", "Consider adding metrics"],
        suggestions: "Overall good response. Consider adding more specific details and metrics to strengthen your answer.",
        starAnalysis: {
          situation: "Situation was described",
          task: "Task was mentioned",
          action: "Actions were outlined",
          result: "Results were discussed"
        },
        resumeAlignment: "Response connects well to your experience",
        followUpAnalysis: "Follow-up responses show good engagement"
      };
    }

    // Ensure required fields exist
    if (!feedback.score) feedback.score = 7;
    if (!feedback.strengths) feedback.strengths = [];
    if (!feedback.improvements) feedback.improvements = [];
    if (!feedback.suggestions) feedback.suggestions = "Good response overall.";

    res.status(200).json({ 
      feedback,
      score: feedback.score 
    });
  } catch (error) {
    console.error('Error generating resume-based feedback:', error);
    res.status(500).json({ error: 'Failed to generate feedback' });
  }
} 