# Interview Agent System

An intelligent, multi-agent system for conducting automated interviews with real-time speech-to-text, question management, and evaluation capabilities.

## System Architecture

The system consists of 8 specialized agents working together:

| Agent | Responsibility |
|-------|----------------|
| **AudioAgent** | Streams raw mic audio from browser via WebRTC/WebSocket |
| **STTAgent** | Uses streaming ASR (OpenAI Whisper) to convert speech to text |
| **QuestionBankAgent** | Manages interview questions and difficulty levels |
| **InterviewerAgent** | Orchestrates the interview flow and timing |
| **FollowUpAgent** | Handles follow-up questions when candidates are stuck |
| **EvaluatorAgent** | Continuously scores responses on various rubrics |
| **FeedbackAgent** | Provides comprehensive feedback at session end |
| **NotificationAgent** | Sends reports via email/Slack and schedules follow-ups |

## Features

- **Real-time Audio Streaming**: WebRTC/WebSocket-based audio capture
- **Live Speech-to-Text**: Streaming Whisper integration for instant transcription
- **Intelligent Question Flow**: Dynamic question selection and follow-ups
- **Real-time Evaluation**: Continuous scoring and feedback
- **Comprehensive Reporting**: Detailed interview summaries and recommendations

## Quick Start

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up Environment Variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Run the Backend**:
   ```bash
   uvicorn app.main:app --reload
   ```

4. **Open the Frontend**:
   Navigate to `http://localhost:8000` in your browser

## Project Structure

```
Interview_Agent/
├── app/
│   ├── agents/           # Individual agent implementations
│   ├── api/             # FastAPI routes and endpoints
│   ├── core/            # Core configuration and utilities
│   ├── models/          # Pydantic models and schemas
│   └── services/        # Business logic and external services
├── frontend/            # JavaScript frontend
├── tests/               # Test files
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

## Development Roadmap

### Phase 1: Basic Setup ✅
- [x] Project structure
- [x] Dependencies setup
- [x] Basic FastAPI server

### Phase 2: Core Agents
- [ ] AudioAgent implementation
- [ ] STTAgent with Whisper integration
- [ ] QuestionBankAgent with hardcoded questions
- [ ] InterviewerAgent orchestration

### Phase 3: Advanced Features
- [ ] FollowUpAgent logic
- [ ] EvaluatorAgent scoring
- [ ] FeedbackAgent reporting
- [ ] NotificationAgent integration

### Phase 4: Frontend & UI
- [ ] WebRTC audio streaming
- [ ] Real-time transcript display
- [ ] Interview progress tracking
- [ ] Results visualization

## Environment Variables

Create a `.env` file with the following variables:

```env
OPENAI_API_KEY=your_openai_api_key
ASSEMBLYAI_API_KEY=your_assemblyai_key
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://user:pass@localhost/db
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details 