"""
Session management utilities for request tracing.

This module provides session ID generation and logging utilities
to track individual research sessions across the system.
"""

import uuid
import logging
from contextvars import ContextVar
from typing import Optional

logger = logging.getLogger(__name__)

# Context variable to store session ID across async calls
session_id_context: ContextVar[Optional[str]] = ContextVar('session_id', default=None)


def generate_session_id() -> str:
    """Generate a unique session ID for request tracing."""
    return str(uuid.uuid4())


def get_current_session_id() -> Optional[str]:
    """Get the current session ID from context."""
    return session_id_context.get()


def set_session_id(session_id: str) -> None:
    """Set the session ID in the current context."""
    session_id_context.set(session_id)


class SessionLogger:
    """Logger adapter that includes session ID in all log messages."""

    def __init__(self, session_id: str):
        self.session_id = session_id
        self.logger = logging.getLogger(__name__)

    def info(self, message: str, *args, **kwargs):
        """Log info message with session ID."""
        self.logger.info(f"[SESSION:{self.session_id}] {message}", *args, **kwargs)

    def warning(self, message: str, *args, **kwargs):
        """Log warning message with session ID."""
        self.logger.warning(f"[SESSION:{self.session_id}] {message}", *args, **kwargs)

    def error(self, message: str, *args, **kwargs):
        """Log error message with session ID."""
        self.logger.error(f"[SESSION:{self.session_id}] {message}", *args, **kwargs)

    def debug(self, message: str, *args, **kwargs):
        """Log debug message with session ID."""
        self.logger.debug(f"[SESSION:{self.session_id}] {message}", *args, **kwargs)


def create_session_logger(session_id: str) -> SessionLogger:
    """Create a session-aware logger instance."""
    return SessionLogger(session_id)
