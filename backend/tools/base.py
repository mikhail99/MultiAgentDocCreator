from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class ToolResult(BaseModel):
    """Result from a tool execution."""
    success: bool
    content: str
    metadata: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class BaseTool(ABC):
    """Base class for all research tools."""

    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description

    @abstractmethod
    async def execute(self, **kwargs) -> ToolResult:
        """Execute the tool with given parameters."""
        pass

    def to_langchain_tool(self):
        """Convert to LangChain tool format with proper async handling."""
        from langchain_core.tools import tool as langchain_tool
        import asyncio

        # Create a synchronous wrapper for LangChain
        def sync_execute(**kwargs):
            """Synchronous wrapper for LangChain compatibility."""
            try:
                # Get the current event loop or create one
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    # If we're in an async context, we need to handle this differently
                    # For now, create a new thread to run the async code
                    import concurrent.futures
                    with concurrent.futures.ThreadPoolExecutor() as executor:
                        future = executor.submit(asyncio.run, self.execute(**kwargs))
                        result = future.result()
                else:
                    # We're not in an async context, safe to use asyncio.run
                    result = asyncio.run(self.execute(**kwargs))
                return result.content if result.success else f"Error: {result.error}"
            except Exception as e:
                return f"Tool execution error: {str(e)}"

        # Create the tool using langchain_tool decorator
        sync_execute.__name__ = self.name
        tool = langchain_tool(sync_execute)
        tool.name = self.name
        tool.description = self.description

        return tool
