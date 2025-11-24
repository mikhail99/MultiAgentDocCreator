"""
Clarification API router for Qwen-Agent backend.

Handles clarification question generation for document templates.
"""

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse

from .models import ClarificationRequest, ClarificationResponse
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
    prefix="/api/clarification",
    tags=["clarification"],
    responses={404: {"description": "Not found"}},
)


@router.post("", response_model=ClarificationResponse)
async def get_clarification_questions(
    request: ClarificationRequest,
    research_agent=Depends(get_research_agent)
) -> ClarificationResponse:
    """
    Generate clarification questions for a document template and task.

    This endpoint analyzes the template type and task description to generate
    relevant questions that help gather necessary information for document generation.
    """
    # Generate session ID for request tracing
    session_id = generate_session_id()
    logger.info(f"[SESSION:{session_id}] Generating clarification questions for template: {request.template_id}")

    try:
        # Template-specific clarification questions
        template_questions = {
            'academic-review': [
                'What specific time period should the literature review cover? (e.g., last 5 years, 2020-2024)',
                'Are there particular research databases or sources you want prioritized? (e.g., IEEE, PubMed, arXiv)',
                'What level of technical depth is required? (e.g., suitable for experts, general audience, or mixed)'
            ],
            'business-report': [
                'What time period should this report cover? (e.g., Q4 2024, Full Year 2024)',
                'Who is the primary audience for this report? (e.g., board members, investors, internal team)',
                'Are there specific metrics or KPIs that must be included?'
            ],
            'technical-doc': [
                'What programming languages or frameworks should the documentation cover?',
                'Should the documentation include code examples and tutorials?',
                'What level of technical expertise should be assumed for the readers?'
            ],
            'research-paper': [
                'What research methodology should be emphasized?',
                'Are there specific research questions or hypotheses to address?',
                'What citation style should be used?'
            ],
            'market-analysis': [
                'What geographic regions should the analysis cover?',
                'What competitor analysis depth is required?',
                'Should the analysis include market sizing and forecasting?'
            ],
            'content-brief': [
                'What is the target audience demographics and psychographics?',
                'Are there specific brand voice or tone requirements?',
                'What content distribution channels are planned?'
            ]
        }

        # Get questions for the template, or use generic ones
        questions = template_questions.get(request.template_id, [
            'What is the primary goal of this document?',
            'Who is the intended audience?',
            'Are there specific sections or topics that must be included?'
        ])

        return ClarificationResponse(questions=questions)

    except Exception as e:
        logger.error(f"[SESSION:{session_id}] Clarification API error: {e}")
        raise HTTPException(status_code=500, detail=str(e))