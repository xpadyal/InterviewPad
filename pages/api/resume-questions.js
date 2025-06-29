import { generateTextGroq } from '../../utils/groq';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { resumeText, jobDescription, count } = req.body;

    if (!resumeText) {
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

Format the response as a JSON array of strings, where each string is a question.`;

    const response = await generateTextGroq(prompt, 1000);
    
    // Try to parse JSON from the response
    let questions;
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON found, split by lines and clean up
        const lines = response.split('\n').filter(line => line.trim());
        questions = lines
          .map(line => line.replace(/^\d+\.\s*/, '').replace(/^["']|["']$/g, ''))
          .filter(line => line.length > 10 && line.includes('?'))
          .slice(0, count);
      }
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      // Fallback: return the raw response split into questions
      questions = response.split('\n')
        .filter(line => line.trim() && line.includes('?'))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, count);
    }

    // Ensure we have the right number of questions
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Failed to generate valid questions');
    }

    // Limit to requested count
    const finalQuestions = questions.slice(0, count);

    res.status(200).json({ questions: finalQuestions });
  } catch (error) {
    console.error('Error generating resume questions:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
} 