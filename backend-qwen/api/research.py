"""
Research API router for Qwen-Agent backend.

Handles research-related endpoints using Tongyi-DeepResearch SearchAgent.
"""

import logging
import uuid
import json
from typing import Optional, List

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse, StreamingResponse
import asyncio

from .models import ResearchRequest, ResearchResponse, Message, MessageType
from .session import generate_session_id
from qwen_agent.llm.schema import Message as QwenMessage, USER, SYSTEM, ASSISTANT, FUNCTION
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
    prefix="/api/research",
    tags=["research"],
    responses={404: {"description": "Not found"}},
)


def convert_api_message_to_qwen(message: Message) -> QwenMessage:
    """Convert our API Message format to qwen-agent Message format."""
    role_map = {
        MessageType.SYSTEM: SYSTEM,
        MessageType.USER: USER,
        MessageType.AGENT: ASSISTANT,
        MessageType.TOOL: FUNCTION,
    }

    role = role_map.get(message.type, USER)
    content = message.content

    # Handle tool calls
    if message.tool_calls:
        # For tool calls, we need to format them properly
        content = f"Tool call: {message.tool_calls}"

    return QwenMessage(
        role=role,
        content=content,
        name=message.toolName if message.type == MessageType.TOOL else None
    )


def convert_qwen_message_to_api(qwen_message: QwenMessage, session_id: str) -> Message:
    """Convert qwen-agent Message format to our API Message format."""
    role_map = {
        SYSTEM: MessageType.SYSTEM,
        USER: MessageType.USER,
        ASSISTANT: MessageType.AGENT,
        FUNCTION: MessageType.TOOL,
    }

    message_type = role_map.get(qwen_message.role, MessageType.AGENT)

    # Extract content - qwen-agent messages can have complex content structures
    content = ""
    if isinstance(qwen_message.content, str):
        content = qwen_message.content
    elif isinstance(qwen_message.content, list):
        # Handle list content (common in qwen-agent)
        for item in qwen_message.content:
            if hasattr(item, 'text'):
                content += item.text
            elif isinstance(item, dict) and 'text' in item:
                content += item['text']
            else:
                content += str(item)

    # Handle tool results
    tool_name = None
    tool_result = None
    if qwen_message.role == FUNCTION and qwen_message.name:
        tool_name = qwen_message.name
        tool_result = content

    return Message(
        id=str(uuid.uuid4()),
        type=message_type,
        content=content,
        agent="qwen-agent",
        toolName=tool_name,
        result=tool_result,
        role=qwen_message.role
    )


@router.post("", response_model=ResearchResponse)
async def perform_research(
    request: ResearchRequest,
    research_agent=Depends(get_research_agent)
) -> ResearchResponse:
    """
    Perform deep research on a query using Qwen-Agent SearchAgent.

    This endpoint initiates a research workflow using the Tongyi-DeepResearch
    SearchAgent with access to web search, academic databases, and code execution tools.
    """
    # Generate session ID for request tracing
    session_id = generate_session_id()
    logger.info(f"[SESSION:{session_id}] Starting qwen-agent research for query: {request.query[:100]}...")

    try:
        # Convert our API request to qwen-agent message format
        qwen_messages = [
            QwenMessage(role=USER, content=request.query)
        ]

        # Add custom instructions if provided
        if request.custom_instructions:
            qwen_messages.insert(0, QwenMessage(
                role=SYSTEM,
                content=request.custom_instructions
            ))

        # Collect all messages from the agent
        all_messages: List[Message] = []
        final_response = None

        # Run the SearchAgent - it returns an iterator yielding intermediate results
        for response_batch in research_agent._run(messages=qwen_messages):
            # Convert the latest batch to our message format
            for qwen_msg in response_batch:
                api_msg = convert_qwen_message_to_api(qwen_msg, session_id)
                all_messages.append(api_msg)

            # Keep track of the final complete response
            if response_batch:
                final_response = response_batch

        # Extract final answer from the last assistant message
        final_answer = None
        tools_used = []

        for msg in all_messages:
            if msg.type == MessageType.AGENT and not msg.toolName:
                final_answer = msg.content
            elif msg.type == MessageType.TOOL and msg.toolName:
                if msg.toolName not in tools_used:
                    tools_used.append(msg.toolName)

        return ResearchResponse(
            success=True,
            final_answer=final_answer,
            messages=all_messages,
            tools_used=tools_used,
            iterations=1,  # Qwen agent handles this internally
            is_complete=True,
            session_id=session_id
        )

    except Exception as e:
        logger.error(f"[SESSION:{session_id}] Qwen-agent research API error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def stream_research_results(request: ResearchRequest, research_agent, session_id: str):
    """Generator function to stream research results as Server-Sent Events."""

    try:
        # Convert our API request to qwen-agent message format
        qwen_messages = [
            QwenMessage(role=USER, content=request.query)
        ]

        # Add custom instructions if provided
        if request.custom_instructions:
            qwen_messages.insert(0, QwenMessage(
                role=SYSTEM,
                content=request.custom_instructions
            ))

        # Track sources from tool outputs
        sources = []

        # Run the SearchAgent - it returns an iterator yielding intermediate results
        for response_batch in research_agent._run(messages=qwen_messages):
            # Convert each message batch to our API format
            for qwen_msg in response_batch:
                api_msg = convert_qwen_message_to_api(qwen_msg, session_id)

                # Extract sources from tool outputs
                if api_msg.type == MessageType.TOOL and api_msg.toolName in ['search', 'visit']:
                    extracted_sources = extract_sources_from_tool_output(api_msg.result or "")
                    sources.extend(extracted_sources)
                    api_msg.sources = extracted_sources

                # Stream the message as SSE
                event_data = {
                    "type": "message",
                    "data": api_msg.dict() if hasattr(api_msg, 'dict') else api_msg.__dict__
                }
                yield f"data: {json.dumps(event_data)}\n\n"

                # Small delay to prevent overwhelming the client
                await asyncio.sleep(0.1)

        # Send completion event with final summary
        final_data = {
            "type": "complete",
            "data": {
                "session_id": session_id,
                "sources": sources,
                "tools_used": ["search", "visit", "google_scholar", "PythonInterpreter"]  # Based on agent config
            }
        }
        yield f"data: {json.dumps(final_data)}\n\n"

    except Exception as e:
        logger.error(f"[SESSION:{session_id}] Streaming error: {e}")
        error_data = {
            "type": "error",
            "data": {
                "error": str(e),
                "session_id": session_id
            }
        }
        yield f"data: {json.dumps(error_data)}\n\n"


def extract_sources_from_tool_output(tool_output: str) -> List[dict]:
    """Extract URLs and titles from tool outputs to create sources."""
    sources = []

    if not tool_output:
        return sources

    try:
        # Try to parse as JSON first (common for search results)
        try:
            parsed = json.loads(tool_output)
            if isinstance(parsed, list):
                for item in parsed:
                    if isinstance(item, dict):
                        url = item.get('url') or item.get('link')
                        title = item.get('title') or item.get('name')
                        if url and title:
                            sources.append({
                                "url": url,
                                "title": title,
                                "type": "search_result"
                            })
        except json.JSONDecodeError:
            # If not JSON, try to extract URLs with regex
            import re
            url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
            urls = re.findall(url_pattern, tool_output)

            for url in urls:
                # Try to extract title from surrounding text
                title_match = re.search(rf'\[([^\]]+)\]\s*\(\s*{re.escape(url)}\s*\)', tool_output)
                if title_match:
                    title = title_match.group(1)
                else:
                    # Fallback: use domain as title
                    domain = re.search(r'https?://(?:www\.)?([^/]+)', url)
                    title = domain.group(1) if domain else url

                sources.append({
                    "url": url,
                    "title": title,
                    "type": "web_link"
                })

    except Exception as e:
        logger.warning(f"Error extracting sources: {e}")

    return sources


@router.post("/stream", response_class=StreamingResponse)
async def perform_research_stream(
    request: ResearchRequest,
    research_agent=Depends(get_research_agent)
):
    """
    Perform deep research with real-time streaming using Qwen-Agent SearchAgent.

    This endpoint streams intermediate results as Server-Sent Events, allowing
    the frontend to display thinking, tool calls, and progress in real-time.
    """
    # Generate session ID for request tracing
    session_id = generate_session_id()
    logger.info(f"[SESSION:{session_id}] Starting streaming qwen-agent research for query: {request.query[:100]}...")

    return StreamingResponse(
        stream_research_results(request, research_agent, session_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Cache-Control",
        }
    )
