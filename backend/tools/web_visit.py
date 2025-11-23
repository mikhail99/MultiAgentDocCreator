import asyncio
import logging
from typing import List, Optional
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup
from tools.base import BaseTool, ToolResult
from config.settings import settings

logger = logging.getLogger(__name__)


class WebVisitTool(BaseTool):
    """Tool for visiting webpages and extracting content summaries."""

    def __init__(self):
        super().__init__(
            name="visit",
            description="Visit webpage(s) and return the summary of the content."
        )

    async def execute(self, url: List[str], goal: str, **kwargs) -> ToolResult:
        """
        Visit webpages and extract content based on the goal.

        Args:
            url: List of URLs to visit
            goal: Specific information goal for visiting
            **kwargs: Additional parameters

        Returns:
            ToolResult with page summaries
        """
        try:
            if not isinstance(url, list):
                url = [url]

            all_summaries = []

            for page_url in url:
                logger.info(f"Visiting: {page_url} with goal: {goal}")

                try:
                    # Fetch page content
                    response = requests.get(
                        page_url,
                        timeout=settings.visit_timeout,
                        headers={
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    )
                    response.raise_for_status()

                    # Parse HTML
                    soup = BeautifulSoup(response.content, 'html.parser')

                    # Remove script and style elements
                    for script in soup(["script", "style"]):
                        script.decompose()

                    # Extract title
                    title = soup.title.string.strip() if soup.title else "No title"

                    # Extract main content (prioritize article, main, or body)
                    content_selectors = ['article', 'main', '[role="main"]', 'body']
                    main_content = None

                    for selector in content_selectors:
                        element = soup.select_one(selector)
                        if element:
                            main_content = element.get_text(separator=' ', strip=True)
                            break

                    if not main_content:
                        main_content = soup.get_text(separator=' ', strip=True)

                    # Truncate if too long (keep first 2000 characters)
                    if len(main_content) > 2000:
                        main_content = main_content[:2000] + "..."

                    # Create summary
                    domain = urlparse(page_url).netloc
                    summary = f"""URL: {page_url}
Domain: {domain}
Title: {title}

Content Summary (Goal: {goal}):
{main_content}

---
"""

                    all_summaries.append(summary)

                except requests.RequestException as e:
                    error_summary = f"""URL: {page_url}
Error: Failed to fetch page - {str(e)}

---
"""
                    all_summaries.append(error_summary)
                    logger.error(f"Failed to visit {page_url}: {e}")

            final_content = "\n".join(all_summaries)

            return ToolResult(
                success=True,
                content=final_content,
                metadata={
                    "urls": url,
                    "goal": goal,
                    "pages_visited": len([s for s in all_summaries if "Error:" not in s])
                }
            )

        except Exception as e:
            logger.error(f"Web visit error: {e}")
            return ToolResult(
                success=False,
                content="",
                error=f"Failed to visit webpages: {str(e)}"
            )
