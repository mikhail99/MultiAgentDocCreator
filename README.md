# Multi-Agent Document Creator with Tongyi-DeepResearch

A modern full-stack application implementing Tongyi-DeepResearch functionality for AI-powered document generation. This system combines React frontend with a LangGraph-based backend featuring real multi-agent research and document creation workflows.

## Features

- **Real AI-Powered Research**: Integration with Tongyi-DeepResearch architecture using LangGraph agents
- **Advanced Research Tools**: Web search, Google Scholar integration, webpage content extraction, Python code execution
- **Template-Based Generation**: Multiple document templates (academic reviews, business reports, technical docs)
- **Multi-Agent Workflow**: LangGraph-powered agent orchestration with real tool usage
- **Interactive Chat Interface**: Live conversation with agents showing reasoning and tool execution
- **Live Document Preview**: Real-time document evolution during generation
- **Refinement Capabilities**: AI-powered document refinement and editing
- **Agent Configuration**: Customizable LLM settings (creativity, rigor, analysis depth)

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **UI Framework**: Tailwind CSS with custom components
- **Icons**: Lucide React
- **Build Tool**: Vite

### Backend
- **FastAPI**: High-performance async web framework
- **LangGraph**: Agent orchestration and state management
- **LangChain**: LLM integration and tool calling
- **OpenAI GPT-4**: Primary research LLM
- **Research Tools**: Custom implementations for web search, scholar search, content extraction

## Project Structure

```
├── src/                         # React frontend application (Vite)
│   ├── components/
│   │   ├── document-gen/        # Document generation components
│   │   │   ├── AgentSettings.tsx
│   │   │   ├── ChatArea.tsx
│   │   │   ├── ClarificationQuestions.tsx
│   │   │   ├── DocumentViewer.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── mockBackend.tsx  # Updated to use real API
│   │   │   ├── RefinementInput.tsx
│   │   │   ├── TaskInput.tsx
│   │   │   └── TemplateSelector.tsx
│   │   └── ui/                  # Reusable UI components
│   ├── lib/
│   │   ├── api.ts               # API client for backend communication
│   │   └── utils.ts             # Utility functions
│   ├── Pages/
│   │   └── DocumentGenerator.tsx # Main application page
│   ├── App.tsx
│   ├── main.tsx                 # Application entry point
│   └── index.css
├── backend/                     # Python FastAPI backend
│   ├── agents/
│   │   └── research_agent.py    # LangGraph research agent
│   ├── tools/                   # Research tools
│   │   ├── web_search.py
│   │   ├── web_visit.py
│   │   ├── scholar_search.py
│   │   └── python_interpreter.py
│   ├── llm/
│   │   └── openai_client.py     # OpenAI integration
│   ├── config/
│   │   └── settings.py          # Configuration management
│   ├── main.py                  # FastAPI application
│   ├── requirements.txt         # Python dependencies
│   └── README.md               # Backend documentation
├── index.html                   # Vite entry point
├── package.json                 # Node.js dependencies and scripts
└── start.sh                     # Development startup script
```

## Key Components

- **DocumentGenerator**: Main application component managing the document creation workflow
- **ChatArea**: Interactive chat interface showing agent conversations and user inputs
- **DocumentView**: Live preview of the generated document
- **mockBackend**: Simulated multi-agent workflow with realistic agent interactions and tool usage

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- OpenAI API key

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MultiAgentDocCreator
   ```

2. **Set up the backend**
   ```bash
   # Install Python dependencies
   cd backend
   pip install -r requirements.txt

   # Configure environment variables
   cp config/env.example .env
   # Edit .env and add your OPENAI_API_KEY

   cd ..
   ```

3. **Set up the frontend**
   ```bash
   npm install
   ```

4. **Start both servers**
   ```bash
   # Option 1: Use the startup script
   ./start.sh

   # Option 2: Manual startup
   # Terminal 1 - Backend
   npm run backend:dev

   # Terminal 2 - Frontend
   npm run dev
   ```

5. **Open your browser**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:8000`
   - API Docs: `http://localhost:8000/docs`

## Usage

1. **Select a Template**: Choose from academic reviews, business reports, or technical documentation
2. **Describe Your Task**: Provide detailed requirements for your document
3. **Answer Clarification Questions**: Help the AI agents understand your specific needs
4. **Watch Real Research**: Observe the LangGraph agent perform web searches, visit pages, query Google Scholar, and execute Python code
5. **Review Generated Content**: See AI-generated documents with real research backing
6. **Refine & Iterate**: Request changes and watch the agent refine the document

## Real AI Capabilities

Unlike traditional chatbots, this system implements Tongyi-DeepResearch's multi-agent architecture:

- **Web Search**: Real Google searches with result summarization
- **Content Extraction**: Visits webpages and extracts relevant information
- **Academic Research**: Queries Google Scholar for peer-reviewed sources
- **Code Execution**: Runs Python code in a sandboxed environment for data analysis
- **Iterative Research**: Continues investigation until comprehensive answers are found
- **Source Citations**: Includes proper attribution and references

## Document Templates

- **Academic Review**: Comprehensive literature reviews with citations and analysis
- **Business Report**: Professional business reports with metrics and recommendations
- **Technical Documentation**: API docs, guides, and technical specifications

## Agent Architecture

The system uses a single **Research Agent** powered by LangGraph that orchestrates multiple tools:

- **Web Search Tool**: Performs Google searches and summarizes results
- **Web Visit Tool**: Extracts content from specific webpages
- **Google Scholar Tool**: Searches academic literature and citations
- **Python Interpreter Tool**: Executes code for data analysis and computation

The agent follows Tongyi-DeepResearch patterns:
1. Analyzes queries and plans research strategy
2. Uses tools iteratively to gather comprehensive information
3. Synthesizes findings into coherent documents
4. Provides final answers with proper citations

## API Reference

- `POST /api/research` - Direct research queries
- `POST /api/clarification` - Generate clarification questions
- `POST /api/generate-document` - Full document generation workflow
- `GET /health` - Service health check

## Configuration

Key settings in `backend/.env`:
- `OPENAI_API_KEY`: Required for LLM functionality
- `MAX_LLM_CALLS`: Research iteration limit (default: 50)
- `REASONING_ENABLED`: Show agent thinking traces
- `SEARCH_MAX_RESULTS`: Number of search results to process

## Contributing

This project implements real AI research capabilities inspired by Alibaba's Tongyi-DeepResearch. Contributions welcome for:

- Additional research tools
- New document templates
- Enhanced agent reasoning
- Performance optimizations
- UI/UX improvements

## License

MIT License - see LICENSE file for details.

## Future Enhancements

- **Streaming Responses**: Real-time agent activity updates
- **Document Export**: PDF, Word, and other formats
- **File Upload**: Process user-uploaded documents and data
- **Custom Templates**: User-defined document structures
- **Multi-Language Support**: Research in multiple languages
- **Advanced Tools**: Integration with more research APIs
- **Collaborative Features**: Multi-user document creation
- **Caching & Optimization**: Improve performance for repeated queries

## Acknowledgments

- **Tongyi-DeepResearch**: Inspiration for the multi-agent research architecture
- **LangGraph**: Agent orchestration framework
- **LangChain**: LLM integration and tool calling
- **OpenAI**: GPT-4 research capabilities
