# Tongyi-DeepResearch Backend

A LangGraph-powered backend implementing Tongyi-DeepResearch functionality for multi-agent document generation.

## Features

- **LangGraph Agent Orchestration**: Multi-agent workflow for research and document generation
- **Research Tools**: Web search, page visiting, Google Scholar integration, Python code execution
- **OpenAI Integration**: GPT-4 powered research assistant with tool calling
- **FastAPI Backend**: RESTful API for frontend integration
- **Real-time Processing**: Streaming responses for live agent activity

## Setup

1. **Install Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Environment Configuration**
   ```bash
   cp config/env.example .env
   # Edit .env with your OpenAI API key and other settings
   ```

3. **Run the Server**
   ```bash
   python main.py
   ```

   The API will be available at `http://localhost:8000`

## API Endpoints

- `GET /health` - Health check
- `POST /api/research` - Perform deep research
- `POST /api/clarification` - Get clarification questions
- `POST /api/generate-document` - Generate documents

## Architecture

### Core Components

1. **Research Agent** (`agents/research_agent.py`)
   - LangGraph state machine for research workflow
   - Coordinates multiple tools and reasoning steps
   - Handles iterative research process

2. **Research Tools** (`tools/`)
   - `WebSearchTool`: Google web search integration
   - `WebVisitTool`: Webpage content extraction
   - `ScholarSearchTool`: Google Scholar academic search
   - `PythonInterpreterTool`: Safe Python code execution

3. **LLM Integration** (`llm/openai_client.py`)
   - Enhanced OpenAI client with research prompts
   - Tool calling support
   - Streaming responses

4. **API Layer** (`main.py`)
   - FastAPI application
   - CORS enabled for frontend integration
   - Request/response models

### Research Workflow

1. **Initialization**: Set up research context and system prompts
2. **Thinking**: LLM analyzes query and decides on research strategy
3. **Tool Execution**: Calls appropriate tools (search, visit, scholar, python)
4. **Iteration**: Continues research until sufficient information gathered
5. **Final Answer**: Provides comprehensive response in `<answer>` tags

## Configuration

Key settings in `.env`:

- `OPENAI_API_KEY`: Your OpenAI API key
- `MAX_LLM_CALLS`: Maximum reasoning iterations (default: 50)
- `REASONING_ENABLED`: Enable reasoning traces (default: true)
- `TEMPERATURE`: LLM creativity (default: 0.85)

## Development

```bash
# Install dev dependencies
pip install -r requirements.txt

# Run with auto-reload
python main.py

# Test API
curl http://localhost:8000/health
```

## Integration

The backend integrates with the React frontend through:

- RESTful API calls
- Real-time message streaming (planned)
- Tool execution feedback
- Document generation workflows

## License

MIT License
