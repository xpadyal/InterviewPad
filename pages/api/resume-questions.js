import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { resumeText, jobDescription, count } = req.body;

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({ error: 'Resume text is required' });
    }

    if (!count || count < 1 || count > 15) {
      return res.status(400).json({ error: 'Count must be between 1 and 15' });
    }

    const prompt = `You are an expert HR professional conducting a resume-based interview. 

RESUME CONTENT:
${resumeText}

${jobDescription ? `JOB DESCRIPTION:
${jobDescription}` : ''}

Generate ${count} personalized behavioral interview questions based on the candidate's resume and ${jobDescription ? 'the job description' : 'their experience'}. 

The questions should:
- Reference specific experiences, skills, or achievements mentioned in their resume
- Be tailored to their background and career progression
- ${jobDescription ? 'Align with the requirements and responsibilities in the job description' : 'Focus on their key competencies and achievements'}
- Elicit detailed responses using the STAR method
- Vary in difficulty and scope
- Be realistic and commonly asked in interviews

Focus on:
- Their specific roles and responsibilities
- Technologies, tools, or methodologies they've used
- Projects they've worked on
- Achievements and metrics they've mentioned
- Career transitions or growth patterns
- ${jobDescription ? 'How their experience relates to the target role' : 'Their professional development'}

Format the response as a JSON array of strings, where each string is a question.

Example format:
[
  "I see you worked on [specific project/technology] at [company]. Can you tell me about a challenging situation you faced while working on that project?",
  "Your resume mentions you led a team of [X] people. Describe a time when you had to motivate your team through a difficult period.",
  "You've worked with [specific technology/methodology]. Give me an example of how you applied this in a real-world scenario."
]`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert HR professional and interview coach specializing in resume-based interviews. Generate personalized, high-quality behavioral interview questions that are specifically tailored to the candidate's background and experience. Focus on creating questions that reference their actual work history and achievements."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const response = completion.choices[0].message.content;
    
    // Parse the JSON response
    let questions;
    try {
      questions = JSON.parse(response);
    } catch (parseError) {
      // If JSON parsing fails, try to extract questions from the response
      const lines = response.split('\n').filter(line => line.trim());
      questions = lines
        .map(line => line.replace(/^\d+\.\s*/, '').replace(/^["']|["']$/g, ''))
        .filter(line => line.length > 10);
    }

    // Ensure we have the right number of questions
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Failed to generate valid questions');
    }

    // Limit to requested count
    questions = questions.slice(0, count);

    res.status(200).json({ questions });
  } catch (error) {
    console.error('Error generating resume-based questions:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
} 