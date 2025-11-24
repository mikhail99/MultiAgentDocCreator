"""
Shared Pydantic models for API endpoints.

These models define the request/response contracts used across all API routers.
The Message model is designed to be compatible with the frontend Message interface.
"""

from typing import Dict, List, Any, Optional
from pydantic import BaseModel
from enum import Enum


class MessageType(str, Enum):
    """Message types that align with frontend expectations."""
    SYSTEM = "system"
    USER = "user"
    AGENT = "agent"
    THINKING = "thinking"
    TOOL = "tool"
    DOCUMENT_UPDATE = "document-update"


class MessageStatus(str, Enum):
    """Message processing status."""
    PROCESSING = "processing"
    COMPLETE = "complete"


class Message(BaseModel):
    """
    Shared Message model for frontend-backend communication.

    This model defines the contract between frontend and backend for message passing.
    Frontend components should use this structure for consistency.

    Frontend Message Interface (TypeScript):
    ```typescript
    interface Message {
      id: string;
      type: 'system' | 'user' | 'agent' | 'thinking' | 'tool' | 'document-update';
      agent?: string;
      content: string;
      status?: 'processing' | 'complete';
      questions?: string[];
      answers?: Record<string, string>;
      files?: File[];
      toolName?: string;
      parameters?: Record<string, any>;
      result?: string;
      role?: string;
      tool_calls?: any[];
    }
    ```
    """
    id: str
    type: MessageType
    content: str
    agent: Optional[str] = None
    status: Optional[MessageStatus] = None
    questions: Optional[List[str]] = None
    answers: Optional[Dict[str, str]] = None
    files: Optional[List[Dict[str, Any]]] = None
    toolName: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    result: Optional[str] = None
    role: Optional[str] = None  # For LangChain compatibility
    tool_calls: Optional[List[Dict[str, Any]]] = None  # For LangChain compatibility
    sources: Optional[List[Dict[str, Any]]] = None  # Extracted sources from tool outputs


class ResearchRequest(BaseModel):
    """Request model for research operations."""
    query: str
    custom_instructions: Optional[str] = ""
    agent_settings: Optional[Dict[str, Any]] = None


class ResearchResponse(BaseModel):
    """Response model for research operations."""
    success: bool
    final_answer: Optional[str] = None
    messages: List[Message] = []  # Now uses the strict Message model
    tools_used: List[str] = []
    iterations: int = 0
    is_complete: bool = False
    error: Optional[str] = None
    session_id: Optional[str] = None  # Added for request tracing


class ClarificationRequest(BaseModel):
    """Request model for clarification question generation."""
    template_id: str
    task: str


class ClarificationResponse(BaseModel):
    """Response model for clarification questions."""
    questions: List[str]


class DocumentGenerationRequest(BaseModel):
    """Request model for document generation."""
    template_id: str
    task: str
    answers: Dict[str, str]
    agent_settings: Optional[Dict[str, Any]] = None


def convert_langchain_messages_to_messages(messages, session_id: str) -> List[Message]:
    """
    Convert LangChain messages to the shared Message model format.

    Args:
        messages: List of LangChain message objects
        session_id: Session ID for request tracing

    Returns:
        List of Message objects in the shared schema
    """
    messages_list = []
    for i, msg in enumerate(messages):
        # Determine message type based on LangChain message class
        if msg.__class__.__name__.lower() == "systemmessage":
            msg_type = MessageType.SYSTEM
        elif msg.__class__.__name__.lower() == "humanmessage":
            msg_type = MessageType.USER
        elif msg.__class__.__name__.lower() == "aimessage":
            msg_type = MessageType.AGENT
        else:
            msg_type = MessageType.AGENT

        message = Message(
            id=f"{session_id}_msg_{i}",
            type=msg_type,
            content=msg.content,
            role=msg.__class__.__name__.lower(),
        )

        # Add tool calls if present
        if hasattr(msg, 'tool_calls') and msg.tool_calls:
            message.tool_calls = msg.tool_calls

        messages_list.append(message)

    return messages_list
