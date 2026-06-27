# AZMA Technology Evidence Collection 05 Report

## Executive Summary

Technology Evidence Collection 05 for AI Agent Frameworks and Multi-Agent Systems is complete as an evidence-only constitutional activity using primary sources.

Created:
- AZMA_TECH_EVIDENCE_05_AGENT_FRAMEWORKS.md
- AZMA_TECH_EVIDENCE_05_REPORT.md

Primary-source evidence was collected across major framework and protocol families: OpenAI Agents SDK, LangGraph, CrewAI, AutoGen, Microsoft Agent Framework, Semantic Kernel, LlamaIndex, and open communication protocols (MCP and A2A).

Factual findings (no recommendations):
- Single-agent and multi-agent support are explicitly documented across most framework families, with strongest explicit orchestration coverage in LangGraph, CrewAI Flows, Microsoft Agent Framework workflows, AutoGen layered runtime, and LlamaIndex workflows.
- Memory and state are explicitly evidenced in several families (for example OpenAI sessions, LangGraph memory/persistence, CrewAI memory and checkpointing claims, LlamaIndex workflow state and durability). Where a framework does not explicitly describe a standalone memory subsystem in retrieved sources, it is marked UNKNOWN.
- Tool-calling is strongly evidenced through native function tools/plugins and protocol integration patterns (OpenAI function/MCP tools, Semantic Kernel plugins/OpenAPI/MCP, LlamaIndex function agents, CrewAI tooling).
- Workflow orchestration is explicitly a core capability in multiple families, including event-driven and graph-based patterns, branching, concurrency, checkpoints, and long-running execution support.
- Agent communication protocols are formally represented by MCP and A2A with published specifications, lifecycle/capability negotiation, and interoperability goals.
- Human-in-the-loop is explicitly documented in key families (OpenAI Agents SDK, LangGraph, CrewAI, Microsoft Agent Framework, LlamaIndex workflows).
- Observability and monitoring are explicitly documented through built-in tracing/telemetry integrations (OpenAI tracing, LangSmith observability, CrewAI telemetry controls, Microsoft Agent Framework OpenTelemetry), while protocol-level observability intent is described for MCP/A2A.
- Security and operations evidence includes repository security policies, lifecycle/version negotiation requirements (MCP), timeout/error guidance, telemetry controls, and documented warnings for third-party integrations in some frameworks.
- Ecosystem maturity signals are evidenced by official repository release histories, contributor counts, and ongoing maintenance activity for the surveyed projects.
- AutoGen is explicitly documented as maintenance mode in its official repository, with migration guidance to Microsoft Agent Framework; this was captured as factual lifecycle state, not evaluation.

All non-explicit items in retrieved official sources are marked UNKNOWN in the evidence ledger. No ranking, benchmarking, adoption recommendation, implementation plan, or architectural decision was produced.

STOP.

Wait for Chief Architect approval before Technology Evidence Collection 06.
