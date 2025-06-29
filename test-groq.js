require('dotenv').config({ path: '.env.local' });
const { generateTextGroq } = require('./utils/groq');

async function testGroq() {
  try {
    console.log('Testing Groq API...');
    console.log('API Key:', process.env.GROQ_API_KEY ? '✅ Set' : '❌ Not Set');
    
    const startTime = Date.now();
    const response = await generateTextGroq(
      'Generate a simple behavioral interview question about leadership:',
      100
    );
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log('✅ Success! Response:', response);
    console.log(`⚡ Response time: ${duration}ms (ultra-fast!)`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testGroq(); 