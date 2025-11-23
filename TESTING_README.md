# Backend Testing with Ollama

This guide helps you test the MultiAgentDocCreator backend using Ollama with qwen3:4b and local tools.

## Prerequisites

1. **Install Ollama**: Download from https://ollama.ai/
2. **Pull qwen3:4b model**:
   ```bash
   ollama pull qwen3:4b
   ```
3. **Start Ollama server** (usually runs automatically)
4. **Install Python dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

## Quick Test

1. **Set environment variables** or create a `.env` file:
   ```bash
   cp test_env.example .env
   # Edit .env if needed
   ```

2. **Run the test script**:
   ```bash
   python test_backend.py
   ```

This will test the backend with:
- Ollama qwen3:4b model
- Local file search tool
- Python interpreter tool
- A simple research query

## Manual Testing

### Start the Backend Server

```bash
cd backend
python -m main
```

The server will start on http://localhost:8000

### Test Endpoints

#### Health Check
```bash
curl http://localhost:8000/health
```

#### Research API
```bash
curl -X POST http://localhost:8000/api/research \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Find all .py files in the current directory",
    "custom_instructions": "Use the local file search tool"
  }'
```

#### Clarification Questions
```bash
curl -X POST http://localhost:8000/api/clarification \
  -H "Content-Type: application/json" \
  -d '{
    "template_id": "technical-doc",
    "task": "Create documentation for our Python project"
  }'
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LLM_PROVIDER` | "ollama" or "openai" | "openai" |
| `OLLAMA_MODEL` | Ollama model name | "qwen3:4b" |
| `OLLAMA_BASE_URL` | Ollama server URL | "http://localhost:11434" |
| `MAX_LLM_CALLS` | Max research iterations | 50 |

### Test Mode

The factory supports `test_mode=True` which uses only local tools:
- `LocalFileSearchTool` - Search files locally
- `PythonInterpreterTool` - Execute Python code safely

## Troubleshooting

### Ollama Connection Issues
- Ensure Ollama is running: `ollama list`
- Check server URL: `curl http://localhost:11434/api/tags`
- Verify model is pulled: `ollama pull qwen3:4b`

### Import Errors
- Install dependencies: `pip install -r backend/requirements.txt`
- Check Python path includes backend directory

### Tool Errors
- Local file search should work without issues
- Python interpreter has safety restrictions (no network, limited libraries)

## Logs

Check the console output for detailed logs including session IDs for debugging.
