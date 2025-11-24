import logging
import os
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .agents.search_agent import SearchAgent
from .llm.oai import TextChatAtOAI
from .tools.search import Search
from .tools.visit import Visit
from .tools.scholar import Scholar
from .tools.tool_python import PythonInterpreter
from .config.settings import settings
from .api import research_router, clarification_router, documents_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global research agent instance - accessed by router dependencies
research_agent = None


def create_qwen_research_agent():
    """Create and configure the Qwen-Agent SearchAgent."""

    # Configure LLM using our settings
    llm_cfg = TextChatAtOAI({
        'model': settings.openai_model_name or os.getenv("DR_MODEL_NAME", "qwen-max"),
        'model_type': 'oai',
        'model_server': settings.openai_base_url or os.getenv("DR_MODEL_SERVER", ""),
        'api_key': settings.openai_api_key or os.getenv("DR_MODEL_API_KEY", ""),
        'generate_cfg': {
            'fncall_prompt_type': 'nous',
            'temperature': 0.85,
            'top_p': 0.95,
            'top_k': -1,
            'presence_penalty': 1.1,
            'max_tokens': 32768,
            'stream_options': {
                'include_usage': True,
            },
            'timeout': 3000
        },
    })

    def make_system_prompt():
        """Create the system prompt for the research agent."""
        system_message = """You are a deep research assistant. Your core function is to conduct thorough, multi-source investigations into any topic. You must handle both broad, open-domain inquiries and queries within specialized academic fields. For every request, synthesize information from credible, diverse sources to deliver a comprehensive, accurate, and objective response. When you have gathered sufficient information and are ready to provide the definitive response, you must enclose the entire final answer within <answer></answer> tags.

"""
        return system_message

    # Initialize tools
    tools = ['search', 'visit', 'google_scholar', 'PythonInterpreter']

    # Create the SearchAgent
    agent = SearchAgent(
        llm=llm_cfg,
        function_list=tools,
        system_message="",
        name='Tongyi DeepResearch',
        description="I am Tongyi DeepResearch, a leading open-source Deep Research Agent, welcome to try!",
        extra={
            'reasoning': settings.reasoning_enabled,
            'max_llm_calls': settings.max_llm_calls,
        },
        make_system_prompt=make_system_prompt,
        custom_user_prompt=''
    )

    return agent


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    global research_agent

    # Startup
    logger.info("Starting Qwen-Agent Tongyi-DeepResearch API server")
    research_agent = create_qwen_research_agent()

    yield

    # Shutdown
    logger.info("Shutting down Qwen-Agent Tongyi-DeepResearch API server")


# Create FastAPI app
app = FastAPI(
    title="Qwen-Agent Tongyi-DeepResearch API",
    description="Multi-agent document creation with deep research capabilities using Qwen-Agent",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # React dev server
        "http://localhost:5173",   # Vite dev server (default)
        "http://localhost:5174",   # Vite dev server (current)
        "http://127.0.0.1:3000",   # Alternative localhost
        "http://127.0.0.1:5173",   # Alternative localhost
        "http://127.0.0.1:5174",   # Alternative localhost
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "qwen-agent-backend"}

# Include routers
app.include_router(research_router)
app.include_router(clarification_router)
app.include_router(documents_router)

# Error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,  # Different port from the original backend
        reload=True
    )
