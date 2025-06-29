// pages/api/execute.js

export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    // Extract code and languageId
    const { code, languageId, stdin } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'No code provided' });
    }
  
    // Ensure RapidAPI key is set
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'RapidAPI key not configured on server' });
    }
  
    try {
      // Forward to Judge0
      const response = await fetch(
        'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          },
          body: JSON.stringify({
            source_code: code,
            language_id: languageId || 71, // Default to Python 3 if not specified
            stdin: stdin || '',
            redirect_stderr_to_stdout: true,
          }),
        }
      );
  
      // Check that we got a JSON response
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Judge0 returned non-JSON:', text);
        return res.status(502).json({ error: 'Unexpected response from Judge0', details: text });
      }
  
      const result = await response.json();
      
      // Check for quota errors or other API errors
      if (result.message && result.message.includes('quota')) {
        return res.status(429).json({ 
          error: 'Daily quota exceeded for code execution. Please upgrade your RapidAPI plan or try again tomorrow.',
          details: result.message 
        });
      }
      
      if (result.message && result.message.includes('error')) {
        return res.status(400).json({ 
          error: 'Code execution error', 
          details: result.message 
        });
      }
      
      return res.status(200).json(result);
    } catch (err) {
      console.error('Error in /api/execute:', err);
      return res.status(500).json({ error: 'Execution failed', details: err.message });
    }
  }
  