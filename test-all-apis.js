require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3001/api';

// Test data
const testData = {
  // Behavioral interview test data
  behavioral: {
    categories: ['leadership', 'problem-solving'],
    count: 2
  },
  
  // Resume-based test data
  resume: {
    resumeText: 'Software Engineer with 3 years experience in React, Node.js, and Python. Led a team of 5 developers on a major e-commerce project.',
    jobDescription: 'Senior Software Engineer position requiring React, Node.js, and team leadership experience.',
    count: 2
  },
  
  // Coding interview test data
  coding: {
    difficulty: 'easy',
    code: 'function add(a, b) {\n  return a + b;\n}',
    languageId: 63, // JavaScript
    question: {
      title: 'Add Two Numbers',
      description: 'Write a function to add two numbers',
      constraints: ['1 <= a, b <= 100'],
      examples: [{ input: '2, 3', output: '5', explanation: '2 + 3 = 5' }]
    }
  }
};

async function testAPI(endpoint, method, data, description) {
  try {
    console.log(`\n🧪 Testing: ${description}`);
    console.log(`📍 Endpoint: ${method} ${endpoint}`);
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: method === 'POST' ? JSON.stringify(data) : undefined
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ Success: ${description}`);
      console.log(`📊 Response keys:`, Object.keys(result));
      if (result.questions) {
        console.log(`📝 Questions generated: ${result.questions.length}`);
        console.log(`   Sample: "${result.questions[0]?.substring(0, 50)}..."`);
      }
      if (result.feedback) {
        console.log(`📈 Feedback score: ${result.feedback.score}/10`);
      }
      if (result.hint) {
        console.log(`💡 Hint: "${result.hint.substring(0, 50)}..."`);
      }
      if (result.critique) {
        console.log(`🔍 Critique: "${result.critique.substring(0, 50)}..."`);
      }
      if (result.solution) {
        console.log(`💻 Solution: "${result.solution.substring(0, 50)}..."`);
      }
      if (result.followUpQuestions) {
        console.log(`🔄 Follow-ups: ${result.followUpQuestions.length}`);
      }
      return true;
    } else {
      console.log(`❌ Failed: ${description}`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${result.error}`);
      if (result.details) console.log(`   Details: ${result.details}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error: ${description}`);
    console.log(`   ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting OpenRouter API Endpoint Tests...\n');
  console.log('🔑 API Key Status:', process.env.OPENROUTER_API_KEY ? '✅ Set' : '❌ Not Set');
  console.log('🌐 Base URL:', BASE_URL);
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Behavioral Questions
  const test1 = await testAPI(
    '/behavioral-questions',
    'POST',
    testData.behavioral,
    'Behavioral Interview Questions Generation'
  );
  results.tests.push({ name: 'Behavioral Questions', passed: test1 });
  test1 ? results.passed++ : results.failed++;

  // Test 2: Behavioral Feedback
  const test2 = await testAPI(
    '/behavioral-feedback',
    'POST',
    {
      question: 'Tell me about a time you led a team.',
      response: 'I led a team of 5 developers on a project. We had challenges with deadlines but I organized daily standups and we completed on time.'
    },
    'Behavioral Interview Feedback'
  );
  results.tests.push({ name: 'Behavioral Feedback', passed: test2 });
  test2 ? results.passed++ : results.failed++;

  // Test 3: Behavioral Follow-up Questions
  const test3 = await testAPI(
    '/behavioral-followup',
    'POST',
    {
      originalQuestion: 'Tell me about a time you led a team.',
      response: 'I led a team of 5 developers on a project. We had challenges with deadlines but I organized daily standups and we completed on time.',
      followUpCount: 2
    },
    'Behavioral Follow-up Questions'
  );
  results.tests.push({ name: 'Behavioral Follow-ups', passed: test3 });
  test3 ? results.passed++ : results.failed++;

  // Test 4: Resume-based Questions
  const test4 = await testAPI(
    '/resume-questions',
    'POST',
    testData.resume,
    'Resume-based Interview Questions'
  );
  results.tests.push({ name: 'Resume Questions', passed: test4 });
  test4 ? results.passed++ : results.failed++;

  // Test 5: Resume-based Feedback
  const test5 = await testAPI(
    '/resume-feedback',
    'POST',
    {
      question: 'Tell me about your team leadership experience.',
      response: 'I led a team of 5 developers on an e-commerce project. We faced deadline challenges but I implemented daily standups and we delivered on time.',
      resumeText: testData.resume.resumeText,
      jobDescription: testData.resume.jobDescription
    },
    'Resume-based Interview Feedback'
  );
  results.tests.push({ name: 'Resume Feedback', passed: test5 });
  test5 ? results.passed++ : results.failed++;

  // Test 6: Coding Questions
  const test6 = await testAPI(
    '/question',
    'POST',
    { difficulty: 'easy' },
    'Coding Problem Generation'
  );
  results.tests.push({ name: 'Coding Questions', passed: test6 });
  test6 ? results.passed++ : results.failed++;

  // Test 7: Coding Hints
  const test7 = await testAPI(
    '/hint',
    'POST',
    {
      code: testData.coding.code,
      question: testData.coding.question
    },
    'Coding Hints'
  );
  results.tests.push({ name: 'Coding Hints', passed: test7 });
  test7 ? results.passed++ : results.failed++;

  // Test 8: Code Critique
  const test8 = await testAPI(
    '/critic',
    'POST',
    {
      code: testData.coding.code,
      question: testData.coding.question
    },
    'Code Critique'
  );
  results.tests.push({ name: 'Code Critique', passed: test8 });
  test8 ? results.passed++ : results.failed++;

  // Test 9: Code Solution
  const test9 = await testAPI(
    '/solve',
    'POST',
    {
      code: testData.coding.code,
      languageId: testData.coding.languageId,
      question: testData.coding.question
    },
    'Code Solution Generation'
  );
  results.tests.push({ name: 'Code Solutions', passed: test9 });
  test9 ? results.passed++ : results.failed++;

  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  results.tests.forEach(test => {
    console.log(`${test.passed ? '✅' : '❌'} ${test.name}`);
  });
  
  console.log(`\n🎯 Overall: ${results.passed}/${results.passed + results.failed} tests passed`);
  
  if (results.failed === 0) {
    console.log('🎉 All OpenRouter API endpoints are working perfectly!');
  } else {
    console.log('⚠️  Some endpoints need attention. Check the errors above.');
  }
}

// Run the tests
runAllTests().catch(console.error); 