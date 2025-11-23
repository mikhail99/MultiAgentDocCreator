"""
Local file search tool.

A simple tool for searching files in the local directory without requiring API keys.
"""

import os
import glob
import logging
from typing import List, Optional, Dict, Any

from tools.base import BaseTool, ToolResult
from config.settings import settings

logger = logging.getLogger(__name__)


class LocalFileSearchTool(BaseTool):
    """Tool for searching files in the local directory."""

    def __init__(self):
        super().__init__(
            name="local_file_search",
            description="Search for files in the local directory using patterns. Supports glob patterns like *.txt, *.py, etc."
        )

    async def execute(self, pattern: str, directory: Optional[str] = None, **kwargs) -> ToolResult:
        """
        Search for files matching a pattern in the local directory.

        Args:
            pattern: Glob pattern to search for (e.g., "*.txt", "*.py", "README*")
            directory: Directory to search in (defaults to current working directory)
            **kwargs: Additional parameters

        Returns:
            ToolResult with matching files and their contents (for small files)
        """
        try:
            # Use current directory if none specified
            search_dir = directory or os.getcwd()

            # Ensure the directory exists
            if not os.path.exists(search_dir):
                return ToolResult(
                    success=False,
                    content="",
                    error=f"Directory does not exist: {search_dir}"
                )

            # Perform glob search
            full_pattern = os.path.join(search_dir, pattern)
            matching_files = glob.glob(full_pattern, recursive=True)

            if not matching_files:
                return ToolResult(
                    success=True,
                    content=f"No files found matching pattern '{pattern}' in {search_dir}",
                    metadata={
                        "pattern": pattern,
                        "directory": search_dir,
                        "files_found": 0
                    }
                )

            # Prepare results
            results = []
            total_size = 0

            for file_path in sorted(matching_files)[:20]:  # Limit to 20 files
                try:
                    # Get file info
                    stat = os.stat(file_path)
                    file_size = stat.st_size
                    total_size += file_size

                    file_info = {
                        "path": file_path,
                        "size": file_size,
                        "modified": stat.st_mtime
                    }

                    # For small files, include content
                    if file_size < 5000:  # 5KB limit
                        try:
                            with open(file_path, 'r', encoding='utf-8') as f:
                                content = f.read()
                            file_info["content"] = content[:2000]  # Limit content length
                        except (UnicodeDecodeError, IOError) as e:
                            file_info["content_error"] = str(e)

                    results.append(file_info)

                except OSError as e:
                    results.append({
                        "path": file_path,
                        "error": str(e)
                    })

            # Format the response
            summary = f"Found {len(matching_files)} files matching '{pattern}' in {search_dir}"
            if len(matching_files) > 20:
                summary += f" (showing first 20)"

            detailed_results = []
            for result in results:
                path = result["path"]
                size = result.get("size", 0)
                detailed_results.append(f"- {path} ({size} bytes)")

                if "content" in result:
                    content_preview = result["content"][:200] + "..." if len(result["content"]) > 200 else result["content"]
                    detailed_results.append(f"  Content: {content_preview}")
                elif "content_error" in result:
                    detailed_results.append(f"  Content error: {result['content_error']}")
                elif "error" in result:
                    detailed_results.append(f"  Error: {result['error']}")

            final_content = summary + "\n\n" + "\n".join(detailed_results)

            return ToolResult(
                success=True,
                content=final_content,
                metadata={
                    "pattern": pattern,
                    "directory": search_dir,
                    "files_found": len(matching_files),
                    "total_size": total_size,
                    "results_shown": len(results)
                }
            )

        except Exception as e:
            logger.error(f"Local file search error: {e}")
            return ToolResult(
                success=False,
                content="",
                error=f"Failed to search files: {str(e)}"
            )
