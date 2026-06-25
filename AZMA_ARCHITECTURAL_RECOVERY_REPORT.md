# AZMA ARCHITECTURAL RECOVERY REPORT

## File-Level Migration Plan

File: src/chambers/agent-resource-monitor.ts
Current Module: Chamber/root
Current Responsibility: Observes runtime behavior and emits operational health and telemetry signals.
Suggested Final Module: Core/al-wateen-assistant/monitoring
Migration Required: YES
Reason: Resource monitoring is a cross-platform supervisory capability and fits the Al-Wateen core monitoring subsystem.

File: src/chambers/director/director-chamber-controller.ts
Current Module: Chamber/director
Current Responsibility: Coordinates multi-component execution flow and routes directives across bounded contexts.
Suggested Final Module: Chamber/director
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/chronology-engine.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/confidence/confidence-engine.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/core/evidence-extractor.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements focused subsystem logic aligned with its current bounded context.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/core/evidence-scoring.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements focused subsystem logic aligned with its current bounded context.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/core/index.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Provides the entry-point and export surface for its subsystem.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/core/intelligence-engine.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/core/repository-manager.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Manages lifecycle, state transitions, and consistency for subsystem resources.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/cross-reference-engine.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/dispatch-engine.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/dna/knowledge-dna-engine.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/domain/claim-parser.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements focused subsystem logic aligned with its current bounded context.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/domain/evidence-bundle.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements focused subsystem logic aligned with its current bounded context.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/domain/evidence.types.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Defines strict contracts, payloads, and shared type boundaries for its subsystem.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/domain/index.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Provides the entry-point and export surface for its subsystem.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/index.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Provides the entry-point and export surface for its subsystem.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/intelligence-composition-factory.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements focused subsystem logic aligned with its current bounded context.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/knowledge-audit-engine.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/knowledge-bootstrap.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements focused subsystem logic aligned with its current bounded context.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/knowledge-cache-engine.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/knowledge-event-engine.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/knowledge-export-engine.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/knowledge-facade.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements focused subsystem logic aligned with its current bounded context.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/knowledge-freeze.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Enforces policy constraints, validation rules, and protection boundaries.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/knowledge-graph-engine.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/knowledge-index-engine.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/knowledge-indexer.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements focused subsystem logic aligned with its current bounded context.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/knowledge-integration-engine.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/knowledge-lifecycle-engine.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/knowledge-memory-index.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Persists, tracks, or retrieves stateful operational records for reliability and traceability.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/knowledge-memory-orchestrator.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Coordinates multi-component execution flow and routes directives across bounded contexts.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/knowledge-memory-registry.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Maintains registration and lookup of subsystem entities and capabilities.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/knowledge-memory-search.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Persists, tracks, or retrieves stateful operational records for reliability and traceability.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/knowledge-metrics-engine.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/knowledge-monitor.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Observes runtime behavior and emits operational health and telemetry signals.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/knowledge-orchestrator.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Coordinates multi-component execution flow and routes directives across bounded contexts.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/knowledge-pipeline.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements focused subsystem logic aligned with its current bounded context.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/knowledge-policy-engine.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/knowledge-registry.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Maintains registration and lookup of subsystem entities and capabilities.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/knowledge-report-engine.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/knowledge-repository-engine.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/knowledge-router.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Coordinates multi-component execution flow and routes directives across bounded contexts.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/knowledge-runtime.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements focused subsystem logic aligned with its current bounded context.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/knowledge-search-engine.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/knowledge-session-engine.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/knowledge-snapshot-engine.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/knowledge-state-engine.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/knowledge-validator.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Enforces policy constraints, validation rules, and protection boundaries.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/knowledge-version-engine.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/learning/dna-initializer.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements focused subsystem logic aligned with its current bounded context.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/learning/index.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Provides the entry-point and export surface for its subsystem.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/learning/interaction-logger.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Persists, tracks, or retrieves stateful operational records for reliability and traceability.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/memory-extractor-engine.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/providers/gutenberg-provider.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Supplies provider-facing capability contracts and provider execution bindings.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/providers/repository-provider.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Supplies provider-facing capability contracts and provider execution bindings.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/repositories/repository-manager.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Manages lifecycle, state transitions, and consistency for subsystem resources.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/source-registry-engine.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/timeline-archive-engine.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/types/repository.types.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Defines strict contracts, payloads, and shared type boundaries for its subsystem.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/verdict/verdict-engine.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/workspace/evidence-exporter.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Builds and exports structured outputs for reporting, diagnostics, or downstream consumption.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/workspace/index.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Provides the entry-point and export surface for its subsystem.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/hujjah-al-damighah/workspace/report-builder.ts
Current Module: Chamber/hujjah-al-damighah
Current Responsibility: Builds and exports structured outputs for reporting, diagnostics, or downstream consumption.
Suggested Final Module: Chamber/hujjah-al-damighah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/makman-al-ghayah/access-policy-engine.ts
Current Module: Chamber/makman-al-ghayah
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Chamber/makman-al-ghayah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/makman-al-ghayah/consumption-boundary.ts
Current Module: Chamber/makman-al-ghayah
Current Responsibility: Implements boundary adaptation between internal contracts and external integration surfaces.
Suggested Final Module: Chamber/makman-al-ghayah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/makman-al-ghayah/goal-completion-analyzer.ts
Current Module: Chamber/makman-al-ghayah
Current Responsibility: Plans, structures, and tracks goal-oriented execution artifacts in its chamber.
Suggested Final Module: Chamber/makman-al-ghayah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/makman-al-ghayah/goal-contracts.ts
Current Module: Chamber/makman-al-ghayah
Current Responsibility: Defines strict contracts, payloads, and shared type boundaries for its subsystem.
Suggested Final Module: Chamber/makman-al-ghayah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/makman-al-ghayah/goal-dependency-resolver.ts
Current Module: Chamber/makman-al-ghayah
Current Responsibility: Plans, structures, and tracks goal-oriented execution artifacts in its chamber.
Suggested Final Module: Chamber/makman-al-ghayah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/makman-al-ghayah/goal-export-interfaces.ts
Current Module: Chamber/makman-al-ghayah
Current Responsibility: Builds and exports structured outputs for reporting, diagnostics, or downstream consumption.
Suggested Final Module: Chamber/makman-al-ghayah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/makman-al-ghayah/goal-graph.ts
Current Module: Chamber/makman-al-ghayah
Current Responsibility: Plans, structures, and tracks goal-oriented execution artifacts in its chamber.
Suggested Final Module: Chamber/makman-al-ghayah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/makman-al-ghayah/goal-hierarchy.ts
Current Module: Chamber/makman-al-ghayah
Current Responsibility: Plans, structures, and tracks goal-oriented execution artifacts in its chamber.
Suggested Final Module: Chamber/makman-al-ghayah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/makman-al-ghayah/goal-metrics.ts
Current Module: Chamber/makman-al-ghayah
Current Responsibility: Observes runtime behavior and emits operational health and telemetry signals.
Suggested Final Module: Chamber/makman-al-ghayah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/makman-al-ghayah/goal-node.ts
Current Module: Chamber/makman-al-ghayah
Current Responsibility: Plans, structures, and tracks goal-oriented execution artifacts in its chamber.
Suggested Final Module: Chamber/makman-al-ghayah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/makman-al-ghayah/goal-orchestrator.ts
Current Module: Chamber/makman-al-ghayah
Current Responsibility: Coordinates multi-component execution flow and routes directives across bounded contexts.
Suggested Final Module: Chamber/makman-al-ghayah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/makman-al-ghayah/goal-planner.ts
Current Module: Chamber/makman-al-ghayah
Current Responsibility: Plans, structures, and tracks goal-oriented execution artifacts in its chamber.
Suggested Final Module: Chamber/makman-al-ghayah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/makman-al-ghayah/goal-prioritization-engine.ts
Current Module: Chamber/makman-al-ghayah
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Chamber/makman-al-ghayah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/makman-al-ghayah/goal-progress-tracker.ts
Current Module: Chamber/makman-al-ghayah
Current Responsibility: Plans, structures, and tracks goal-oriented execution artifacts in its chamber.
Suggested Final Module: Chamber/makman-al-ghayah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/makman-al-ghayah/goal-runtime.ts
Current Module: Chamber/makman-al-ghayah
Current Responsibility: Plans, structures, and tracks goal-oriented execution artifacts in its chamber.
Suggested Final Module: Chamber/makman-al-ghayah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/makman-al-ghayah/goal-session-manager.ts
Current Module: Chamber/makman-al-ghayah
Current Responsibility: Manages lifecycle, state transitions, and consistency for subsystem resources.
Suggested Final Module: Chamber/makman-al-ghayah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/makman-al-ghayah/goal-session-store.ts
Current Module: Chamber/makman-al-ghayah
Current Responsibility: Persists, tracks, or retrieves stateful operational records for reliability and traceability.
Suggested Final Module: Chamber/makman-al-ghayah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/makman-al-ghayah/goal-session.ts
Current Module: Chamber/makman-al-ghayah
Current Responsibility: Persists, tracks, or retrieves stateful operational records for reliability and traceability.
Suggested Final Module: Chamber/makman-al-ghayah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/makman-al-ghayah/goal-state.ts
Current Module: Chamber/makman-al-ghayah
Current Responsibility: Persists, tracks, or retrieves stateful operational records for reliability and traceability.
Suggested Final Module: Chamber/makman-al-ghayah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/makman-al-ghayah/goal-timeline-engine.ts
Current Module: Chamber/makman-al-ghayah
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Chamber/makman-al-ghayah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/makman-al-ghayah/index.ts
Current Module: Chamber/makman-al-ghayah
Current Responsibility: Provides the entry-point and export surface for its subsystem.
Suggested Final Module: Chamber/makman-al-ghayah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/makman-al-ghayah/monetization-ledger-gateway.ts
Current Module: Chamber/makman-al-ghayah
Current Responsibility: Implements boundary adaptation between internal contracts and external integration surfaces.
Suggested Final Module: Chamber/makman-al-ghayah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/makman-al-ghayah/publication-contracts.ts
Current Module: Chamber/makman-al-ghayah
Current Responsibility: Defines strict contracts, payloads, and shared type boundaries for its subsystem.
Suggested Final Module: Chamber/makman-al-ghayah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/makman-al-ghayah/rendering-bridge.ts
Current Module: Chamber/makman-al-ghayah
Current Responsibility: Implements boundary adaptation between internal contracts and external integration surfaces.
Suggested Final Module: Chamber/makman-al-ghayah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/qiyamah/agent-event-log.ts
Current Module: Chamber/qiyamah
Current Responsibility: Persists, tracks, or retrieves stateful operational records for reliability and traceability.
Suggested Final Module: Chamber/qiyamah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/qiyamah/agent-failover-manager.ts
Current Module: Chamber/qiyamah
Current Responsibility: Manages lifecycle, state transitions, and consistency for subsystem resources.
Suggested Final Module: Chamber/qiyamah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/qiyamah/agent-health-monitor.ts
Current Module: Chamber/qiyamah
Current Responsibility: Observes runtime behavior and emits operational health and telemetry signals.
Suggested Final Module: Chamber/qiyamah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/qiyamah/agent-registry.ts
Current Module: Chamber/qiyamah
Current Responsibility: Maintains registration and lookup of subsystem entities and capabilities.
Suggested Final Module: Chamber/qiyamah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/qiyamah/billing-agent.ts
Current Module: Chamber/qiyamah
Current Responsibility: Implements specialized agent behavior and agent-level execution responsibility.
Suggested Final Module: Chamber/qiyamah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/qiyamah/bridge/payload-transformer.ts
Current Module: Chamber/qiyamah
Current Responsibility: Implements focused subsystem logic aligned with its current bounded context.
Suggested Final Module: Chamber/qiyamah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/qiyamah/canvas-agent.ts
Current Module: Chamber/qiyamah
Current Responsibility: Implements specialized agent behavior and agent-level execution responsibility.
Suggested Final Module: Chamber/qiyamah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/qiyamah/character-agent.ts
Current Module: Chamber/qiyamah
Current Responsibility: Implements specialized agent behavior and agent-level execution responsibility.
Suggested Final Module: Chamber/qiyamah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/qiyamah/cost-agent.ts
Current Module: Chamber/qiyamah
Current Responsibility: Implements specialized agent behavior and agent-level execution responsibility.
Suggested Final Module: Chamber/qiyamah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/qiyamah/duration-agent.ts
Current Module: Chamber/qiyamah
Current Responsibility: Implements specialized agent behavior and agent-level execution responsibility.
Suggested Final Module: Chamber/qiyamah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/qiyamah/genesis-orchestrator.ts
Current Module: Chamber/qiyamah
Current Responsibility: Coordinates multi-component execution flow and routes directives across bounded contexts.
Suggested Final Module: Chamber/qiyamah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/qiyamah/genesis-runtime.ts
Current Module: Chamber/qiyamah
Current Responsibility: Implements focused subsystem logic aligned with its current bounded context.
Suggested Final Module: Chamber/qiyamah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/qiyamah/genesis-session-manager.ts
Current Module: Chamber/qiyamah
Current Responsibility: Manages lifecycle, state transitions, and consistency for subsystem resources.
Suggested Final Module: Chamber/qiyamah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/qiyamah/genesis-session-store.ts
Current Module: Chamber/qiyamah
Current Responsibility: Persists, tracks, or retrieves stateful operational records for reliability and traceability.
Suggested Final Module: Chamber/qiyamah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/qiyamah/genesis-session.ts
Current Module: Chamber/qiyamah
Current Responsibility: Persists, tracks, or retrieves stateful operational records for reliability and traceability.
Suggested Final Module: Chamber/qiyamah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/qiyamah/import-agent.ts
Current Module: Chamber/qiyamah
Current Responsibility: Implements specialized agent behavior and agent-level execution responsibility.
Suggested Final Module: Chamber/qiyamah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/qiyamah/index.ts
Current Module: Chamber/qiyamah
Current Responsibility: Provides the entry-point and export surface for its subsystem.
Suggested Final Module: Chamber/qiyamah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/qiyamah/master-agent.ts
Current Module: Chamber/qiyamah
Current Responsibility: Implements specialized agent behavior and agent-level execution responsibility.
Suggested Final Module: Chamber/qiyamah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/qiyamah/orbit-agent.ts
Current Module: Chamber/qiyamah
Current Responsibility: Implements specialized agent behavior and agent-level execution responsibility.
Suggested Final Module: Chamber/qiyamah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/qiyamah/progress-agent.ts
Current Module: Chamber/qiyamah
Current Responsibility: Plans, structures, and tracks goal-oriented execution artifacts in its chamber.
Suggested Final Module: Chamber/qiyamah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/qiyamah/prompt-agent.ts
Current Module: Chamber/qiyamah
Current Responsibility: Implements specialized agent behavior and agent-level execution responsibility.
Suggested Final Module: Chamber/qiyamah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/qiyamah/qiyamah-controller.ts
Current Module: Chamber/qiyamah
Current Responsibility: Coordinates multi-component execution flow and routes directives across bounded contexts.
Suggested Final Module: Chamber/qiyamah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/qiyamah/qiyamah-execution-boundary.ts
Current Module: Chamber/qiyamah
Current Responsibility: Implements boundary adaptation between internal contracts and external integration surfaces.
Suggested Final Module: Chamber/qiyamah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/qiyamah/qiyamah-intent-types.ts
Current Module: Chamber/qiyamah
Current Responsibility: Defines strict contracts, payloads, and shared type boundaries for its subsystem.
Suggested Final Module: Chamber/qiyamah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/qiyamah/quality-agent.ts
Current Module: Chamber/qiyamah
Current Responsibility: Implements specialized agent behavior and agent-level execution responsibility.
Suggested Final Module: Chamber/qiyamah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/qiyamah/render-agent.ts
Current Module: Chamber/qiyamah
Current Responsibility: Implements specialized agent behavior and agent-level execution responsibility.
Suggested Final Module: Chamber/qiyamah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/qiyamah/script-agent.ts
Current Module: Chamber/qiyamah
Current Responsibility: Implements specialized agent behavior and agent-level execution responsibility.
Suggested Final Module: Chamber/qiyamah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/qiyamah/store/qiyamah-state.ts
Current Module: Chamber/qiyamah
Current Responsibility: Persists, tracks, or retrieves stateful operational records for reliability and traceability.
Suggested Final Module: Chamber/qiyamah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/qiyamah/style-agent.ts
Current Module: Chamber/qiyamah
Current Responsibility: Implements specialized agent behavior and agent-level execution responsibility.
Suggested Final Module: Chamber/qiyamah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/qiyamah/voice-agent.ts
Current Module: Chamber/qiyamah
Current Responsibility: Implements specialized agent behavior and agent-level execution responsibility.
Suggested Final Module: Chamber/qiyamah
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/ras-al-amr/assembly-contracts.ts
Current Module: Chamber/ras-al-amr
Current Responsibility: Defines strict contracts, payloads, and shared type boundaries for its subsystem.
Suggested Final Module: Chamber/ras-al-amr
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/ras-al-amr/assembly-directive-payloads.ts
Current Module: Chamber/ras-al-amr
Current Responsibility: Defines strict contracts, payloads, and shared type boundaries for its subsystem.
Suggested Final Module: Chamber/ras-al-amr
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/ras-al-amr/pre-publishing-boundary.ts
Current Module: Chamber/ras-al-amr
Current Responsibility: Implements boundary adaptation between internal contracts and external integration surfaces.
Suggested Final Module: Chamber/ras-al-amr
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/ras-al-amr/ras-al-amr-state-manager.ts
Current Module: Chamber/ras-al-amr
Current Responsibility: Manages lifecycle, state transitions, and consistency for subsystem resources.
Suggested Final Module: Chamber/ras-al-amr
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/chambers/ras-al-amr/vault-rehydration-bridge.ts
Current Module: Chamber/ras-al-amr
Current Responsibility: Implements boundary adaptation between internal contracts and external integration surfaces.
Suggested Final Module: Chamber/ras-al-amr
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/core/al-wateen-assistant/health/health-checks.ts
Current Module: Core/al-wateen-assistant
Current Responsibility: Observes runtime behavior and emits operational health and telemetry signals.
Suggested Final Module: Core/al-wateen-assistant
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/core/al-wateen-assistant/health/health-engine.ts
Current Module: Core/al-wateen-assistant
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Core/al-wateen-assistant
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/core/al-wateen-assistant/health/health-reporter.ts
Current Module: Core/al-wateen-assistant
Current Responsibility: Observes runtime behavior and emits operational health and telemetry signals.
Suggested Final Module: Core/al-wateen-assistant
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/core/al-wateen-assistant/index.ts
Current Module: Core/al-wateen-assistant
Current Responsibility: Provides the entry-point and export surface for its subsystem.
Suggested Final Module: Core/al-wateen-assistant
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/core/al-wateen-assistant/monitoring/monitoring-engine.ts
Current Module: Core/al-wateen-assistant
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Core/al-wateen-assistant
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/core/al-wateen-assistant/monitoring/monitoring-events.ts
Current Module: Core/al-wateen-assistant
Current Responsibility: Observes runtime behavior and emits operational health and telemetry signals.
Suggested Final Module: Core/al-wateen-assistant
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/core/al-wateen-assistant/monitoring/monitoring-runtime.ts
Current Module: Core/al-wateen-assistant
Current Responsibility: Observes runtime behavior and emits operational health and telemetry signals.
Suggested Final Module: Core/al-wateen-assistant
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/core/al-wateen-assistant/notifications/notification-center.ts
Current Module: Core/al-wateen-assistant
Current Responsibility: Implements focused subsystem logic aligned with its current bounded context.
Suggested Final Module: Core/al-wateen-assistant
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/core/al-wateen-assistant/notifications/notification-engine.ts
Current Module: Core/al-wateen-assistant
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Core/al-wateen-assistant
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/core/al-wateen-assistant/providers/provider-health.ts
Current Module: Core/al-wateen-assistant
Current Responsibility: Observes runtime behavior and emits operational health and telemetry signals.
Suggested Final Module: Core/al-wateen-assistant
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/core/al-wateen-assistant/providers/provider-manager.ts
Current Module: Core/al-wateen-assistant
Current Responsibility: Manages lifecycle, state transitions, and consistency for subsystem resources.
Suggested Final Module: Core/al-wateen-assistant
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/core/al-wateen-assistant/providers/provider-selection.ts
Current Module: Core/al-wateen-assistant
Current Responsibility: Supplies provider-facing capability contracts and provider execution bindings.
Suggested Final Module: Core/al-wateen-assistant
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/core/al-wateen-assistant/recovery/failover-engine.ts
Current Module: Core/al-wateen-assistant
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Core/al-wateen-assistant
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/core/al-wateen-assistant/recovery/recovery-engine.ts
Current Module: Core/al-wateen-assistant
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Core/al-wateen-assistant
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/core/al-wateen-assistant/recovery/repair-engine.ts
Current Module: Core/al-wateen-assistant
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Core/al-wateen-assistant
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/core/al-wateen-assistant/recovery/restart-engine.ts
Current Module: Core/al-wateen-assistant
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Core/al-wateen-assistant
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/core/al-wateen-assistant/registry/al-wateen-registry.ts
Current Module: Core/al-wateen-assistant
Current Responsibility: Maintains registration and lookup of subsystem entities and capabilities.
Suggested Final Module: Core/al-wateen-assistant
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/core/al-wateen-assistant/reports/executive-report-engine.ts
Current Module: Core/al-wateen-assistant
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Core/al-wateen-assistant
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/core/al-wateen-assistant/reports/report-builder.ts
Current Module: Core/al-wateen-assistant
Current Responsibility: Builds and exports structured outputs for reporting, diagnostics, or downstream consumption.
Suggested Final Module: Core/al-wateen-assistant
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/core/al-wateen-assistant/scheduler/scheduler-engine.ts
Current Module: Core/al-wateen-assistant
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Core/al-wateen-assistant
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/core/al-wateen-assistant/services/assistant-bootstrap.ts
Current Module: Core/al-wateen-assistant
Current Responsibility: Implements focused subsystem logic aligned with its current bounded context.
Suggested Final Module: Core/al-wateen-assistant
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/core/al-wateen-assistant/services/assistant-runtime.ts
Current Module: Core/al-wateen-assistant
Current Responsibility: Implements focused subsystem logic aligned with its current bounded context.
Suggested Final Module: Core/al-wateen-assistant
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/core/al-wateen-assistant/state/al-wateen-state.ts
Current Module: Core/al-wateen-assistant
Current Responsibility: Persists, tracks, or retrieves stateful operational records for reliability and traceability.
Suggested Final Module: Core/al-wateen-assistant
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/core/al-wateen-assistant/telemetry/telemetry-engine.ts
Current Module: Core/al-wateen-assistant
Current Responsibility: Implements the core execution engine for its bounded capability.
Suggested Final Module: Core/al-wateen-assistant
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/core/al-wateen-assistant/telemetry/telemetry-storage.ts
Current Module: Core/al-wateen-assistant
Current Responsibility: Implements focused subsystem logic aligned with its current bounded context.
Suggested Final Module: Core/al-wateen-assistant
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/core/al-wateen-assistant/types/al-wateen.types.ts
Current Module: Core/al-wateen-assistant
Current Responsibility: Defines strict contracts, payloads, and shared type boundaries for its subsystem.
Suggested Final Module: Core/al-wateen-assistant
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/core/al-wateen-assistant/ui/dashboard-contracts.ts
Current Module: Core/al-wateen-assistant
Current Responsibility: Defines strict contracts, payloads, and shared type boundaries for its subsystem.
Suggested Final Module: Core/al-wateen-assistant
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/core/al-wateen-assistant/utils/constants.ts
Current Module: Core/al-wateen-assistant
Current Responsibility: Implements focused subsystem logic aligned with its current bounded context.
Suggested Final Module: Core/al-wateen-assistant
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/core/al-wateen-assistant/utils/guards.ts
Current Module: Core/al-wateen-assistant
Current Responsibility: Enforces policy constraints, validation rules, and protection boundaries.
Suggested Final Module: Core/al-wateen-assistant
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/core/al-wateen-assistant/utils/logger.ts
Current Module: Core/al-wateen-assistant
Current Responsibility: Persists, tracks, or retrieves stateful operational records for reliability and traceability.
Suggested Final Module: Core/al-wateen-assistant
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/core/al-wateen-assistant/utils/time.ts
Current Module: Core/al-wateen-assistant
Current Responsibility: Implements focused subsystem logic aligned with its current bounded context.
Suggested Final Module: Core/al-wateen-assistant
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/gateway/bab-al-wusul/adapters/express-transport-adapter.ts
Current Module: Gateway/bab-al-wusul
Current Responsibility: Implements boundary adaptation between internal contracts and external integration surfaces.
Suggested Final Module: Gateway/bab-al-wusul
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/gateway/bab-al-wusul/authentication-contracts.ts
Current Module: Gateway/bab-al-wusul
Current Responsibility: Defines strict contracts, payloads, and shared type boundaries for its subsystem.
Suggested Final Module: Gateway/bab-al-wusul
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/gateway/bab-al-wusul/chamber-route-registry.ts
Current Module: Gateway/bab-al-wusul
Current Responsibility: Maintains registration and lookup of subsystem entities and capabilities.
Suggested Final Module: Gateway/bab-al-wusul
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/gateway/bab-al-wusul/gateway-activation-coordinator.ts
Current Module: Gateway/bab-al-wusul
Current Responsibility: Implements boundary adaptation between internal contracts and external integration surfaces.
Suggested Final Module: Gateway/bab-al-wusul
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/gateway/bab-al-wusul/gateway-bootstrap-verification-service.ts
Current Module: Gateway/bab-al-wusul
Current Responsibility: Implements boundary adaptation between internal contracts and external integration surfaces.
Suggested Final Module: Gateway/bab-al-wusul
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/gateway/bab-al-wusul/gateway-bootstrapper.ts
Current Module: Gateway/bab-al-wusul
Current Responsibility: Implements boundary adaptation between internal contracts and external integration surfaces.
Suggested Final Module: Gateway/bab-al-wusul
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/gateway/bab-al-wusul/gateway-composition-manifest.ts
Current Module: Gateway/bab-al-wusul
Current Responsibility: Implements boundary adaptation between internal contracts and external integration surfaces.
Suggested Final Module: Gateway/bab-al-wusul
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/gateway/bab-al-wusul/gateway-diagnostics-service.ts
Current Module: Gateway/bab-al-wusul
Current Responsibility: Implements boundary adaptation between internal contracts and external integration surfaces.
Suggested Final Module: Gateway/bab-al-wusul
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/gateway/bab-al-wusul/gateway-lifecycle-manager.ts
Current Module: Gateway/bab-al-wusul
Current Responsibility: Manages lifecycle, state transitions, and consistency for subsystem resources.
Suggested Final Module: Gateway/bab-al-wusul
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/gateway/bab-al-wusul/gateway-topology-contracts.ts
Current Module: Gateway/bab-al-wusul
Current Responsibility: Defines strict contracts, payloads, and shared type boundaries for its subsystem.
Suggested Final Module: Gateway/bab-al-wusul
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/gateway/bab-al-wusul/index.ts
Current Module: Gateway/bab-al-wusul
Current Responsibility: Provides the entry-point and export surface for its subsystem.
Suggested Final Module: Gateway/bab-al-wusul
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/gateway/bab-al-wusul/omni-router.ts
Current Module: Gateway/bab-al-wusul
Current Responsibility: Coordinates multi-component execution flow and routes directives across bounded contexts.
Suggested Final Module: Gateway/bab-al-wusul
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/gateway/bab-al-wusul/perimeter-enforcer.ts
Current Module: Gateway/bab-al-wusul
Current Responsibility: Enforces policy constraints, validation rules, and protection boundaries.
Suggested Final Module: Gateway/bab-al-wusul
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/gateway/bab-al-wusul/route-validation-layer.ts
Current Module: Gateway/bab-al-wusul
Current Responsibility: Enforces policy constraints, validation rules, and protection boundaries.
Suggested Final Module: Gateway/bab-al-wusul
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/gateway/bab-al-wusul/transport-adapter-contracts.ts
Current Module: Gateway/bab-al-wusul
Current Responsibility: Defines strict contracts, payloads, and shared type boundaries for its subsystem.
Suggested Final Module: Gateway/bab-al-wusul
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/orchestrator/al-watin/al-watin-bootstrapper.ts
Current Module: Orchestrator/al-watin
Current Responsibility: Implements focused subsystem logic aligned with its current bounded context.
Suggested Final Module: Orchestrator/al-watin
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/orchestrator/al-watin/execution-router.ts
Current Module: Orchestrator/al-watin
Current Responsibility: Coordinates multi-component execution flow and routes directives across bounded contexts.
Suggested Final Module: Orchestrator/al-watin
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/orchestrator/al-watin/fleet/adapters/base-provider-adapter.ts
Current Module: Orchestrator/al-watin
Current Responsibility: Implements boundary adaptation between internal contracts and external integration surfaces.
Suggested Final Module: Orchestrator/al-watin
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/orchestrator/al-watin/fleet/adapters/native-structural-adapter.ts
Current Module: Orchestrator/al-watin
Current Responsibility: Implements boundary adaptation between internal contracts and external integration surfaces.
Suggested Final Module: Orchestrator/al-watin
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/orchestrator/al-watin/fleet/asynchronous-resolution-gateway.ts
Current Module: Orchestrator/al-watin
Current Responsibility: Implements boundary adaptation between internal contracts and external integration surfaces.
Suggested Final Module: Orchestrator/al-watin
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/orchestrator/al-watin/fleet/fleet-dispatcher.ts
Current Module: Orchestrator/al-watin
Current Responsibility: Implements focused subsystem logic aligned with its current bounded context.
Suggested Final Module: Orchestrator/al-watin
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/orchestrator/al-watin/fleet/fleet-registry.ts
Current Module: Orchestrator/al-watin
Current Responsibility: Maintains registration and lookup of subsystem entities and capabilities.
Suggested Final Module: Orchestrator/al-watin
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/orchestrator/al-watin/fleet/fleet-types.ts
Current Module: Orchestrator/al-watin
Current Responsibility: Defines strict contracts, payloads, and shared type boundaries for its subsystem.
Suggested Final Module: Orchestrator/al-watin
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/orchestrator/al-watin/fleet/secure-context-hydrator.ts
Current Module: Orchestrator/al-watin
Current Responsibility: Implements focused subsystem logic aligned with its current bounded context.
Suggested Final Module: Orchestrator/al-watin
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/orchestrator/al-watin/ledger/operation-ledger-manager.ts
Current Module: Orchestrator/al-watin
Current Responsibility: Manages lifecycle, state transitions, and consistency for subsystem resources.
Suggested Final Module: Orchestrator/al-watin
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/orchestrator/al-watin/ledger/operation-ledger-types.ts
Current Module: Orchestrator/al-watin
Current Responsibility: Defines strict contracts, payloads, and shared type boundaries for its subsystem.
Suggested Final Module: Orchestrator/al-watin
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/orchestrator/al-watin/sovereign-policy-guard.ts
Current Module: Orchestrator/al-watin
Current Responsibility: Enforces policy constraints, validation rules, and protection boundaries.
Suggested Final Module: Orchestrator/al-watin
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/shared/contracts/bridge.types.ts
Current Module: Shared/contracts
Current Responsibility: Defines strict contracts, payloads, and shared type boundaries for its subsystem.
Suggested Final Module: Shared/contracts
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/system-root/index.ts
Current Module: System-Root
Current Responsibility: Provides the entry-point and export surface for its subsystem.
Suggested Final Module: System-Root
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/system-root/master-route-assembler.ts
Current Module: System-Root
Current Responsibility: Coordinates multi-component execution flow and routes directives across bounded contexts.
Suggested Final Module: System-Root
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/system-root/root-infrastructure-providers.ts
Current Module: System-Root
Current Responsibility: Supplies provider-facing capability contracts and provider execution bindings.
Suggested Final Module: System-Root
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/system-root/sovereign-environment-matrix.ts
Current Module: System-Root
Current Responsibility: Implements focused subsystem logic aligned with its current bounded context.
Suggested Final Module: System-Root
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/system-root/sovereign-genesis-application.ts
Current Module: System-Root
Current Responsibility: Implements focused subsystem logic aligned with its current bounded context.
Suggested Final Module: System-Root
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/vault/sovereign-vault-manager.ts
Current Module: Vault
Current Responsibility: Manages lifecycle, state transitions, and consistency for subsystem resources.
Suggested Final Module: Vault
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

File: src/vault/sovereign-vault-types.ts
Current Module: Vault
Current Responsibility: Defines strict contracts, payloads, and shared type boundaries for its subsystem.
Suggested Final Module: Vault
Migration Required: NO
Reason: No architectural conflict detected; current placement aligns with bounded context responsibility.

## Files that already match the Sovereign Architecture

- src/chambers/director/director-chamber-controller.ts
- src/chambers/hujjah-al-damighah/chronology-engine.ts
- src/chambers/hujjah-al-damighah/confidence/confidence-engine.ts
- src/chambers/hujjah-al-damighah/core/evidence-extractor.ts
- src/chambers/hujjah-al-damighah/core/evidence-scoring.ts
- src/chambers/hujjah-al-damighah/core/index.ts
- src/chambers/hujjah-al-damighah/core/intelligence-engine.ts
- src/chambers/hujjah-al-damighah/core/repository-manager.ts
- src/chambers/hujjah-al-damighah/cross-reference-engine.ts
- src/chambers/hujjah-al-damighah/dispatch-engine.ts
- src/chambers/hujjah-al-damighah/dna/knowledge-dna-engine.ts
- src/chambers/hujjah-al-damighah/domain/claim-parser.ts
- src/chambers/hujjah-al-damighah/domain/evidence-bundle.ts
- src/chambers/hujjah-al-damighah/domain/evidence.types.ts
- src/chambers/hujjah-al-damighah/domain/index.ts
- src/chambers/hujjah-al-damighah/index.ts
- src/chambers/hujjah-al-damighah/intelligence-composition-factory.ts
- src/chambers/hujjah-al-damighah/knowledge-audit-engine.ts
- src/chambers/hujjah-al-damighah/knowledge-bootstrap.ts
- src/chambers/hujjah-al-damighah/knowledge-cache-engine.ts
- src/chambers/hujjah-al-damighah/knowledge-event-engine.ts
- src/chambers/hujjah-al-damighah/knowledge-export-engine.ts
- src/chambers/hujjah-al-damighah/knowledge-facade.ts
- src/chambers/hujjah-al-damighah/knowledge-freeze.ts
- src/chambers/hujjah-al-damighah/knowledge-graph-engine.ts
- src/chambers/hujjah-al-damighah/knowledge-index-engine.ts
- src/chambers/hujjah-al-damighah/knowledge-indexer.ts
- src/chambers/hujjah-al-damighah/knowledge-integration-engine.ts
- src/chambers/hujjah-al-damighah/knowledge-lifecycle-engine.ts
- src/chambers/hujjah-al-damighah/knowledge-memory-index.ts
- src/chambers/hujjah-al-damighah/knowledge-memory-orchestrator.ts
- src/chambers/hujjah-al-damighah/knowledge-memory-registry.ts
- src/chambers/hujjah-al-damighah/knowledge-memory-search.ts
- src/chambers/hujjah-al-damighah/knowledge-metrics-engine.ts
- src/chambers/hujjah-al-damighah/knowledge-monitor.ts
- src/chambers/hujjah-al-damighah/knowledge-orchestrator.ts
- src/chambers/hujjah-al-damighah/knowledge-pipeline.ts
- src/chambers/hujjah-al-damighah/knowledge-policy-engine.ts
- src/chambers/hujjah-al-damighah/knowledge-registry.ts
- src/chambers/hujjah-al-damighah/knowledge-report-engine.ts
- src/chambers/hujjah-al-damighah/knowledge-repository-engine.ts
- src/chambers/hujjah-al-damighah/knowledge-router.ts
- src/chambers/hujjah-al-damighah/knowledge-runtime.ts
- src/chambers/hujjah-al-damighah/knowledge-search-engine.ts
- src/chambers/hujjah-al-damighah/knowledge-session-engine.ts
- src/chambers/hujjah-al-damighah/knowledge-snapshot-engine.ts
- src/chambers/hujjah-al-damighah/knowledge-state-engine.ts
- src/chambers/hujjah-al-damighah/knowledge-validator.ts
- src/chambers/hujjah-al-damighah/knowledge-version-engine.ts
- src/chambers/hujjah-al-damighah/learning/dna-initializer.ts
- src/chambers/hujjah-al-damighah/learning/index.ts
- src/chambers/hujjah-al-damighah/learning/interaction-logger.ts
- src/chambers/hujjah-al-damighah/memory-extractor-engine.ts
- src/chambers/hujjah-al-damighah/providers/gutenberg-provider.ts
- src/chambers/hujjah-al-damighah/providers/repository-provider.ts
- src/chambers/hujjah-al-damighah/repositories/repository-manager.ts
- src/chambers/hujjah-al-damighah/source-registry-engine.ts
- src/chambers/hujjah-al-damighah/timeline-archive-engine.ts
- src/chambers/hujjah-al-damighah/types/repository.types.ts
- src/chambers/hujjah-al-damighah/verdict/verdict-engine.ts
- src/chambers/hujjah-al-damighah/workspace/evidence-exporter.ts
- src/chambers/hujjah-al-damighah/workspace/index.ts
- src/chambers/hujjah-al-damighah/workspace/report-builder.ts
- src/chambers/makman-al-ghayah/access-policy-engine.ts
- src/chambers/makman-al-ghayah/consumption-boundary.ts
- src/chambers/makman-al-ghayah/goal-completion-analyzer.ts
- src/chambers/makman-al-ghayah/goal-contracts.ts
- src/chambers/makman-al-ghayah/goal-dependency-resolver.ts
- src/chambers/makman-al-ghayah/goal-export-interfaces.ts
- src/chambers/makman-al-ghayah/goal-graph.ts
- src/chambers/makman-al-ghayah/goal-hierarchy.ts
- src/chambers/makman-al-ghayah/goal-metrics.ts
- src/chambers/makman-al-ghayah/goal-node.ts
- src/chambers/makman-al-ghayah/goal-orchestrator.ts
- src/chambers/makman-al-ghayah/goal-planner.ts
- src/chambers/makman-al-ghayah/goal-prioritization-engine.ts
- src/chambers/makman-al-ghayah/goal-progress-tracker.ts
- src/chambers/makman-al-ghayah/goal-runtime.ts
- src/chambers/makman-al-ghayah/goal-session-manager.ts
- src/chambers/makman-al-ghayah/goal-session-store.ts
- src/chambers/makman-al-ghayah/goal-session.ts
- src/chambers/makman-al-ghayah/goal-state.ts
- src/chambers/makman-al-ghayah/goal-timeline-engine.ts
- src/chambers/makman-al-ghayah/index.ts
- src/chambers/makman-al-ghayah/monetization-ledger-gateway.ts
- src/chambers/makman-al-ghayah/publication-contracts.ts
- src/chambers/makman-al-ghayah/rendering-bridge.ts
- src/chambers/qiyamah/agent-event-log.ts
- src/chambers/qiyamah/agent-failover-manager.ts
- src/chambers/qiyamah/agent-health-monitor.ts
- src/chambers/qiyamah/agent-registry.ts
- src/chambers/qiyamah/billing-agent.ts
- src/chambers/qiyamah/bridge/payload-transformer.ts
- src/chambers/qiyamah/canvas-agent.ts
- src/chambers/qiyamah/character-agent.ts
- src/chambers/qiyamah/cost-agent.ts
- src/chambers/qiyamah/duration-agent.ts
- src/chambers/qiyamah/genesis-orchestrator.ts
- src/chambers/qiyamah/genesis-runtime.ts
- src/chambers/qiyamah/genesis-session-manager.ts
- src/chambers/qiyamah/genesis-session-store.ts
- src/chambers/qiyamah/genesis-session.ts
- src/chambers/qiyamah/import-agent.ts
- src/chambers/qiyamah/index.ts
- src/chambers/qiyamah/master-agent.ts
- src/chambers/qiyamah/orbit-agent.ts
- src/chambers/qiyamah/progress-agent.ts
- src/chambers/qiyamah/prompt-agent.ts
- src/chambers/qiyamah/qiyamah-controller.ts
- src/chambers/qiyamah/qiyamah-execution-boundary.ts
- src/chambers/qiyamah/qiyamah-intent-types.ts
- src/chambers/qiyamah/quality-agent.ts
- src/chambers/qiyamah/render-agent.ts
- src/chambers/qiyamah/script-agent.ts
- src/chambers/qiyamah/store/qiyamah-state.ts
- src/chambers/qiyamah/style-agent.ts
- src/chambers/qiyamah/voice-agent.ts
- src/chambers/ras-al-amr/assembly-contracts.ts
- src/chambers/ras-al-amr/assembly-directive-payloads.ts
- src/chambers/ras-al-amr/pre-publishing-boundary.ts
- src/chambers/ras-al-amr/ras-al-amr-state-manager.ts
- src/chambers/ras-al-amr/vault-rehydration-bridge.ts
- src/core/al-wateen-assistant/health/health-checks.ts
- src/core/al-wateen-assistant/health/health-engine.ts
- src/core/al-wateen-assistant/health/health-reporter.ts
- src/core/al-wateen-assistant/index.ts
- src/core/al-wateen-assistant/monitoring/monitoring-engine.ts
- src/core/al-wateen-assistant/monitoring/monitoring-events.ts
- src/core/al-wateen-assistant/monitoring/monitoring-runtime.ts
- src/core/al-wateen-assistant/notifications/notification-center.ts
- src/core/al-wateen-assistant/notifications/notification-engine.ts
- src/core/al-wateen-assistant/providers/provider-health.ts
- src/core/al-wateen-assistant/providers/provider-manager.ts
- src/core/al-wateen-assistant/providers/provider-selection.ts
- src/core/al-wateen-assistant/recovery/failover-engine.ts
- src/core/al-wateen-assistant/recovery/recovery-engine.ts
- src/core/al-wateen-assistant/recovery/repair-engine.ts
- src/core/al-wateen-assistant/recovery/restart-engine.ts
- src/core/al-wateen-assistant/registry/al-wateen-registry.ts
- src/core/al-wateen-assistant/reports/executive-report-engine.ts
- src/core/al-wateen-assistant/reports/report-builder.ts
- src/core/al-wateen-assistant/scheduler/scheduler-engine.ts
- src/core/al-wateen-assistant/services/assistant-bootstrap.ts
- src/core/al-wateen-assistant/services/assistant-runtime.ts
- src/core/al-wateen-assistant/state/al-wateen-state.ts
- src/core/al-wateen-assistant/telemetry/telemetry-engine.ts
- src/core/al-wateen-assistant/telemetry/telemetry-storage.ts
- src/core/al-wateen-assistant/types/al-wateen.types.ts
- src/core/al-wateen-assistant/ui/dashboard-contracts.ts
- src/core/al-wateen-assistant/utils/constants.ts
- src/core/al-wateen-assistant/utils/guards.ts
- src/core/al-wateen-assistant/utils/logger.ts
- src/core/al-wateen-assistant/utils/time.ts
- src/gateway/bab-al-wusul/adapters/express-transport-adapter.ts
- src/gateway/bab-al-wusul/authentication-contracts.ts
- src/gateway/bab-al-wusul/chamber-route-registry.ts
- src/gateway/bab-al-wusul/gateway-activation-coordinator.ts
- src/gateway/bab-al-wusul/gateway-bootstrap-verification-service.ts
- src/gateway/bab-al-wusul/gateway-bootstrapper.ts
- src/gateway/bab-al-wusul/gateway-composition-manifest.ts
- src/gateway/bab-al-wusul/gateway-diagnostics-service.ts
- src/gateway/bab-al-wusul/gateway-lifecycle-manager.ts
- src/gateway/bab-al-wusul/gateway-topology-contracts.ts
- src/gateway/bab-al-wusul/index.ts
- src/gateway/bab-al-wusul/omni-router.ts
- src/gateway/bab-al-wusul/perimeter-enforcer.ts
- src/gateway/bab-al-wusul/route-validation-layer.ts
- src/gateway/bab-al-wusul/transport-adapter-contracts.ts
- src/orchestrator/al-watin/al-watin-bootstrapper.ts
- src/orchestrator/al-watin/execution-router.ts
- src/orchestrator/al-watin/fleet/adapters/base-provider-adapter.ts
- src/orchestrator/al-watin/fleet/adapters/native-structural-adapter.ts
- src/orchestrator/al-watin/fleet/asynchronous-resolution-gateway.ts
- src/orchestrator/al-watin/fleet/fleet-dispatcher.ts
- src/orchestrator/al-watin/fleet/fleet-registry.ts
- src/orchestrator/al-watin/fleet/fleet-types.ts
- src/orchestrator/al-watin/fleet/secure-context-hydrator.ts
- src/orchestrator/al-watin/ledger/operation-ledger-manager.ts
- src/orchestrator/al-watin/ledger/operation-ledger-types.ts
- src/orchestrator/al-watin/sovereign-policy-guard.ts
- src/shared/contracts/bridge.types.ts
- src/system-root/index.ts
- src/system-root/master-route-assembler.ts
- src/system-root/root-infrastructure-providers.ts
- src/system-root/sovereign-environment-matrix.ts
- src/system-root/sovereign-genesis-application.ts
- src/vault/sovereign-vault-manager.ts
- src/vault/sovereign-vault-types.ts

## Files that require relocation

- src/chambers/agent-resource-monitor.ts

## Files that require redesign

- src/core/al-wateen-assistant/monitoring/monitoring-runtime.ts
- src/core/al-wateen-assistant/health/health-engine.ts
- src/core/al-wateen-assistant/telemetry/telemetry-engine.ts
- src/core/al-wateen-assistant/reports/executive-report-engine.ts
- src/core/al-wateen-assistant/scheduler/scheduler-engine.ts

## Missing subsystems

- Dedicated integration test subsystem for cross-chamber orchestration validation
- Unified observability aggregation boundary for chamber metrics normalization
- Explicit dependency rule matrix to enforce one-way chamber/core/gateway boundaries

## Possible duplicate responsibilities

- Monitoring overlap: src/chambers/qiyamah/agent-health-monitor.ts and src/core/al-wateen-assistant/health/health-engine.ts
- Failover overlap: src/chambers/qiyamah/agent-failover-manager.ts and src/core/al-wateen-assistant/recovery/failover-engine.ts
- Reporting overlap: src/chambers/hujjah-al-damighah/workspace/report-builder.ts and src/core/al-wateen-assistant/reports/report-builder.ts
- Registry overlap: chamber-level registries and src/core/al-wateen-assistant/registry/al-wateen-registry.ts

## Potential architectural risks

- Cross-cutting runtime monitoring capabilities exist both inside chambers and core, increasing drift risk.
- Multiple lifecycle and state managers across subsystems increase probability of inconsistent state transitions.
- Provider, gateway, and orchestration boundaries are broad and could accumulate hidden coupling without strict import governance.
- High number of engine classes across chambers can introduce semantic overlap without explicit capability ownership registry.
