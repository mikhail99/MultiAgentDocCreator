"""
API package for Tongyi-DeepResearch.

This package contains modular API routers following FastAPI best practices.
"""

from .research import router as research_router
from .clarification import router as clarification_router
from .documents import router as documents_router

__all__ = [
    'research_router',
    'clarification_router',
    'documents_router',
]
