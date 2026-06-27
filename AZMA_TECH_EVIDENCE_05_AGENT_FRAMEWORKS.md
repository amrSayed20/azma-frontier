# AZMA Technology Evidence Collection 05

## Domain
AI Agent Frameworks and Multi-Agent Systems

## Scope Statement
Evidence-only collection using primary sources (official docs, official developer docs, official repositories, official release artifacts/changelogs/specs).

## Fixed Research Areas (Applied Across Families)
1. Single-Agent Frameworks
2. Multi-Agent Frameworks
3. Agent Memory Systems
4. Agent Planning Systems
5. Agent Tool-Calling Frameworks
6. Workflow Orchestration Frameworks
7. Agent Communication Protocols
8. Human-in-the-Loop Systems
9. Autonomous Agent Architectures
10. Agent Observability and Monitoring

## Source Index
- S1: OpenAI Agents SDK docs: https://openai.github.io/openai-agents-python/
- S2: OpenAI Agents SDK repo: https://github.com/openai/openai-agents-python
- S3: LangGraph overview docs: https://docs.langchain.com/oss/python/langgraph/overview
- S4: LangGraph repo: https://github.com/langchain-ai/langgraph
- S5: CrewAI docs home: https://docs.crewai.com/
- S6: CrewAI telemetry docs: https://docs.crewai.com/en/telemetry
- S7: CrewAI repo: https://github.com/crewAIInc/crewAI
- S8: AutoGen docs: https://microsoft.github.io/autogen/stable/
- S9: AutoGen repo: https://github.com/microsoft/autogen
- S10: Microsoft Agent Framework repo: https://github.com/microsoft/agent-framework
- S11: Semantic Kernel overview docs: https://learn.microsoft.com/semantic-kernel/overview/
- S12: Semantic Kernel repo: https://github.com/microsoft/semantic-kernel
- S13: LlamaIndex agent docs: https://developers.llamaindex.ai/python/framework/understanding/agent/
- S14: LlamaIndex workflow docs: https://developers.llamaindex.ai/python/framework/understanding/workflows/
- S15: LlamaIndex repo: https://github.com/run-llama/llama_index
- S16: MCP introduction: https://modelcontextprotocol.io/introduction
- S17: MCP architecture docs: https://modelcontextprotocol.io/docs/learn/architecture
- S18: MCP lifecycle spec: https://modelcontextprotocol.io/specification/latest/basic/lifecycle
- S19: MCP spec repo: https://github.com/modelcontextprotocol/modelcontextprotocol
- S20: A2A protocol repo: https://github.com/a2aproject/A2A
- S21: LangSmith observability docs: https://docs.langchain.com/langsmith/observability

## Family Evidence

### 1) OpenAI Agents SDK
- Architecture: Lightweight runtime with primitives (agents, handoffs, guardrails, tools, sessions, tracing). [S1][S2]
- Core capabilities: Agent loop, function tools, MCP tools, handoffs, realtime agents, sandbox agents. [S1][S2]
- Memory support: Sessions and multiple session backends documented. [S1]
- Tool integration: Function tools and MCP server tool-calling explicitly documented. [S1]
- Multi-agent support: Agents-as-tools and handoffs explicitly documented. [S1][S2]
- Workflow capabilities: Managed turn/tool loop and orchestration patterns documented. [S1]
- Extensibility: Provider-agnostic and extension model references documented. [S2]
- Self-hosting support: SDK is open source and local docker/unix sandboxes are documented; hosted control-plane self-hosting model is UNKNOWN in retrieved sources. [S1][S2]
- API availability: Package and docs are public; runtime integrates with Responses API/models. [S1]
- Licensing: MIT. [S2]
- Enterprise readiness: Production-ready positioning and guardrails/tracing features documented. [S1]
- Community maturity: Public stars/forks/contributors/dependents listed. [S2]
- Documentation quality: High (quickstarts, references, memory, guardrails, HITL, tracing). [S1]
- Release cadence: Frequent tagged releases visible. [S2]
- Maintenance activity: Recent commits/issues/PR activity visible. [S2]
- Security considerations: SECURITY policy file present; MCP trust warning appears in related framework docs. [S2][S9]
- Operational considerations: Session persistence, tracing, streaming, and sandbox execution options documented. [S1]

### 2) LangGraph (LangChain ecosystem)
- Architecture: Low-level orchestration runtime for long-running, stateful agents/workflows. [S3][S4]
- Core capabilities: Persistence, human-in-the-loop, memory, deployment paths, debugging/trace integration. [S3][S4]
- Memory support: Short/long memory concepts linked in docs. [S3][S4]
- Tool integration: Works with LangChain models/tools; no hard dependency on LangChain. [S3]
- Multi-agent support: Ecosystem references Deep Agents and multi-agent usage patterns. [S4]
- Workflow capabilities: Stateful graph orchestration and durable execution. [S3][S4]
- Extensibility: Open-source library, low-level control, ecosystem integrations. [S3][S4]
- Self-hosting support: Open-source runtime install/run locally; managed deployment paths also referenced. [S3][S4]
- API availability: Python package and API references documented. [S3][S4]
- Licensing: MIT. [S4]
- Enterprise readiness: Production-ready deployment positioning and enterprise adopters cited. [S4]
- Community maturity: Large stars/forks/contributors/dependents listed. [S4]
- Documentation quality: High (overview, persistence, interrupts, memory, deployment references). [S3]
- Release cadence: High release count and recent releases visible. [S4]
- Maintenance activity: Active recent commits/issues/PRs. [S4]
- Security considerations: Security policy present in repo. [S4]
- Operational considerations: Persistence, long-running execution, and tracing/monitoring integration documented. [S3][S21]

### 3) CrewAI
- Architecture: Python framework combining autonomous Crews and event-driven Flows. [S5][S7]
- Core capabilities: Agents, tasks, crews, flows, tools, state, routing/branching, process modes. [S5][S7]
- Memory support: Agent-ready capabilities explicitly include memory/checkpointing. [S7]
- Tool integration: Tool usage and external integrations are documented. [S5][S7]
- Multi-agent support: Role-based multi-agent collaboration is core design. [S5][S7]
- Workflow capabilities: Event-driven flows with deterministic control and state management. [S5][S7]
- Extensibility: Python-native customization and integrations documented. [S7]
- Self-hosting support: Open-source runtime local use; AMP offers cloud and on-prem deployment options. [S7]
- API availability: CLI, package, and API reference docs available. [S5][S7]
- Licensing: MIT. [S7]
- Enterprise readiness: AMP suite claims governance/security/observability/support. [S7]
- Community maturity: Public stars/forks/contributors/dependents listed. [S7]
- Documentation quality: High breadth (concepts, enterprise guides, telemetry, examples). [S5][S6]
- Release cadence: Frequent releases with recent tags visible. [S7]
- Maintenance activity: Recent commits/issues/PR activity visible. [S7]
- Security considerations: Security policy present; telemetry controls and opt-in sharing warnings documented. [S6][S7]
- Operational considerations: Installation constraints, troubleshooting, process controls, and telemetry toggles documented. [S5][S6][S7]

### 4) AutoGen
- Architecture: Layered framework (Core, AgentChat, Extensions, Studio). [S8][S9]
- Core capabilities: Single/multi-agent conversational apps, event-driven runtime, extensions and tooling. [S8][S9]
- Memory support: UNKNOWN as explicit long-term memory subsystem details in retrieved sources.
- Tool integration: MCP workbench/tool examples and extension interfaces documented. [S8][S9]
- Multi-agent support: Explicit multi-agent orchestration patterns documented. [S8][S9]
- Workflow capabilities: Core event-driven runtime and orchestration examples documented. [S8][S9]
- Extensibility: Extensions API and community extension pathways documented. [S8]
- Self-hosting support: Open-source framework runnable by users; hosting control-plane specifics are UNKNOWN in retrieved sources.
- API availability: Public docs, packages, and examples are available. [S8][S9]
- Licensing: MIT (code) and CC-BY docs notices in repo. [S9]
- Enterprise readiness: Marked maintenance mode; new projects directed to Microsoft Agent Framework. [S9]
- Community maturity: Large stars/forks/contributors/dependents listed. [S9]
- Documentation quality: Broad docs exist, but maintenance-mode status affects forward roadmap. [S8][S9]
- Release cadence: Releases exist, but framework is in maintenance mode. [S9]
- Maintenance activity: Community-managed with limited contribution scope noted. [S9]
- Security considerations: Security policy present and MCP trust warnings in examples. [S9]
- Operational considerations: Migration guides to successor framework documented. [S8][S9]

### 5) Microsoft Agent Framework (MAF)
- Architecture: Open multi-language framework for production-grade agents and multi-agent workflows. [S10]
- Core capabilities: Orchestration patterns (sequential/concurrent/handoff/group), middleware, providers, hosted agents. [S10]
- Memory support: Foundry memory package references present; detailed memory semantics are UNKNOWN in retrieved excerpts. [S10]
- Tool integration: Agent/provider/tool samples and middleware hooks documented. [S10]
- Multi-agent support: Explicit multi-agent workflow support documented. [S10]
- Workflow capabilities: Graph-based orchestration with checkpointing, streaming, HITL, time-travel. [S10]
- Extensibility: Middleware, declarative agents, skills, multi-provider patterns documented. [S10]
- Self-hosting support: Local development and cloud hosting patterns documented. [S10]
- API availability: Python and .NET packages published. [S10]
- Licensing: MIT. [S10]
- Enterprise readiness: Production positioning, governance/observability/HITL focus, and migration paths from SK/AutoGen documented. [S10]
- Community maturity: Public stars/forks/contributors/release history visible. [S10]
- Documentation quality: Strong README plus MS Learn links and sample sets. [S10]
- Release cadence: Active recent releases and commits. [S10]
- Maintenance activity: Active repo churn and issue/PR flow. [S10]
- Security considerations: Security policy and responsible-use notes for third-party systems documented. [S10]
- Operational considerations: Troubleshooting guidance and credential/environment guidance documented. [S10]

### 6) Semantic Kernel
- Architecture: Lightweight middleware SDK for building agents and multi-agent systems. [S11][S12]
- Core capabilities: Plugin/function calling, model abstraction, process framework, multi-agent patterns. [S11][S12]
- Memory support: Agent framework claims include memory; granular memory subsystem details are limited in retrieved excerpts. [S12]
- Tool integration: Plugins/OpenAPI/MCP extension paths documented. [S11][S12]
- Multi-agent support: Multi-agent system examples explicitly documented. [S12]
- Workflow capabilities: Process framework for business workflows documented. [S12]
- Extensibility: Modular plugin ecosystem and connector strategy documented. [S11][S12]
- Self-hosting support: Local deployment options (Ollama/LMStudio/ONNX) documented. [S12]
- API availability: C#, Python, Java support and package links documented. [S11][S12]
- Licensing: MIT. [S12]
- Enterprise readiness: Enterprise-ready positioning and observability/security claims in official docs/repo. [S11][S12]
- Community maturity: Public stars/forks/contributors/release activity visible. [S12]
- Documentation quality: High (MS Learn docs + samples + API refs). [S11][S12]
- Release cadence: High release count with recent tags visible. [S12]
- Maintenance activity: Active recent commits/issues/PRs visible. [S12]
- Security considerations: Security policy present. [S12]
- Operational considerations: Troubleshooting and migration guidance are documented. [S12]

### 7) LlamaIndex
- Architecture: Open-source framework for agentic applications with core + integrations and workflow systems. [S13][S14][S15]
- Core capabilities: Function/tool agents, multi-agent workflows, retrieval/query composition, broad integrations. [S13][S14][S15]
- Memory support: State management and durable workflow context are documented in workflows pages. [S14]
- Tool integration: Agents use tools/functions; integration ecosystem is broad. [S13][S15]
- Multi-agent support: Multi-agent patterns and AgentWorkflow references documented. [S13][S14]
- Workflow capabilities: Event-driven workflows with branches, loops, concurrency, validation, durable runs. [S14]
- Extensibility: Core/integration packaging model and large integration surface documented. [S15]
- Self-hosting support: Open-source framework can be self-run; managed cloud services also exist. [S15]
- API availability: OSS packages/docs and cloud API dashboard are documented. [S13][S15]
- Licensing: MIT. [S15]
- Enterprise readiness: Enterprise platform and document-agent positioning is explicitly described in repo docs. [S15]
- Community maturity: Large stars/forks/contributors/dependents visible. [S15]
- Documentation quality: Extensive docs across framework/agents/workflows/changelog. [S13][S14][S15]
- Release cadence: Frequent releases visible. [S15]
- Maintenance activity: Active recent commits/issues/PRs visible. [S15]
- Security considerations: SECURITY policy present and build-asset verification notes documented. [S15]
- Operational considerations: Workflow validation, retries, durability, and streaming operations are documented. [S14]

### 8) Agent Communication Protocols (MCP and A2A)
- Architecture: MCP defines host-client-server context exchange; A2A defines agent-to-agent interoperability. [S16][S17][S20]
- Core capabilities: MCP primitives (tools/resources/prompts/sampling/elicitation/logging); A2A discovery, streaming, async collaboration. [S17][S20]
- Memory support: Protocol-level persistent memory semantics are not mandated; treated as implementation-specific. [S17][S20]
- Tool integration: MCP tools are first-class primitives; A2A supports agent capability negotiation and collaboration patterns. [S17][S20]
- Multi-agent support: A2A explicitly targets multi-agent interoperability across frameworks. [S20]
- Workflow capabilities: A2A documents sequential/hierarchical orchestration use in ecosystem examples; MCP supports task wrappers and notifications. [S17][S20]
- Extensibility: Both are open standards with SDK/spec ecosystems and governance artifacts. [S19][S20]
- Self-hosting support: Protocol servers are implementation-hosted by adopters (local/remote server modes documented for MCP). [S17][S20]
- API availability: Both expose public specifications and reference artifacts. [S18][S19][S20]
- Licensing: MCP spec repo MIT; A2A Apache-2.0. [S19][S20]
- Enterprise readiness: A2A and MCP both position security/auth/observability considerations in protocol docs; implementation quality is ecosystem-dependent. [S17][S18][S20]
- Community maturity: Public stars/forks/contributors/releases visible in both repos. [S19][S20]
- Documentation quality: High-level concept docs + formal specs are available. [S16][S17][S18][S20]
- Release cadence: Tagged releases visible for MCP and A2A. [S19][S20]
- Maintenance activity: Active issues/PRs/commits visible. [S19][S20]
- Security considerations: MCP lifecycle/version negotiation/timeouts and transport auth guidance; A2A security policy and secure collaboration intent documented. [S17][S18][S20]
- Operational considerations: Capability negotiation, lifecycle phases, timeout/error handling, and streaming transports are explicitly specified. [S17][S18][S20]

## Research Area Coverage Snapshot
- Single-Agent Frameworks: OpenAI Agents SDK, Semantic Kernel, LlamaIndex, CrewAI support single-agent patterns. [S1][S11][S13][S5]
- Multi-Agent Frameworks: LangGraph ecosystem, CrewAI, AutoGen, MAF, Semantic Kernel, LlamaIndex support multi-agent orchestration. [S3][S7][S9][S10][S12][S13]
- Agent Memory Systems: Explicit in OpenAI sessions, LangGraph memory, CrewAI memory/checkpointing, LlamaIndex workflow state/durability. [S1][S3][S7][S14]
- Agent Planning Systems: Present in orchestration workflows and planning references across MAF/LlamaIndex/LangGraph ecosystems. [S10][S14][S4]
- Tool-Calling Frameworks: Explicit in OpenAI tools, MCP tools, CrewAI tools, SK plugins/function calling, LlamaIndex function agents. [S1][S17][S7][S12][S13]
- Workflow Orchestration: Strongly explicit in LangGraph, CrewAI Flows, MAF workflows, LlamaIndex workflows. [S3][S7][S10][S14]
- Agent Communication Protocols: MCP and A2A are explicit protocol standards. [S16][S17][S18][S20]
- Human-in-the-Loop: Explicit in OpenAI, LangGraph, CrewAI, MAF, LlamaIndex. [S1][S3][S7][S10][S14]
- Autonomous Agent Architectures: Explicit role-based and orchestration runtimes across core families. [S4][S7][S9][S10]
- Observability and Monitoring: Explicit in LangSmith/LangGraph, CrewAI telemetry, MAF OpenTelemetry, OpenAI tracing, MCP/A2A observability intent. [S21][S6][S10][S1][S17][S20]

## Assumptions Register
- No assumptions were used for factual claims.
- Any item without explicit official evidence in the retrieved source set is marked UNKNOWN.
