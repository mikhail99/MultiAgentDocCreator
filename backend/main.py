import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from agents.factory import create_research_agent
from config.settings import settings
from api import research_router, clarification_router, documents_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global research agent instance - accessed by router dependencies
research_agent = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    global research_agent

    # Startup
    logger.info("Starting Tongyi-DeepResearch API server")
    research_agent = create_research_agent(
        max_llm_calls=settings.max_llm_calls,
        reasoning=settings.reasoning_enabled
    )

    yield

    # Shutdown
    logger.info("Shutting down Tongyi-DeepResearch API server")


# Create FastAPI app
app = FastAPI(
    title="Tongyi-DeepResearch API",
    description="Multi-agent document creation with deep research capabilities",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(research_router)
app.include_router(clarification_router)
app.include_router(documents_router)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "tongyi-deepresearch-api"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
        log_level="info"
    )
