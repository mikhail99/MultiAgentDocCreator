# Qwen-Agent Backend for Tongyi-DeepResearch

This backend implements the research functionality using the original Tongyi-DeepResearch SearchAgent from Alibaba, integrated with our existing FastAPI architecture.

## Architecture

- **Agent**: Uses `SearchAgent` from Tongyi-DeepResearch (qwen-agent framework)
- **Tools**: Web search, academic search, code execution, web browsing
- **API**: FastAPI with REST endpoints compatible with our React frontend
- **Configuration**: Uses our `settings.py` with fallback to Tongyi env vars

## Key Components

- `agents/search_agent.py` - The core research agent (copied from Tongyi)
- `llm/oai.py` - OpenAI-compatible LLM client
- `tools/` - Research tools (search, scholar, visit, python interpreter)
- `api/research.py` - FastAPI research endpoint using SearchAgent
- `main.py` - FastAPI application entry point

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment variables in `.env`:
```bash
OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL_NAME=gpt-4-turbo

# Alternative Tongyi env vars (fallback)
DR_MODEL_NAME=qwen-max
DR_MODEL_API_KEY=your_qwen_key
DR_MODEL_SERVER=https://dashscope.aliyuncs.com/api/v1
```

3. Run the backend:
```bash
python main.py
```

The server will start on port 8001 (different from the original backend on 8000).

## API Endpoints

- `POST /api/research` - Perform research using SearchAgent
- `GET /health` - Health check

## Integration with Frontend

The API endpoints are designed to be compatible with our existing React frontend (`src/lib/api.ts`). The qwen-agent backend maintains the same request/response schemas as the LangGraph backend.

## Differences from LangGraph Backend

- **Agent Logic**: Uses Tongyi's SearchAgent instead of LangGraph workflows
- **Tool Integration**: Direct qwen-agent tool integration
- **Message Format**: Converts between qwen-agent Message format and our API Message format
- **Streaming**: Currently returns complete results (streaming can be added later)

## Development

To switch between backends:
- LangGraph backend: `cd backend && python main.py` (port 8000)
- Qwen-Agent backend: `cd backend-qwen && python main.py` (port 8001)

Update `src/lib/api.ts` VITE_API_URL to point to the desired backend.
