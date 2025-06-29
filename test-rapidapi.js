require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000/api';

async function testRapidAPI() {
  console.log('🚀 Testing RAPID API (Judge0) Code Execution...\n');
  console.log('🔑 RAPID API Key Status:', process.env.RAPIDAPI_KEY ? '✅ Set' : '❌ Not Set');
  console.log('🌐 Base URL:', BASE_URL);

  if (!process.env.RAPIDAPI_KEY) {
    console.log('❌ RAPID API Key not found in environment variables');
    console.log('💡 Please add RAPIDAPI_KEY=your_key_here to your .env.local file');
    return;
  }

  // Test data for different languages
  const testCases = [
    {
      languageId: 63, // JavaScript
      code: 'function add(a, b) {\n  return a + b;\n}',
      testCases: [
        { input: '2, 3', expectedOutput: '5' },
        { input: '10, 20', expectedOutput: '30' }
      ],
      description: 'JavaScript Addition Function'
    },
    {
      languageId: 71, // Python
      code: 'def multiply(a, b):\n    return a * b',
      testCases: [
        { input: '3, 4', expectedOutput: '12' },
        { input: '5, 6', expectedOutput: '30' }
      ],
      description: 'Python Multiplication Function'
    }
  ];

  for (const test of testCases) {
    console.log(`\n🧪 Testing: ${test.description}`);
    console.log(`📍 Language ID: ${test.languageId}`);
    console.log(`💻 Code: ${test.code.replace(/\n/g, '\\n')}`);
    
    try {
      const response = await fetch(`${BASE_URL}/testcases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: test.code,
          languageId: test.languageId,
          testCases: test.testCases
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log(`✅ Success: ${test.description}`);
        console.log(`📊 Results:`, result.results);
        
        // Check if all test cases passed
        const allPassed = result.results.every(r => r.passed);
        console.log(`🎯 All tests passed: ${allPassed ? '✅' : '❌'}`);
        
        result.results.forEach((r, i) => {
          console.log(`   Test ${i + 1}: ${r.passed ? '✅' : '❌'} (Expected: ${r.expectedOutput}, Got: ${r.actualOutput})`);
        });
      } else {
        console.log(`❌ Failed: ${test.description}`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Error: ${result.error}`);
        if (result.details) console.log(`   Details: ${result.details}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${test.description}`);
      console.log(`   ${error.message}`);
    }
  }

  // Test code execution endpoint
  console.log(`\n🧪 Testing: Code Execution Endpoint`);
  try {
    const response = await fetch(`${BASE_URL}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: 'console.log("Hello, World!");',
        languageId: 63 // JavaScript
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ Success: Code Execution`);
      console.log(`📊 Output: ${result.output}`);
      console.log(`⏱️  Execution time: ${result.executionTime}ms`);
    } else {
      console.log(`❌ Failed: Code Execution`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${result.error}`);
    }
  } catch (error) {
    console.log(`❌ Error: Code Execution`);
    console.log(`   ${error.message}`);
  }

  console.log('\n📊 RAPID API Test Summary:');
  console.log('==========================');
  console.log('🔑 API Key: ' + (process.env.RAPIDAPI_KEY ? '✅ Configured' : '❌ Missing'));
  console.log('💡 Make sure your RAPID API key is valid and has access to Judge0 API');
  console.log('🌐 Judge0 API: https://judge0-ce.p.rapidapi.com/');
}

// Run the test
testRapidAPI().catch(console.error); 