"""
Factory for creating research agents with their dependencies.

This module provides dependency injection for ResearchAgent instances,
following the Tongyi-DeepResearch pattern of separating orchestration
from resource creation.
"""

import logging
from typing import List, Any

from config.settings import settings
from .research_agent import ResearchAgent

# Import tools
from tools import get_langchain_tools, get_test_tools


def _get_llm_factory():
    """Get the appropriate LLM factory based on settings."""
    if settings.llm_provider == "ollama":
        from llm.ollama_client import create_research_llm
        return create_research_llm
    else:
        from llm.openai_client import create_research_llm
        return create_research_llm

logger = logging.getLogger(__name__)


def create_research_agent(
    max_llm_calls: int = None,
    reasoning: bool = True,
    test_mode: bool = False
) -> ResearchAgent:
    """
    Factory function to create a ResearchAgent with all dependencies injected.

    Args:
        max_llm_calls: Maximum number of LLM calls allowed
        reasoning: Whether to enable reasoning mode
        test_mode: Whether to use test tools only (no API keys required)

    Returns:
        Configured ResearchAgent instance
    """
    logger.info(f"Factory: Creating research agent with {settings.llm_provider} LLM{' (test mode)' if test_mode else ''}")

    # Create tools first (needed for LLM system prompt)
    if test_mode:
        tool_instances = get_test_tools()
    else:
        from tools import get_available_tools
        tool_instances = get_available_tools()

    tools = get_langchain_tools(tool_instances)
    logger.info(f"Factory: {len(tools)} tools created")

    # Create LLM with tools for system prompt generation
    llm_factory = _get_llm_factory()
    llm = llm_factory(tools=tool_instances)  # Pass tool instances for schema generation
    logger.info(f"Factory: {settings.llm_provider.upper()} LLM created ({getattr(settings, f'{settings.llm_provider}_model', 'unknown model')})")
    logger.info(f"Factory: {len(tools)} tools created")

    # Create agent with dependencies
    agent = ResearchAgent(
        llm=llm,
        tools=tools,
        max_llm_calls=max_llm_calls or settings.max_llm_calls,
        reasoning=reasoning
    )

    logger.info("Factory: Research agent created successfully")
    return agent
