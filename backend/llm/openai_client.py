import json
import logging
from datetime import datetime
from typing import Any, Dict, Iterator, List, Optional

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langchain_core.callbacks import CallbackManagerForLLMRun
from langchain_core.outputs import ChatGeneration, ChatResult

from config.settings import settings
from prompts import get_system_prompt

logger = logging.getLogger(__name__)


class DeepResearchLLM(ChatOpenAI):
    """Enhanced OpenAI LLM client for deep research with tool calling support."""

    def __init__(self, tools=None, **kwargs):
        # Set defaults for research tasks
        defaults = {
            "model": settings.openai_model,
            "temperature": settings.temperature,
            "top_p": settings.top_p,
            "max_tokens": settings.max_tokens,
            "streaming": True,
        }
        defaults.update(kwargs)

        super().__init__(**defaults)

        # Generate system prompt based on provided tools
        if tools:
            from prompts import get_tool_schemas_for_tools
            tool_schemas = get_tool_schemas_for_tools(tools)
            self.system_prompt = get_system_prompt(tool_schemas)
        else:
            self.system_prompt = get_system_prompt()

    def _create_message_dicts(self, messages: List[BaseMessage]) -> List[Dict[str, Any]]:
        """Convert LangChain messages to OpenAI format with enhanced system prompt."""
        message_dicts = []

        for i, message in enumerate(messages):
            if isinstance(message, SystemMessage):
                # Enhance system message with current date and research prompt
                current_date = datetime.now().strftime("%Y-%m-%d")
                enhanced_content = f"{self.system_prompt}\n\nCurrent date: {current_date}\n\n{message.content}"
                message_dicts.append({"role": "system", "content": enhanced_content})
            elif isinstance(message, HumanMessage):
                message_dicts.append({"role": "user", "content": message.content})
            elif isinstance(message, AIMessage):
                message_dicts.append({"role": "assistant", "content": message.content})
            else:
                # Handle other message types
                message_dicts.append({"role": "user", "content": str(message.content)})

        # If no system message, add one
        if not any(msg.get("role") == "system" for msg in message_dicts):
            current_date = datetime.now().strftime("%Y-%m-%d")
            enhanced_content = f"{self.system_prompt}\n\nCurrent date: {current_date}"
            message_dicts.insert(0, {"role": "system", "content": enhanced_content})

        return message_dicts

    def _generate(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> ChatResult:
        """Override to use custom message formatting."""
        message_dicts = self._create_message_dicts(messages)

        # Log the input for debugging
        logger.debug(f"LLM Input: {json.dumps(message_dicts, indent=2, ensure_ascii=False)}")

        # Call parent implementation with modified messages
        return super()._generate_from_message_dicts(
            message_dicts, stop=stop, run_manager=run_manager, **kwargs
        )

    def bind_tools(self, tools: List[Any]) -> "DeepResearchLLM":
        """Bind tools to the LLM for function calling."""
        # Convert tools to OpenAI function format
        functions = []
        for tool in tools:
            if hasattr(tool, 'name') and hasattr(tool, 'description'):
                func_def = {
                    "name": tool.name,
                    "description": tool.description,
                    "parameters": tool.args_schema.schema() if hasattr(tool, 'args_schema') else {}
                }
                functions.append(func_def)

        return super().bind(functions=functions)


def create_research_llm(tools=None) -> DeepResearchLLM:
    """Factory function to create a configured research LLM."""
    return DeepResearchLLM(
        tools=tools,
        openai_api_key=settings.openai_api_key,
        base_url=settings.openai_base_url,
    )
