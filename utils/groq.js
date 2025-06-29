import fetch from 'node-fetch';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

export async function generateTextGroq(prompt, maxTokens = 512, model = DEFAULT_MODEL) {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key not configured.');
  }

  const body = {
    model,
    messages: [
      { role: 'system', content: 'You are a helpful, expert interview assistant.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: maxTokens,
    temperature: 0.7
  };

  try {
    console.log('Generating text with Groq:', prompt.substring(0, 100) + '...');
    
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error('No content returned from Groq.');
    
    console.log('Generated response:', text.substring(0, 100) + '...');
    return text;
  } catch (error) {
    console.error('Groq API Error:', error);
    throw new Error('Failed to generate text from Groq. ' + error.message);
  }
} 