#!/usr/bin/env python3
"""
Test script for the MultiAgentDocCreator backend with Ollama.

This script helps test the backend using Ollama with qwen3:4b and local tools.
"""

import asyncio
import os
import sys
from pathlib import Path

# Set environment variables BEFORE importing any backend modules
os.environ["LLM_PROVIDER"] = "ollama"
os.environ["OLLAMA_MODEL"] = "qwen3:4b"
os.environ["OLLAMA_BASE_URL"] = "http://localhost:11434"
os.environ["MAX_LLM_CALLS"] = "3"
os.environ["TEMPERATURE"] = "0.7"
os.environ["TOP_P"] = "0.9"
os.environ["MAX_TOKENS"] = "2048"

# Add backend to path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

from agents.factory import create_research_agent

async def test_backend():
    """Test the backend with Ollama and local file search tool."""

    # Import settings after environment variables are set
    from config.settings import settings

    print("🔧 Testing MultiAgentDocCreator Backend")
    print("=" * 50)
    print(f"LLM Provider: {settings.llm_provider}")
    print(f"Ollama Model: {settings.ollama_model}")
    print(f"Ollama URL: {settings.ollama_base_url}")
    print(f"Max LLM Calls: {settings.max_llm_calls}")
    print()

    # Check what tools are loaded
    from tools import get_test_tools
    test_tools = get_test_tools()
    print(f"Test Tools Available: {len(test_tools)}")
    for tool in test_tools:
        print(f"  - {tool.name}: {tool.description[:60]}...")
    print()

    try:
        # Create agent in test mode
        print("🤖 Creating research agent...")
        agent = create_research_agent(test_mode=True)
        print("✅ Agent created successfully")
        print(f"Agent has {len(agent.tools)} tools configured")
        print()

        # Test query - be more explicit about using the tool
        test_query = "Use the local_file_search tool to find all files with .py extension in the current directory."
        print(f"🧪 Testing with query: {test_query}")
        print()

        # Run research
        result = await agent.research(test_query)

        print("📊 Research Results:")
        print("-" * 30)
        print(f"Success: {result['success']}")
        print(f"Session ID: {result.get('session_id', 'N/A')}")
        print(f"Iterations: {result['iterations']}")
        print(f"Tools used: {len(result['tools_used'])}")
        print()

        if result['success'] and result.get('final_answer'):
            print("💡 Final Answer:")
            print(result['final_answer'])
        else:
            print("❌ No final answer generated")

        print()
        print("📝 Message History:")
        for i, msg in enumerate(result['messages']):
            print(f"{i+1}. {msg.__class__.__name__}: {msg.content[:100]}{'...' if len(msg.content) > 100 else ''}")

        print()
        print("✅ Backend test completed successfully!")

    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

    return True

if __name__ == "__main__":
    # Run the test
    success = asyncio.run(test_backend())
    sys.exit(0 if success else 1)
