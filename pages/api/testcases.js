export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, languageId, testCases } = req.body;
  if (!code || !Array.isArray(testCases)) {
    return res.status(400).json({ error: 'Missing code or testCases' });
  }
  // Supported language IDs
  const supportedLangs = [71, 63, 62, 54, 50, 51, 72, 73];
  if (!supportedLangs.includes(languageId)) {
    return res.status(400).json({ error: 'Supported languages: Python 3, JavaScript, Java, C++, C, C#, Ruby, Go.' });
  }

  let testRunner = '';
  let funcName = '';
  if (languageId === 71) {
    // Python
    const match = code.match(/def\s+([a-zA-Z0-9_]+)\s*\(/);
    if (!match) {
      return res.status(400).json({ error: 'Please define your solution as a function.' });
    }
    funcName = match[1];
    testRunner = code + '\nresults = []\n';
    testCases.forEach((tc, i) => {
      testRunner += `try:\n    actual = ${funcName}(${tc.input})\n    results.append({'actual': str(actual)})\nexcept Exception as e:\n    results.append({'actual': 'Error: ' + str(e)})\n`;
    });
    testRunner += '\nimport json\nprint(json.dumps(results))\n';
  } else if (languageId === 63) {
    // JavaScript
    const match = code.match(/function\s+([a-zA-Z0-9_]+)\s*\(/);
    if (!match) {
      return res.status(400).json({ error: 'Please define your solution as a function.' });
    }
    funcName = match[1];
    testRunner = code + '\nconst results = [];\n';
    testCases.forEach((tc, i) => {
      testRunner += `try { results.push({actual: String(${funcName}(${tc.input}))}); } catch(e) { results.push({actual: 'Error: ' + e}); }\n`;
    });
    testRunner += 'console.log(JSON.stringify(results));\n';
  } else if (languageId === 62) {
    // Java
    const match = code.match(/(?:public\s+)?(?:static\s+)?[\w<>\[\]]+\s+([a-zA-Z0-9_]+)\s*\(/);
    if (!match) {
      return res.status(400).json({ error: 'Please define your solution as a static method.' });
    }
    funcName = match[1];
    testRunner = `import java.util.*;\nimport com.google.gson.*;\n${code}\npublic class Main {\n  public static void main(String[] args) {\n    List<Map<String, String>> results = new ArrayList<>();\n    try {\n`;
    testCases.forEach((tc, i) => {
      testRunner += `      try { results.add(Collections.singletonMap(\"actual\", String.valueOf(${funcName}(${tc.input})))); } catch(Exception e) { results.add(Collections.singletonMap(\"actual\", \"Error: \" + e)); }\n`;
    });
    testRunner += `    } catch(Exception e) {}\n    System.out.println(new com.google.gson.Gson().toJson(results));\n  }\n}`;
  } else if (languageId === 54) {
    // C++
    const match = code.match(/[\w<>\[\]]+\s+([a-zA-Z0-9_]+)\s*\(/);
    if (!match) {
      return res.status(400).json({ error: 'Please define your solution as a function.' });
    }
    funcName = match[1];
    testRunner = `#include <iostream>\n#include <vector>\n#include <string>\n#include <sstream>\n#include <nlohmann/json.hpp>\nusing json = nlohmann::json;\n${code}\nint main() {\n  std::vector<json> results;\n`;
    testCases.forEach((tc, i) => {
      testRunner += `  try { results.push_back({{"actual", std::to_string(${funcName}(${tc.input}))}}); } catch(...) { results.push_back({{"actual", "Error"}}); }\n`;
    });
    testRunner += `  std::cout << results << std::endl;\n  return 0;\n}`;
  } else if (languageId === 50) {
    // C
    const match = code.match(/[\w\*]+\s+([a-zA-Z0-9_]+)\s*\(/);
    if (!match) {
      return res.status(400).json({ error: 'Please define your solution as a function.' });
    }
    funcName = match[1];
    testRunner = `#include <stdio.h>\n#include <string.h>\n${code}\nint main() {\n  // C test runner is limited: only supports int return and int args\n`;
    testCases.forEach((tc, i) => {
      testRunner += `  printf(\"%d\\n\", ${funcName}(${tc.input}));\n`;
    });
    testRunner += `  return 0;\n}`;
  } else if (languageId === 51) {
    // C#
    const match = code.match(/(?:public\s+)?(?:static\s+)?[\w<>\[\]]+\s+([a-zA-Z0-9_]+)\s*\(/);
    if (!match) {
      return res.status(400).json({ error: 'Please define your solution as a static method.' });
    }
    funcName = match[1];
    testRunner = `using System;\nusing System.Collections.Generic;\nusing Newtonsoft.Json;\n${code}\npublic class Program {\n  public static void Main() {\n    var results = new List<Dictionary<string, string>>();\n`;
    testCases.forEach((tc, i) => {
      testRunner += `    try { results.Add(new Dictionary<string, string>{{\"actual\", Convert.ToString(${funcName}(${tc.input}))}}); } catch(Exception e) { results.Add(new Dictionary<string, string>{{\"actual\", \"Error: \" + e.Message}}); }\n`;
    });
    testRunner += `    Console.WriteLine(JsonConvert.SerializeObject(results));\n  }\n}`;
  } else if (languageId === 72) {
    // Ruby
    const match = code.match(/def\s+([a-zA-Z0-9_]+)\s*\(/);
    if (!match) {
      return res.status(400).json({ error: 'Please define your solution as a method.' });
    }
    funcName = match[1];
    testRunner = code + '\nresults = []\n';
    testCases.forEach((tc, i) => {
      testRunner += `begin; actual = ${funcName}(${tc.input}); results << {actual: actual.to_s}; rescue => e; results << {actual: 'Error: ' + e.to_s}; end\n`;
    });
    testRunner += 'require \"json\"; puts results.to_json\n';
  } else if (languageId === 73) {
    // Go
    const match = code.match(/func\s+([a-zA-Z0-9_]+)\s*\(/);
    if (!match) {
      return res.status(400).json({ error: 'Please define your solution as a function.' });
    }
    funcName = match[1];
    testRunner = `package main\nimport (\n  \"fmt\"\n  \"encoding/json\"\n)\n${code}\nfunc main() {\n  results := make([]map[string]string, 0)\n`;
    testCases.forEach((tc, i) => {
      testRunner += `  func() { defer func() { if r := recover(); r != nil { results = append(results, map[string]string{\"actual\": \"Error\"}) } }(); results = append(results, map[string]string{\"actual\": fmt.Sprint(${funcName}(${tc.input}))}) }()\n`;
    });
    testRunner += `  b, _ := json.Marshal(results)\n  fmt.Println(string(b))\n}`;
  }

  // Call Judge0
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'RapidAPI key not configured on server' });
  }
  try {
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
          source_code: testRunner,
          language_id: languageId,
          redirect_stderr_to_stdout: true,
        }),
      }
    );
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
    
    let resultsArr = [];
    try {
      const parsed = JSON.parse(result.stdout);
      resultsArr = parsed.map((r, i) => {
        const actual = r.actual;
        const expected = String(testCases[i].expectedOutput).trim();
        const passed = actual.trim() === expected;
        return {
          input: testCases[i].input,
          expectedOutput: expected,
          actualOutput: actual,
          passed,
        };
      });
    } catch (e) {
      return res.status(200).json({ error: 'Failed to parse test results', details: result.stdout, raw: result });
    }
    return res.status(200).json({ results: resultsArr });
  } catch (err) {
    return res.status(500).json({ error: 'Execution failed', details: err.message });
  }
} 