"""
Research API router.

Handles research-related endpoints following the Tongyi-DeepResearch pattern.
"""

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse

from .models import ResearchRequest, ResearchResponse, convert_langchain_messages_to_messages
from .session import generate_session_id

# Import will be resolved when the router is included in main.py
# This creates a dependency that will be injected
def get_research_agent():
    """Dependency to get the global research agent instance."""
    from main import research_agent
    if not research_agent:
        raise HTTPException(status_code=503, detail="Research agent not initialized")
    return research_agent

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    prefix="/api/research",
    tags=["research"],
    responses={404: {"description": "Not found"}},
)


@router.post("", response_model=ResearchResponse)
async def perform_research(
    request: ResearchRequest,
    research_agent=Depends(get_research_agent)
) -> ResearchResponse:
    """
    Perform deep research on a query.

    This endpoint initiates a research workflow using the multi-agent system
    with access to web search, academic databases, and code execution tools.
    """
    # Generate session ID for request tracing
    session_id = generate_session_id()
    logger.info(f"[SESSION:{session_id}] Starting research for query: {request.query[:100]}...")

    try:
        # Perform research with session tracing
        result = await research_agent.research(
            query=request.query,
            custom_instructions=request.custom_instructions or "",
            session_id=session_id
        )

        # Convert messages to the shared Message model format
        messages = convert_langchain_messages_to_messages(result["messages"], session_id)

        return ResearchResponse(
            success=result["success"],
            final_answer=result.get("final_answer"),
            messages=messages,
            tools_used=result.get("tools_used", []),
            iterations=result.get("iterations", 0),
            is_complete=result.get("is_complete", False),
            error=result.get("error") if not result["success"] else None,
            session_id=session_id
        )

    except Exception as e:
        logger.error(f"[SESSION:{session_id}] Research API error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
