import asyncio
import logging
from typing import List, Optional
from urllib.parse import urlparse

from googlesearch import search
from tools.base import BaseTool, ToolResult
from config.settings import settings

logger = logging.getLogger(__name__)


class WebSearchTool(BaseTool):
    """Tool for performing web searches using Google."""

    def __init__(self):
        super().__init__(
            name="search",
            description="Perform Google web searches then returns a string of the top search results. Accepts multiple queries."
        )

    async def execute(self, query: List[str], **kwargs) -> ToolResult:
        """
        Execute web search for the given queries.

        Args:
            query: List of search queries
            **kwargs: Additional parameters

        Returns:
            ToolResult with search results
        """
        try:
            if not isinstance(query, list):
                query = [query]

            all_results = []

            for search_query in query:
                logger.info(f"Searching for: {search_query}")

                # Perform search
                search_results = list(search(
                    search_query,
                    num_results=settings.search_max_results,
                    lang="en"
                ))

                # Format results
                formatted_results = []
                for i, url in enumerate(search_results, 1):
                    try:
                        # Get domain for better formatting
                        domain = urlparse(url).netloc
                        formatted_results.append(f"{i}. {domain}: {url}")
                    except Exception as e:
                        formatted_results.append(f"{i}. {url}")

                query_results = f"Search results for '{search_query}':\n" + "\n".join(formatted_results)
                all_results.append(query_results)

            final_content = "\n\n".join(all_results)

            return ToolResult(
                success=True,
                content=final_content,
                metadata={
                    "queries": query,
                    "total_results": len(search_results) if 'search_results' in locals() else 0
                }
            )

        except Exception as e:
            logger.error(f"Web search error: {e}")
            return ToolResult(
                success=False,
                content="",
                error=f"Failed to perform web search: {str(e)}"
            )
