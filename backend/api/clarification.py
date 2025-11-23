"""
Clarification API router.

Handles clarification question generation for document templates.
"""

import logging
from fastapi import APIRouter, HTTPException

from .models import ClarificationRequest, ClarificationResponse
from config.templates import get_clarification_questions

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    prefix="/api/clarification",
    tags=["clarification"],
    responses={404: {"description": "Not found"}},
)


@router.post("", response_model=ClarificationResponse)
async def get_clarification_questions_endpoint(request: ClarificationRequest) -> ClarificationResponse:
    """
    Generate clarification questions based on template and task.

    This endpoint analyzes the selected template and task description to generate
    relevant questions that help refine the document generation requirements.
    """
    try:
        logger.info(f"Generating clarification questions for template: {request.template_id}")

        # Get questions for the template
        questions = get_clarification_questions(request.template_id)

        logger.info(f"Generated {len(questions)} clarification questions")

        return ClarificationResponse(questions=questions)

    except Exception as e:
        logger.error(f"Clarification API error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
