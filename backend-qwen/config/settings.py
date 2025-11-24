"""
Application settings for Tongyi-DeepResearch.

All configuration values can be overridden via environment variables or .env file.
See .env.example for available options.

Tunable Parameters for Lab Usage:
- max_llm_calls: Maximum research iterations (default: 50, recommended: 10-100)
- temperature/top_p: LLM creativity vs consistency (default: 0.85/0.95)
- search_max_results: Google search results to fetch (default: 10)
- visit_timeout: Web page fetch timeout in seconds (default: 30)
- python_execution_timeout: Code execution timeout in seconds (default: 60)
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # LLM Provider Configuration
    llm_provider: str = "ollama"  # "openai" or "ollama"

    # OpenAI Configuration
    openai_api_key: str = ""
    openai_model: str = "gpt-4-turbo-preview"
    openai_base_url: str = "https://api.openai.com/v1"

    # Ollama Configuration
    ollama_model: str = "qwen3:4b"
    ollama_base_url: str = "http://localhost:11434"

    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000

    # Research Agent Configuration
    # Maximum number of LLM calls per research session (conservative default for lab)
    max_llm_calls: int = 50
    # Enable reasoning/thinking traces in responses
    reasoning_enabled: bool = True
    # LLM temperature for creativity vs consistency (0.0 = deterministic, 1.0 = creative)
    temperature: float = 0.85
    # Nucleus sampling parameter (alternative to temperature)
    top_p: float = 0.95
    # Maximum tokens per LLM response
    max_tokens: int = 32768

    # Tool Configuration
    # Maximum Google search results to fetch per query
    search_max_results: int = 10
    # Timeout for web page visits in seconds
    visit_timeout: int = 30
    # Timeout for Python code execution in seconds (prevents infinite loops)
    python_execution_timeout: int = 60

    class Config:
        env_file = ".env"
        case_sensitive = False

    @property
    def openai_config(self) -> dict:
        return {
            "model": self.openai_model,
            "api_key": self.openai_api_key,
            "base_url": self.openai_base_url,
            "temperature": self.temperature,
            "top_p": self.top_p,
            "max_tokens": self.max_tokens,
        }


# Global settings instance
settings = Settings()
