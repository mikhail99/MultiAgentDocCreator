import asyncio
import logging
from typing import List, Optional, Dict, Any
import json

from scholarly import scholarly
from tools.base import BaseTool, ToolResult
from config.settings import settings

logger = logging.getLogger(__name__)


class ScholarSearchTool(BaseTool):
    """Tool for searching Google Scholar for academic publications."""

    def __init__(self):
        super().__init__(
            name="google_scholar",
            description="Leverage Google Scholar to retrieve relevant information from academic publications. Accepts multiple queries."
        )

    async def execute(self, query: List[str], **kwargs) -> ToolResult:
        """
        Search Google Scholar for academic publications.

        Args:
            query: List of search queries
            **kwargs: Additional parameters

        Returns:
            ToolResult with scholar search results
        """
        try:
            if not isinstance(query, list):
                query = [query]

            all_results = []

            for search_query in query:
                logger.info(f"Searching Google Scholar for: {search_query}")

                try:
                    # Search Google Scholar
                    search_results = scholarly.search_pubs(search_query)

                    # Collect up to 10 results
                    papers = []
                    for i, result in enumerate(search_results):
                        if i >= 10:  # Limit results
                            break

                        paper_info = {
                            'title': result.get('bib', {}).get('title', 'Unknown Title'),
                            'authors': result.get('bib', {}).get('author', []),
                            'year': result.get('bib', {}).get('pub_year', 'Unknown'),
                            'venue': result.get('bib', {}).get('venue', 'Unknown'),
                            'abstract': result.get('bib', {}).get('abstract', ''),
                            'citations': result.get('num_citations', 0),
                            'url': result.get('pub_url', '')
                        }
                        papers.append(paper_info)

                    # Format results
                    formatted_results = []
                    for i, paper in enumerate(papers, 1):
                        authors_str = ", ".join(paper['authors']) if paper['authors'] else "Unknown Authors"
                        result_str = f"""{i}. {paper['title']}
   Authors: {authors_str}
   Year: {paper['year']}
   Venue: {paper['venue']}
   Citations: {paper['citations']}
   URL: {paper['url']}
   Abstract: {paper['abstract'][:300]}...""" if len(paper['abstract']) > 300 else f"""   Abstract: {paper['abstract']}"""

                        formatted_results.append(result_str)

                    query_results = f"Google Scholar results for '{search_query}':\n" + "\n\n".join(formatted_results)
                    all_results.append(query_results)

                except Exception as e:
                    logger.error(f"Scholar search failed for query '{search_query}': {e}")
                    error_results = f"Google Scholar search failed for '{search_query}': {str(e)}"
                    all_results.append(error_results)

            final_content = "\n\n".join(all_results)

            return ToolResult(
                success=True,
                content=final_content,
                metadata={
                    "queries": query,
                    "total_results": len(papers) if 'papers' in locals() else 0
                }
            )

        except Exception as e:
            logger.error(f"Google Scholar search error: {e}")
            return ToolResult(
                success=False,
                content="",
                error=f"Failed to search Google Scholar: {str(e)}"
            )
