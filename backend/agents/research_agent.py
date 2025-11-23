import logging
from typing import Any, Dict, List, Optional, TypedDict, Annotated
from datetime import datetime

from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_core.callbacks import CallbackManagerForLLMRun
from langchain_core.outputs import ChatGeneration, ChatResult

from llm.openai_client import DeepResearchLLM
from tools import get_tool_by_name
from config.settings import settings
from prompts import get_system_prompt
from api.session import SessionLogger

logger = logging.getLogger(__name__)


class ResearchState(TypedDict):
    """State for the research workflow."""
    messages: List[BaseMessage]
    current_task: str
    tools_used: List[str]
    iteration_count: int
    max_iterations: int
    final_answer: Optional[str]
    is_complete: bool
    session_id: Optional[str]  # Added for request tracing


class ResearchAgent:
    """LangGraph-based research agent inspired by Tongyi-DeepResearch.

    This agent orchestrates the research workflow but receives its dependencies
    (LLM and tools) from external sources, following dependency injection principles.
    """

    def __init__(
        self,
        llm: DeepResearchLLM,
        tools: List[Any],
        max_llm_calls: int = None,
        reasoning: bool = True
    ):
        self.max_llm_calls = max_llm_calls or settings.max_llm_calls
        self.reasoning = reasoning
        self.llm = llm
        self.tools = tools

        # Bind tools to LLM
        self.llm_with_tools = self.llm.bind_tools(self.tools)

        # Create the research graph
        self.graph = self._create_research_graph()

    def _create_research_graph(self) -> StateGraph:
        """Create the LangGraph workflow for research."""

        def researcher_initialize(state: ResearchState) -> ResearchState:
            """Initialize the research process as the researcher agent."""
            session_id = state.get("session_id")
            session_logger = SessionLogger(session_id) if session_id else logger
            session_logger.info("Researcher: Initializing research workflow")

            # Add system message if not present
            messages = state["messages"].copy()
            if not any(isinstance(msg, SystemMessage) for msg in messages):
                system_msg = SystemMessage(content=self._get_system_prompt())
                messages.insert(0, system_msg)

            return {
                **state,
                "messages": messages,
                "tools_used": [],
                "iteration_count": 0,
                "max_iterations": self.max_llm_calls,
                "is_complete": False,
            }

        def researcher_reason(state: ResearchState) -> ResearchState:
            """Researcher agent: Analyze current state and plan next actions."""
            session_id = state.get("session_id")
            session_logger = SessionLogger(session_id) if session_id else logger
            session_logger.info(f"Researcher: Reasoning step - iteration {state['iteration_count'] + 1}")

            messages = state["messages"]
            iteration_count = state["iteration_count"]

            # Check if we've exceeded max iterations
            if iteration_count >= self.max_llm_calls:
                logger.warning(f"Max iterations ({self.max_llm_calls}) reached")
                return {
                    **state,
                    "is_complete": True,
                    "final_answer": "Research completed due to iteration limit. Please review the gathered information."
                }

            # Get LLM response
            try:
                if self.reasoning:
                    # Add thinking prefix for reasoning
                    thinking_prompt = "\n\n<think>\nLet me analyze what I know so far and determine the best next step for this research task.\n\n"
                    current_messages = messages + [HumanMessage(content=thinking_prompt)]
                else:
                    current_messages = messages

                response = self.llm_with_tools.invoke(current_messages)

                # Add response to messages
                new_messages = messages + [response]

                # Check if this is a final answer
                content = response.content
                if "<answer>" in content and "</answer>" in content:
                    # Extract final answer
                    start = content.find("<answer>") + len("<answer>")
                    end = content.find("</answer>")
                    final_answer = content[start:end].strip() if end > start else content

                    logger.info("Final answer detected in response")
                    return {
                        **state,
                        "messages": new_messages,
                        "iteration_count": iteration_count + 1,
                        "final_answer": final_answer,
                        "is_complete": True,
                    }

                return {
                    **state,
                    "messages": new_messages,
                    "iteration_count": iteration_count + 1,
                }

            except Exception as e:
                logger.error(f"Error in thinking step: {e}")
                return {
                    **state,
                    "is_complete": True,
                    "final_answer": f"Research failed due to error: {str(e)}"
                }

        async def tool_executor_execute(state: ResearchState) -> ResearchState:
            """Tool executor agent: Execute any tools called in the last message."""
            messages = state["messages"]
            tools_used = state["tools_used"]
            session_id = state.get("session_id")
            session_logger = SessionLogger(session_id) if session_id else logger

            # Get the last message
            last_message = messages[-1] if messages else None
            if not isinstance(last_message, AIMessage):
                return state

            # Check for tool calls
            tool_calls = getattr(last_message, 'tool_calls', [])
            if not tool_calls:
                return state

            session_logger.info(f"Tool Executor: Executing {len(tool_calls)} tool calls")

            new_messages = messages.copy()

            for tool_call in tool_calls:
                tool_name = tool_call['name']
                tool_args = tool_call['arguments']

                session_logger.info(f"Tool Executor: Executing tool '{tool_name}' with args: {tool_args}")

                # Get the tool
                tool = get_tool_by_name(tool_name)
                if not tool:
                    session_logger.error(f"Tool Executor: Tool '{tool_name}' not found")
                    error_message = AIMessage(
                        content=f"Tool '{tool_name}' not found",
                        tool_call_id=tool_call.get('id')
                    )
                    new_messages.append(error_message)
                    continue

                try:
                    # Execute tool - now properly awaited since tools are async
                    result = await tool.execute(**tool_args)

                    # Create tool result message
                    tool_message = AIMessage(
                        content=result.content if result.success else f"Tool error: {result.error}",
                        tool_call_id=tool_call.get('id')
                    )

                    new_messages.append(tool_message)
                    tools_used.append(tool_name)
                    session_logger.info(f"Tool Executor: Tool '{tool_name}' completed successfully")

                except Exception as e:
                    session_logger.error(f"Tool Executor: Tool '{tool_name}' execution failed: {e}")
                    error_message = AIMessage(
                        content=f"Tool execution failed: {str(e)}",
                        tool_call_id=tool_call.get('id')
                    )
                    new_messages.append(error_message)

            return {
                **state,
                "messages": new_messages,
                "tools_used": tools_used,
            }

        def workflow_controller_decide_next(state: ResearchState) -> str:
            """Workflow controller: Determine if we should continue research or end."""
            if state["is_complete"]:
                return "end"

            # Check if we have tool calls to execute
            last_message = state["messages"][-1] if state["messages"] else None
            if isinstance(last_message, AIMessage) and getattr(last_message, 'tool_calls', []):
                return "tool_executor_execute"

            # Continue reasoning if not complete
            return "researcher_reason"

        # Create the graph with async support
        workflow = StateGraph(ResearchState)

        # Add nodes (some are async)
        workflow.add_node("researcher_initialize", researcher_initialize)
        workflow.add_node("researcher_reason", researcher_reason)
        workflow.add_node("tool_executor_execute", tool_executor_execute)

        # Add edges
        workflow.set_entry_point("researcher_initialize")
        workflow.add_edge("researcher_initialize", "researcher_reason")
        workflow.add_edge("tool_executor_execute", "researcher_reason")
        workflow.add_conditional_edges(
            "researcher_reason",
            workflow_controller_decide_next,
            {
                "end": END,
                "tool_executor_execute": "tool_executor_execute",
                "researcher_reason": "researcher_reason",
            }
        )

        return workflow.compile()

    def _get_system_prompt(self) -> str:
        """Get the system prompt for research tasks."""
        return get_system_prompt()

    async def research(self, query: str, custom_instructions: str = "", session_id: str = None) -> Dict[str, Any]:
        """
        Perform research on a given query.

        Args:
            query: The research query
            custom_instructions: Additional instructions for the research
            session_id: Session ID for request tracing

        Returns:
            Dict containing research results and metadata
        """
        session_logger = SessionLogger(session_id) if session_id else logger
        session_logger.info(f"Starting research on query: {query[:100]}...")

        # Prepare initial messages
        messages = [HumanMessage(content=f"{query}\n\n{custom_instructions}".strip())]

        # Initialize state
        initial_state: ResearchState = {
            "messages": messages,
            "current_task": query,
            "tools_used": [],
            "iteration_count": 0,
            "max_iterations": self.max_llm_calls,
            "final_answer": None,
            "is_complete": False,
            "session_id": session_id,
        }

        # Run the research workflow
        try:
            final_state = await self.graph.ainvoke(initial_state)

            return {
                "success": True,
                "final_answer": final_state.get("final_answer"),
                "messages": final_state.get("messages", []),
                "tools_used": final_state.get("tools_used", []),
                "iterations": final_state.get("iteration_count", 0),
                "is_complete": final_state.get("is_complete", False),
                "session_id": session_id,
            }

        except Exception as e:
            logger.error(f"Research failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "messages": messages,
                "tools_used": [],
                "iterations": 0,
                "is_complete": False,
                "session_id": session_id,
            }
