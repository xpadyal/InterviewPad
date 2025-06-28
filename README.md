# InterviewPad - AI-Powered Interview Practice Platform

A comprehensive interview preparation platform that combines coding challenges with behavioral interview practice, featuring AI-powered feedback, voice input/output, and realistic interview simulation.

## 🚀 Features

### 💻 Coding Interviews
- **Real-time Code Execution**: Write and test code in multiple programming languages
- **AI-Powered Hints**: Get intelligent suggestions when stuck on problems
- **Test Case Validation**: Automatic testing with comprehensive test cases
- **LeetCode-style Interface**: Familiar coding environment for practice
- **Code Analysis**: AI critiques and suggestions for code improvement

### 🎯 Behavioral Interviews
- **STAR Method Framework**: Structured responses using Situation, Task, Action, Result
- **AI Question Generation**: Dynamic behavioral questions across 8 categories
- **Comprehensive Feedback**: Detailed scoring and improvement suggestions
- **Follow-up Questions**: AI-generated contextual follow-ups based on responses
- **Interview Scoring**: Track performance across multiple questions
- **Multiple Categories**: Leadership, Conflict Resolution, Problem Solving, Communication, Adaptability, Teamwork, Stress Management, Initiative

### 🎤 Voice Features
- **Speech-to-Text Input**: Voice input for hands-free responses
- **AI Voice Agent**: Text-to-speech for realistic interview simulation
- **Voice Controls**: Start, stop, and control speech playback
- **Multiple Voices**: Choose from available system voices
- **Auto-play**: AI automatically speaks questions and feedback

### 🎛️ Advanced Features
- **Real-time Timer**: Track interview duration
- **Progress Tracking**: Monitor performance across sessions
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Modern UI**: Beautiful, intuitive interface with smooth animations

## 🛠️ Tech Stack

### Frontend
- **Next.js**: React framework for server-side rendering and routing
- **React Hooks**: Modern state management and side effects
- **CSS Modules**: Scoped styling for maintainable components
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Web Speech API**: Browser-native speech recognition and synthesis

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **OpenAI GPT-4**: AI-powered question generation, feedback, and follow-ups
- **Node.js**: JavaScript runtime environment

### External APIs
- **OpenAI API**: GPT-4 for intelligent question generation and feedback
- **Web Speech API**: Browser-native speech recognition and synthesis

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/Interview_Agent.git
   cd Interview_Agent
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to `http://localhost:3000`

## 🎯 Usage

### Getting Started
1. Visit the home page to choose your interview type
2. Select between Coding or Behavioral interviews
3. Try the voice demos to test speech features

### Coding Interviews
1. Navigate to `/editor`
2. Select a programming language
3. Write your solution in the code editor
4. Use AI hints when needed
5. Submit and get instant feedback

### Behavioral Interviews
1. Navigate to `/behavioral`
2. Select question categories (Leadership, Problem Solving, etc.)
3. Choose number of questions (3-10)
4. Answer using the STAR method framework
5. Get AI feedback and follow-up questions
6. Use voice input for natural responses

### Voice Features
- **Voice Input Demo**: `/voice-demo` - Test speech-to-text functionality
- **Voice Agent Demo**: `/voice-agent-demo` - Experience AI text-to-speech
- **Voice Toggle**: Enable/disable voice features in behavioral interviews

## 📁 Project Structure

```
Interview_Agent/
├── pages/
│   ├── api/                    # API endpoints
│   │   ├── behavioral-feedback.js
│   │   ├── behavioral-followup.js
│   │   ├── behavioral-questions.js
│   │   ├── critic.js
│   │   ├── execute.js
│   │   ├── hint.js
│   │   ├── question.js
│   │   ├── solve.js
│   │   └── testcases.js
│   ├── behavioral.jsx          # Behavioral interview page
│   ├── editor.jsx              # Coding interview page
│   ├── index.jsx               # Home page
│   ├── voice-demo.jsx          # Voice input demo
│   ├── voice-agent-demo.jsx    # Voice agent demo
│   ├── VoiceAgent.jsx          # Text-to-speech component
│   ├── VoiceInput.jsx          # Speech-to-text component
│   └── *.module.css            # Component styles
├── public/                     # Static assets
├── styles/
│   └── globals.css             # Global styles
├── package.json                # Dependencies and scripts
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── README.md                   # This file
```

## 🔧 API Endpoints

### Behavioral Interview APIs
- `POST /api/behavioral-questions` - Generate behavioral questions
- `POST /api/behavioral-feedback` - Get AI feedback on responses
- `POST /api/behavioral-followup` - Generate follow-up questions

### Coding Interview APIs
- `POST /api/question` - Get coding problems
- `POST /api/execute` - Execute code
- `POST /api/hint` - Get AI hints
- `POST /api/critic` - Get code analysis
- `POST /api/solve` - Get solution
- `POST /api/testcases` - Get test cases

## 🎨 Features in Detail

### AI Voice Agent
- **Natural Speech**: Uses browser's text-to-speech with natural-sounding voices
- **Voice Selection**: Choose from multiple available voices and languages
- **Playback Control**: Start, stop, and control speech playback
- **Auto-play**: Automatically speaks questions and feedback during interviews

### Voice Input
- **Real-time Transcription**: Instant speech-to-text conversion
- **Recording Indicators**: Visual feedback during voice recording
- **Error Handling**: Graceful fallback for unsupported browsers
- **Integration**: Seamlessly integrated with STAR method fields

### Behavioral Interview Flow
1. **Question Generation**: AI creates contextual behavioral questions
2. **STAR Response**: Structured responses using proven framework
3. **AI Feedback**: Comprehensive scoring and improvement suggestions
4. **Follow-up Questions**: Contextual questions based on responses
5. **Voice Integration**: Both input and output voice capabilities

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify**: Static site hosting
- **AWS Amplify**: Full-stack deployment
- **Heroku**: Traditional hosting

## 🔒 Environment Variables

Required environment variables:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Web Speech API for voice capabilities
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first styling

## 📞 Support

For support, email support@interviewpad.com or create an issue in this repository.

---

**Built with ❤️ for interview preparation** 