"""
Documents API router for Qwen-Agent backend.

Handles document generation endpoints.
"""

import logging
from typing import Optional, List

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse

from .models import DocumentGenerationRequest, ResearchResponse, Message, MessageType
from .session import generate_session_id
from qwen_agent.llm.schema import Message as QwenMessage, USER, SYSTEM
from agents.search_agent import SearchAgent

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
    prefix="/api/generate-document",
    tags=["documents"],
    responses={404: {"description": "Not found"}},
)


def convert_qwen_message_to_api(qwen_message, session_id: str) -> Message:
    """Convert qwen-agent Message format to our API Message format."""
    role_map = {
        SYSTEM: MessageType.SYSTEM,
        USER: MessageType.USER,
        'assistant': MessageType.AGENT,
        'function': MessageType.TOOL,
    }

    message_type = MessageType.AGENT  # default
    if hasattr(qwen_message, 'role'):
        message_type = role_map.get(qwen_message.role, MessageType.AGENT)

    content = ""
    if hasattr(qwen_message, 'content'):
        if isinstance(qwen_message.content, str):
            content = qwen_message.content
        elif isinstance(qwen_message.content, list):
            for item in qwen_message.content:
                if hasattr(item, 'text'):
                    content += item.text
                else:
                    content += str(item)

    return Message(
        id=f"msg_{session_id}_{hash(content)}",
        type=message_type,
        content=content,
        agent="qwen-agent"
    )


@router.post("", response_model=ResearchResponse)
async def generate_document(
    request: DocumentGenerationRequest,
    research_agent=Depends(get_research_agent)
) -> ResearchResponse:
    """
    Generate a document using the Qwen-Agent SearchAgent.

    This endpoint creates a comprehensive research-based document using the
    specified template, task, and clarification answers.
    """
    # Generate session ID for request tracing
    session_id = generate_session_id()
    logger.info(f"[SESSION:{session_id}] Generating document for template: {request.template_id}")

    try:
        # Build the document generation query
        query = f"""Generate a comprehensive document based on the following requirements:

Template: {request.template_id}
Task: {request.task}

Clarification Answers:
"""

        if request.answers:
            for key, value in request.answers.items():
                query += f"- {key}: {value}\n"

        query += """

Please conduct thorough research and generate a high-quality document that follows the template format and addresses all requirements. Include relevant data, analysis, and insights."""

        # Convert to qwen-agent message format
        qwen_messages = [QwenMessage(role=USER, content=query)]

        # Collect all messages from the agent
        all_messages: List[Message] = []
        final_response = None

        # Run the SearchAgent
        for response_batch in research_agent._run(messages=qwen_messages):
            for qwen_msg in response_batch:
                api_msg = convert_qwen_message_to_api(qwen_msg, session_id)
                all_messages.append(api_msg)

            if response_batch:
                final_response = response_batch

        # Extract final answer
        final_answer = None
        tools_used = ["search", "visit", "google_scholar", "PythonInterpreter"]

        for msg in all_messages:
            if msg.type == MessageType.AGENT and not msg.toolName and len(msg.content) > 100:
                final_answer = msg.content
                break

        return ResearchResponse(
            success=True,
            final_answer=final_answer,
            messages=all_messages,
            tools_used=tools_used,
            iterations=1,
            is_complete=True,
            session_id=session_id
        )

    except Exception as e:
        logger.error(f"[SESSION:{session_id}] Document generation API error: {e}")
        raise HTTPException(status_code=500, detail=str(e))