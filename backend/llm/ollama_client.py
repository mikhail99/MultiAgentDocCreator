"""
Ollama LLM client for deep research.

This module provides an Ollama-compatible LLM client that works with local models
like qwen3:4b, with tool calling support.
"""

import json
import logging
from datetime import datetime
from typing import Any, Dict, Iterator, List, Optional

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage
from langchain_core.callbacks import CallbackManagerForLLMRun
from langchain_core.outputs import ChatGeneration, ChatResult
from langchain_ollama import ChatOllama

from config.settings import settings
from prompts import get_system_prompt

logger = logging.getLogger(__name__)


class DeepResearchOllama(ChatOllama):
    """Enhanced Ollama LLM client for deep research with tool calling support."""

    def __init__(self, tools=None, **kwargs):
        # Set defaults for research tasks
        defaults = {
            "model": settings.ollama_model,
            "temperature": settings.temperature,
            "top_p": settings.top_p,
            "max_tokens": settings.max_tokens,
            "base_url": settings.ollama_base_url,
        }
        defaults.update(kwargs)

        super().__init__(**defaults)

        # Generate system prompt based on provided tools
        if tools:
            from prompts import get_tool_schemas_for_tools
            tool_schemas = get_tool_schemas_for_tools(tools)
            self._system_prompt = get_system_prompt(tool_schemas)
        else:
            self._system_prompt = get_system_prompt()


    def invoke(self, input, config=None, **kwargs):
        """Override invoke to preprocess messages with system prompt."""
        # If input is a list of messages, preprocess them
        if isinstance(input, list) and len(input) > 0:
            # Check if first message is a system message
            if hasattr(input[0], '__class__') and 'SystemMessage' in str(input[0].__class__):
                # Enhance the system message
                current_date = datetime.now().strftime("%Y-%m-%d")
                enhanced_content = f"{self._system_prompt}\n\nCurrent date: {current_date}\n\n{input[0].content}"
                input[0].content = enhanced_content
            else:
                # Add system message if none exists
                current_date = datetime.now().strftime("%Y-%m-%d")
                system_content = f"{self._system_prompt}\n\nCurrent date: {current_date}"
                from langchain_core.messages import SystemMessage
                input.insert(0, SystemMessage(content=system_content))

        # Log the input for debugging
        logger.debug(f"Ollama LLM Input: {input}")

        # Call parent implementation
        return super().invoke(input, config=config, **kwargs)


    def bind_tools(self, tools: List[Any]) -> "DeepResearchOllama":
        """Bind tools to the LLM for function calling."""
        # Ollama supports tool calling natively with newer models
        # Convert tools to the expected format
        tool_definitions = []
        for tool in tools:
            if hasattr(tool, 'name') and hasattr(tool, 'description'):
                tool_def = {
                    "type": "function",
                    "function": {
                        "name": tool.name,
                        "description": tool.description,
                        "parameters": tool.args_schema.schema() if hasattr(tool, 'args_schema') else {}
                    }
                }
                tool_definitions.append(tool_def)

        # Use the tools parameter for Ollama
        return self.bind_tools(tool_definitions) if tool_definitions else self


def create_research_llm(tools=None) -> DeepResearchOllama:
    """Factory function to create a configured research LLM."""
    return DeepResearchOllama(tools=tools)
