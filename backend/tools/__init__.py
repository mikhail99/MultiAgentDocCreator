from tools.base import BaseTool, ToolResult
from tools.web_search import WebSearchTool
from tools.web_visit import WebVisitTool
from tools.scholar_search import ScholarSearchTool
from tools.python_interpreter import PythonInterpreterTool
from tools.local_file_search import LocalFileSearchTool

__all__ = [
    'BaseTool',
    'ToolResult',
    'WebSearchTool',
    'WebVisitTool',
    'ScholarSearchTool',
    'PythonInterpreterTool',
    'LocalFileSearchTool',
    'get_available_tools',
    'get_tool_by_name',
    'get_test_tools'
]


def get_available_tools() -> list[BaseTool]:
    """Get all available research tools."""
    return [
        WebSearchTool(),
        WebVisitTool(),
        ScholarSearchTool(),
        PythonInterpreterTool(),
        LocalFileSearchTool(),
    ]


def get_test_tools() -> list[BaseTool]:
    """Get tools suitable for testing (no API keys required)."""
    return [
        LocalFileSearchTool(),
        PythonInterpreterTool(),
    ]


def get_tool_by_name(name: str) -> BaseTool | None:
    """Get a tool by its name."""
    tools = get_available_tools()
    for tool in tools:
        if tool.name == name:
            return tool
    return None


def get_langchain_tools(tools: list[BaseTool] = None):
    """Get tools in LangChain format for agent integration."""
    if tools is None:
        tools = get_available_tools()
    return [tool.to_langchain_tool() for tool in tools]
