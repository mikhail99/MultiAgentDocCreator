You already have a clean split between frontend, backend, LLM abstraction, and tools, and your naming and behaviour are quite close to the structure suggested by Tongyi‑DeepResearch (agents/, llm/, tools like search/visit/scholar/python, etc.), as seen in the Space layout (agents/search_agent.py, llm/oai.py, tool_python.py, search.py, visit.py, scholar.py, app.py, gui/web_ui.py) in Tongyi‑DeepResearch on Hugging Face. The main design issues for a first lab-ready iteration are:
duplicated and hard‑to‑evolve prompt / tool spec logic,
a big monolithic main.py API module,
tight coupling of “research” vs “document generation” vs “clarification questions”,
and some async / orchestration design smells (e.g. asyncio.run inside async flows, streaming mentioned but not cleanly surfaced).
Below is a concrete, refactoring plan (no code) sized for a “v1 used by ~10 researchers”.
## 1. Clarify the backend architecture around the Tongyi‑DeepResearch pattern
Goal: Make your backend layout mirror the conceptual pieces of Tongyi‑DeepResearch so it’s easier to reason about and extend.
Unify prompts & tool specification
Problem: You currently have a full system prompt (including <tools> JSON specs) both in ResearchAgent._get_system_prompt() and in DeepResearchLLM.SYSTEM_PROMPT; this will drift.
Plan:
Extract all prompt text and the tool JSON definitions into a dedicated module (conceptually like prompt.py in the HF Space).
Have one source of truth for:
base system research prompt,
tool function specs (names, descriptions, parameter schema),
any role-specific prompts (e.g. document writing vs raw research, if you add them later).
ResearchAgent and DeepResearchLLM should both depend on this module instead of inlining different versions.
Align modules with Tongyi‑DeepResearch naming
Problem: Your structure is close but not explicit; new contributors familiar with the HF Space won’t immediately see the parallels.
Plan:
Keep the physical layout but conceptually map:
backend/agents/research_agent.py ⟶ the analogue of agents/search_agent.py.
backend/llm/openai_client.py ⟶ the analogue of llm/oai.py.
backend/tools/web_search.py, web_visit.py, scholar_search.py, python_interpreter.py ⟶ the analogues of search.py, visit.py, scholar.py, tool_python.py.
Document this mapping in the backend README.md and in code comments so lab members can cross‑reference with Tongyi‑DeepResearch on Hugging Face.
## 2. Make agents, tools, and orchestration more modular
Goal: Keep the “deep research” flow clear and maintainable, and ready for later multi‑agent extensions.
Separate orchestration from implementation details
Problem: ResearchAgent currently knows about:
system prompts,
LLM instantiation,
LangGraph topology,
plus the concrete tools and execution mechanism.
Plan (within one iteration):
Treat ResearchAgent as graph orchestration only:
it should receive an LLM instance and a list of tools as dependencies.
tool wiring and LLM creation happen in a small factory (e.g. backend/agents/factory.py) or in main.py’s startup.
Keep the LangGraph nodes small and single‑purpose (you’re mostly there already: initialize, think_and_reason, execute_tools, should_continue).
Normalize tool interfaces across the stack
Problem: Tools are async, but you call asyncio.run inside both the LangChain wrapper and the research graph, which is risky in async environments and hides failures.
Plan:
Adopt a single design decision: tools are async, stateless services that return ToolResult.
Everywhere in your design, assume await tool.execute(...) at the edge; remove the notion of running event loops inside tools.
Keep BaseTool.to_langchain_tool() thin, using a clear contract: sync wrapper that delegates to an async execute in a controlled way (or vice‑versa); the key is to choose one pattern and document it.
Prepare for true multi‑agent later without over‑engineering now
Problem: README talks about “multi‑agent” but implementation is a single research agent with tools; that’s fine for v1, but expectations should match reality.
Plan for this iteration:
Keep one ResearchAgent but name and document its internal steps in terms of roles (e.g. planner, researcher, synthesizer) via prompts and graph node docs, instead of adding more Python classes.
Defer additional agents (e.g. a separate “writer” agent) to a future iteration; just ensure your current design doesn’t hard‑code assumptions that would block adding more nodes or sub‑graphs later.
## 3. Clean up the API layer and responsibilities
Goal: Have a thin, testable API layer, with clear separation between “research”, “clarification”, and “document generation”.
Split endpoints into dedicated modules
Problem: backend/main.py currently mixes:
app creation & CORS,
lifecycle wiring,
Pydantic models,
all endpoint logic.
Plan:
Keep main.py as the application entrypoint only, and move:
research routes into backend/api/research.py,
clarification routes into backend/api/clarification.py,
document generation routes into backend/api/documents.py.
In main.py, just:
create the FastAPI app,
register routers from those modules,
manage startup/shutdown (agent instantiation).
Clarify responsibilities of /api/clarification vs /api/generate-document
Problem: clarification questions are hard‑coded in main.py, while document generation is just a thin wrapper around a generic research call.
Plan:
For this iteration:
Move the template ID–to–questions mapping into a config or small module (e.g. backend/config/templates.py), so you don’t edit API code to add templates.
Keep clarification as a pure function of (template, task) – easy to unit test.
Define an internal “document generation spec” type:
includes template ID, task, answers, plus the derived combined prompt sections.
generate-document endpoint converts this spec to a call to ResearchAgent.
Align backend models with frontend types
Problem: You manually convert LangChain messages to messages_dict and the frontend has its own Message interface; drift is likely.
Plan:
Define a minimal, stable message schema used both in:
Pydantic ResearchResponse model,
frontend TypeScript Message type.
For this iteration, at least:
Agree on role, content, type, and tool_calls shape.
Add a short doc comment describing the contract.
Optionally later, you can generate TS types from OpenAPI, but for v1 a documented, manually synced contract is enough.
## 4. Improve configuration, observability, and safety for a small lab setting
Goal: Make behaviour predictable and debuggable for ~10 users, without adding heavy infrastructure.
Centralize and document key knobs
You already have Settings and .env; for v1, ensure:
all external integrations (Google search, Scholar, HTTP timeouts, LLM tokens/temperature, max iterations) are only configured through Settings,
defaults are conservative for lab usage (e.g. max_llm_calls, search result count, Python execution timeout),
backend README.md clearly documents these knobs in a “Tuning for a lab” section.
Add basic request‑scoped observability
Problem: Logs exist but aren’t clearly tied to a single research run; debugging will be painful if multiple users are active.
Plan:
Introduce a request / session ID generated in the API layer and passed into:
ResearchAgent.research,
tools (in metadata).
Log at least:
query summary + session ID,
tools invoked and their arguments (sanitized),
iteration count and whether you stopped via max iterations or <answer> detection.
This can stay entirely in logging—no DB needed—for a 10‑user lab.
Tighten Python interpreter assumptions
For v1, agree on a narrow usage story for python_interpreter:
what libraries are available,
reasonable limits for execution time and output size,
no disk or network access.
Document these limits in both:
the PythonInterpreterTool docstring,
the System Prompt / tools description text (so the LLM doesn’t try to do dangerous or impossible things).
## 5. Frontend–backend integration and UX for “research lab v1”
Goal: Make sure the UI accurately reflects what the backend can do now, and is ready for incremental upgrades (like streaming) without redesign.
Consolidate the data flow
Problem: You have both src/components/document-gen/mockBackend.tsx and real API calls; this can confuse future contributors.
Plan:
Treat the mock backend purely as a development fixture:
clearly label it as such in comments,
ensure the main path for the app uses apiClient against the real backend.
For v1, keep the happy path simple:
Task ⟶ (optional) Clarification ⟶ Generate Document (which internally calls research).
Prepare for streaming without committing to it yet
Backend LLM is already configured with streaming=True, but your API returns only final results.
For this iteration:
Keep HTTP POSTs returning the final ResearchResponse.
In the frontend, design your chat components (ChatArea, MessageBubble) such that incremental updates could be added later (message list is reactive and can append partial messages or status changes).
Document in the code or README that streaming is a planned enhancement, matching the “Future Enhancements” section in README.md.
## 6. Suggested execution order for “first iteration” refactor
To keep this tractable, you can implement the plan in this order:
Prompts & tool specs
Extract shared prompt/tool definitions to a single module and remove duplication.
API restructuring
Move endpoints into backend/api/*, make main.py an entrypoint only, and centralize clarification templates.
Tool & orchestration cleanup
Normalize tool interface and remove asyncio.run patterns; keep ResearchAgent focused on orchestration and not resource creation.
Contract alignment with frontend
Lock in the ResearchResponse / Message schema and update both sides + docs.
Config & observability
Add session IDs in logs, ensure .env controls all relevant knobs, and document limits (especially for the Python tool).
UX polish for lab
Ensure the main path uses the real backend, and adjust texts/UI so they match actual capabilities (non‑streaming, single main agent using tools).