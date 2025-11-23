"""
Documents API router.

Handles document generation endpoints.
"""

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends

from .models import DocumentGenerationRequest, ResearchResponse, convert_langchain_messages_to_messages
from .session import generate_session_id
from config.templates import get_template_display_name

# Import will be resolved when the router is included in main.py
def get_research_agent():
    """Dependency to get the global research agent instance."""
    from main import research_agent
    if not research_agent:
        raise HTTPException(status_code=503, detail="Research agent not initialized")
    return research_agent

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    prefix="/api/generate-document",
    tags=["documents"],
    responses={404: {"description": "Not found"}},
)


@router.post("", response_model=ResearchResponse)
async def generate_document(
    request: DocumentGenerationRequest,
    research_agent=Depends(get_research_agent)
) -> ResearchResponse:
    """
    Generate a document using the research agent.

    This endpoint creates structured documents by combining template requirements,
    user clarification answers, and deep research capabilities.
    """
    try:
        # Format the query for document generation
        template_name = get_template_display_name(request.template_id)
        answers_text = "\n".join([f"{k}: {v}" for k, v in request.answers.items()])

        full_query = f"""Generate a {template_name} document.

Task: {request.task}

Clarification Answers:
{answers_text}

Please create a comprehensive document following the template structure and incorporating research from credible sources."""

        custom_instructions = f"""
Template: {request.template_id}
Focus on creating a well-structured document with proper formatting and citations.
Use the clarification answers to guide the depth and focus of the research.
Ensure the document follows {template_name} conventions and best practices."""

        # Generate session ID for request tracing
        session_id = generate_session_id()
        logger.info(f"[SESSION:{session_id}] Generating document for template: {request.template_id}")

        # Perform research/document generation with session tracing
        result = await research_agent.research(
            query=full_query,
            custom_instructions=custom_instructions,
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
        logger.error(f"Document generation API error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
