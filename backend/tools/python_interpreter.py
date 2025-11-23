import asyncio
import logging
import sys
from io import StringIO
from contextlib import redirect_stdout, redirect_stderr
from typing import Optional, Dict, Any
import traceback

from tools.base import BaseTool, ToolResult
from config.settings import settings

logger = logging.getLogger(__name__)


class PythonInterpreterTool(BaseTool):
    """Tool for executing Python code in a sandboxed environment."""

    def __init__(self):
        super().__init__(
            name="python_interpreter",
            description="Executes Python code in a sandboxed environment. The code must be provided within <code> and </code> tags."
        )

    async def execute(self, code: Optional[str] = None, **kwargs) -> ToolResult:
        """
        Execute Python code in a sandboxed environment.

        Args:
            code: Python code to execute (can be passed directly or extracted from kwargs)
            **kwargs: Additional parameters

        Returns:
            ToolResult with execution results
        """
        try:
            # Extract code from various possible formats
            if not code:
                # Check if code is in the arguments
                if 'arguments' in kwargs and isinstance(kwargs['arguments'], dict):
                    # This is the expected format from the system prompt
                    pass  # Code should be in the next part
                else:
                    return ToolResult(
                        success=False,
                        content="",
                        error="No Python code provided. Code must be enclosed in <code> and </code> tags."
                    )

            # For now, we'll assume code is passed as a parameter
            # In a real implementation, you'd parse it from the LLM response
            if not code:
                return ToolResult(
                    success=False,
                    content="",
                    error="Python code must be provided for execution."
                )

            logger.info(f"Executing Python code (length: {len(code)} chars)")

            # Create a restricted globals dict for safety
            restricted_globals = {
                '__builtins__': {
                    'print': print,
                    'len': len,
                    'str': str,
                    'int': int,
                    'float': float,
                    'bool': bool,
                    'list': list,
                    'dict': dict,
                    'tuple': tuple,
                    'set': set,
                    'range': range,
                    'enumerate': enumerate,
                    'zip': zip,
                    'sum': sum,
                    'min': min,
                    'max': max,
                    'abs': abs,
                    'round': round,
                    'sorted': sorted,
                    # Add basic math operations
                    'math': __import__('math'),
                    # Add basic data science libraries if available
                    'numpy': __import__('numpy'),
                    'pandas': __import__('pandas'),
                }
            }

            # Capture stdout and stderr
            stdout_capture = StringIO()
            stderr_capture = StringIO()

            try:
                with redirect_stdout(stdout_capture), redirect_stderr(stderr_capture):
                    # Execute the code with timeout
                    result = await asyncio.wait_for(
                        asyncio.get_event_loop().run_in_executor(
                            None,
                            self._execute_code_safely,
                            code,
                            restricted_globals
                        ),
                        timeout=settings.python_execution_timeout
                    )

                stdout_output = stdout_capture.getvalue()
                stderr_output = stderr_capture.getvalue()

                # Combine outputs
                output = ""
                if stdout_output:
                    output += f"STDOUT:\n{stdout_output}\n"
                if stderr_output:
                    output += f"STDERR:\n{stderr_output}\n"
                if result is not None:
                    output += f"Result: {result}\n"

                if not output.strip():
                    output = "Code executed successfully (no output)"

                return ToolResult(
                    success=True,
                    content=output.strip(),
                    metadata={
                        "code_length": len(code),
                        "has_stdout": bool(stdout_output.strip()),
                        "has_stderr": bool(stderr_output.strip()),
                        "has_result": result is not None
                    }
                )

            except asyncio.TimeoutError:
                return ToolResult(
                    success=False,
                    content="",
                    error=f"Code execution timed out after {settings.python_execution_timeout} seconds"
                )
            except Exception as e:
                error_output = stderr_capture.getvalue() or str(e)
                return ToolResult(
                    success=False,
                    content="",
                    error=f"Code execution failed: {error_output}"
                )

        except Exception as e:
            logger.error(f"Python interpreter error: {e}")
            return ToolResult(
                success=False,
                content="",
                error=f"Failed to execute Python code: {str(e)}"
            )

    def _execute_code_safely(self, code: str, globals_dict: Dict[str, Any]):
        """Execute code in a restricted environment."""
        try:
            # Compile the code first to check for syntax errors
            compiled_code = compile(code, '<string>', 'exec')

            # Execute in restricted environment
            local_vars = {}
            exec(compiled_code, globals_dict, local_vars)

            # Return the last expression result if any
            if local_vars:
                # Get the last assigned variable or expression result
                last_key = list(local_vars.keys())[-1]
                return local_vars[last_key]

            return None

        except SyntaxError as e:
            raise Exception(f"Syntax error: {e}")
        except Exception as e:
            raise Exception(f"Execution error: {e}")
