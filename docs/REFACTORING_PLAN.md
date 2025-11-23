# Refactoring Plan: Tongyi-DeepResearch Alignment

This document outlines the refactoring plan to align the current codebase with the [Tongyi-DeepResearch](https://huggingface.co/spaces/Qwen/DeepResearch) architectural patterns. The goal is to improve maintainability, modularity, and extensibility for a "lab-ready" v1 release.

## 1. Architectural Vision

The current system has a clean split between frontend, backend, and LLM components. However, to facilitate easier adoption and contribution, we will align the backend structure more closely with the Tongyi-DeepResearch reference implementation.

### Component Mapping

We will map our current structure to the Tongyi conceptual model while maintaining our `backend/` directory structure for cleanliness.

| Current Concept | Current File | Tongyi Analogue | Target Responsibility |
|-----------------|--------------|-----------------|----------------------|
| Research Agent | `backend/agents/research_agent.py` | `agents/search_agent.py` | Orchestration logic only. |
| LLM Client | `backend/llm/openai_client.py` | `llm/oai.py` | LLM instantiation and wrapping. |
| Tools | `backend/tools/*.py` | `search.py`, `visit.py`, etc. | Stateless, async tool implementations. |
| Prompts | Inline in Agent/LLM | `prompts.py` (conceptual) | Single source of truth for system prompts and tool schemas. |
| API Entry | `backend/main.py` | `app.py` | Application entry point, middleware, and router registration. |

## 2. Refactoring Phases

### Phase 1: Unify Prompts & Tool Specifications
**Goal**: Eliminate duplication of prompts and tool definitions.

- [x] **Create `backend/prompts.py`**:
    - Move the Base System Prompt here.
    - Move JSON tool definitions (currently in `_get_system_prompt`) here.
    - Ensure `ResearchAgent` and `DeepResearchLLM` import from this single source.
- [x] **Standardize Tool Schemas**:
    - Ensure the JSON schemas in `prompts.py` match the actual arguments expected by `backend/tools/*.py`.

### Phase 2: Modularize Agents & Tools
**Goal**: Decouple orchestration from implementation and fix async handling.

- [x] **Refactor `ResearchAgent`**:
    - Remove internal resource creation (LLM, tools). Pass them as dependencies via `__init__`.
    - Focus strictly on the LangGraph workflow (`initialize`, `think`, `execute`, `decide`).
- [x] **Fix Async Tool Execution**:
    - **Rule**: All tools are `async`. Remove `asyncio.run()` calls inside tools or agents.
    - Ensure the `execute_tools` node in LangGraph `await`s the tool execution directly.
- [x] **Prepare for Multi-Agent**:
    - Explicitly name graph nodes by role (e.g., `researcher`, `planner`) in code/docs.
    - Keep the design open for adding a "Writer" agent later.

### Phase 3: API Decomposition
**Goal**: Split the monolithic `main.py` into domain-specific routers.

- [x] **Create Router Modules**:
    - `backend/api/research.py`: `/api/research` endpoint.
    - `backend/api/clarification.py`: `/api/clarification` endpoint.
    - `backend/api/documents.py`: `/api/generate-document` endpoint.
- [x] **Clean up `backend/main.py`**:
    - Only handle `FastAPI` app creation, CORS, and router inclusion.
    - Manage global dependency lifecycle (e.g., `research_agent` startup).
- [x] **Centralize Clarification Logic**:
    - Move hardcoded templates from `main.py` to `backend/config/templates.py` (or similar).

### Phase 4: Contract Alignment & Observability
**Goal**: Ensure frontend/backend consistency and better debugging.

- [x] **Define Shared Message Schema**:
    - Create a strict Pydantic model for `Message` (role, content, type, tool_calls).
    - Document this schema for the Frontend team to match.
- [x] **Add Request Tracing**:
    - Generate a `session_id` in the API layer.
    - Pass `session_id` to `ResearchAgent.research()` and log it with every step.
- [x] **Configuration & Safety**:
    - Ensure all "tunable" parameters (max_iterations, timeouts) are in `settings.py` and loaded from `.env`.
    - Document limits for `python_interpreter` in the System Prompt to preventing hallucinated capabilities.

### Phase 5: Frontend Integration (v1 Polish)
**Goal**: A stable user experience for the first iteration.

- [x] **Deprecate Mock Backend**:
    - Renamed `mockBackend.tsx` to `agentWorkflow.tsx` and updated it to be the primary workflow handler.
    - Verified `api.ts` calls real backend endpoints with proper error handling.
- [x] **UI Expectations**:
    - Updated UI text to reflect current capabilities (no streaming references).
    - Components properly handle the unified Message schema from backend.
    - Updated AgentSettings to show only currently supported tools and models.

## 3. Execution Strategy

1.  **Prompts & Tools**: Quick win, reduces code duplication immediately.
2.  **API Split**: Makes the codebase easier to navigate for the rest of the changes.
3.  **Agent/Async Fixes**: The core "hard" engineering work.
4.  **Safety & Config**: Essential for the "lab-ready" release.

