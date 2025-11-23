"""
Prompts and tool specifications for Tongyi-DeepResearch.

This module serves as the single source of truth for system prompts and tool function
schemas used throughout the research system. Inspired by the Tongyi-DeepResearch
architecture on Hugging Face.
"""

import json
from typing import Dict, Any, List

# Base system prompt for research tasks
SYSTEM_PROMPT = """You are a deep research assistant. Your core function is to conduct thorough, multi-source investigations into any topic. You must handle both broad, open-domain inquiries and queries within specialized academic fields.

For every request, synthesize information from credible, diverse sources to deliver a comprehensive, accurate, and objective response.

When you have gathered sufficient information and are ready to provide the definitive response, you must enclose the entire final answer within <answer></answer> tags.

# Tools
You may call one or more functions to assist with the user query. You are provided with function signatures within <tools></tools> XML tags:

<tools>
{tool_schemas}
</tools>

For each function call, return a json object with function name and arguments within <tool_call></tool_call> XML tags:
<tool_call>
{{"name": <function-name>, "arguments": <args-json-object>}}
</tool_call>"""

# Tool function specifications
TOOL_SCHEMAS: List[Dict[str, Any]] = [
    {
        "type": "function",
        "function": {
            "name": "search",
            "description": "Perform Google web searches then returns a string of the top search results. Accepts multiple queries.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "array",
                        "items": {"type": "string", "description": "The search query."},
                        "minItems": 1,
                        "description": "The list of search queries."
                    }
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "visit",
            "description": "Visit webpage(s) and return the summary of the content.",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "The URL(s) of the webpage(s) to visit. Can be a single URL or an array of URLs."
                    },
                    "goal": {
                        "type": "string",
                        "description": "The specific information goal for visiting webpage(s)."
                    }
                },
                "required": ["url", "goal"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "google_scholar",
            "description": "Leverage Google Scholar to retrieve relevant information from academic publications. Accepts multiple queries. This tool will also return results from google search",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "array",
                        "items": {"type": "string", "description": "The search query."},
                        "minItems": 1,
                        "description": "The list of search queries for Google Scholar."
                    }
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "python_interpreter",
            "description": "Executes Python code in a sandboxed environment. LIMITATIONS: Max 60 seconds execution time, 10MB output limit, restricted to basic libraries (math, numpy, pandas only), no network access, no file system access. To use this tool, you must follow this format: 1. The 'arguments' JSON object must be empty: {}. 2. The Python code to be executed must be placed immediately after the JSON block, enclosed within <code> and </code> tags. IMPORTANT: Any output you want to see MUST be printed to standard output using the print() function.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    }
]


def get_system_prompt(tools: List[Dict[str, Any]] = None) -> str:
    """
    Get the complete system prompt with tool schemas formatted.

    Args:
        tools: Optional list of tool schemas to use. If None, uses default TOOL_SCHEMAS.

    Returns:
        The formatted system prompt ready for use.
    """
    tool_schemas = tools or TOOL_SCHEMAS
    tool_schemas_json = "\n\n".join(json.dumps(schema, ensure_ascii=False) for schema in tool_schemas)
    return SYSTEM_PROMPT.format(tool_schemas=tool_schemas_json)


def get_tool_schemas_for_tools(tools: List) -> List[Dict[str, Any]]:
    """
    Generate tool schemas for a specific list of tools.

    Args:
        tools: List of tool instances

    Returns:
        List of tool schema dictionaries
    """
    schemas = []
    for tool in tools:
        if hasattr(tool, 'name') and hasattr(tool, 'description'):
            schema = {
                "type": "function",
                "function": {
                    "name": tool.name,
                    "description": tool.description,
                    "parameters": tool.args_schema.schema() if hasattr(tool, 'args_schema') else {}
                }
            }
            schemas.append(schema)
    return schemas


def get_tool_schemas() -> List[Dict[str, Any]]:
    """
    Get the tool function schemas.

    Returns:
        List of tool function schema dictionaries.
    """
    return TOOL_SCHEMAS.copy()


def get_tool_names() -> List[str]:
    """
    Get the names of all available tools.

    Returns:
        List of tool names.
    """
    return [schema["function"]["name"] for schema in TOOL_SCHEMAS]


def get_tool_schema_by_name(name: str) -> Dict[str, Any]:
    """
    Get a specific tool schema by name.

    Args:
        name: The tool name to look up.

    Returns:
        The tool schema dictionary, or empty dict if not found.
    """
    for schema in TOOL_SCHEMAS:
        if schema["function"]["name"] == name:
            return schema
    return {}
