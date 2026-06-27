# AZMA Technology Evidence Collection 06

## Domain
Cross-System Orchestration and End-to-End Creative Pipelines

## Scope Statement
Evidence-only collection using primary sources (official documentation, official architecture documentation, official engineering/developer docs, official repositories/specs).

## Fixed Research Areas (Applied Across Patterns)
1. End-to-end AI production pipelines
2. Multi-model orchestration
3. Prompt chaining
4. Workflow engines
5. Event-driven orchestration
6. Long-running AI jobs
7. Human approval checkpoints
8. Asset lifecycle management
9. AI memory during long workflows
10. Failure recovery
11. Retry strategies
12. Parallel execution
13. Dependency management
14. Checkpointing
15. Progressive delivery
16. Background processing
17. Queue coordination
18. Streaming user experience
19. AI pipeline observability
20. Production orchestration patterns

## Source Index
- S1: Temporal Workflows docs: https://docs.temporal.io/workflows
- S2: AWS Step Functions overview: https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html
- S3: Google Cloud Workflows overview: https://docs.cloud.google.com/workflows/docs/overview
- S4: Google Cloud Workflows retry syntax: https://docs.cloud.google.com/workflows/docs/reference/syntax/retrying
- S5: Google Cloud Workflows callbacks: https://docs.cloud.google.com/workflows/docs/creating-callback-endpoints
- S6: Google Cloud Workflows execution/backlogging: https://docs.cloud.google.com/workflows/docs/executing-workflow
- S7: Azure Durable Functions overview: https://learn.microsoft.com/azure/azure-functions/durable/durable-functions-overview
- S8: Argo Workflows docs: https://argo-workflows.readthedocs.io/en/latest/
- S9: Apache Airflow architecture overview: https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/overview.html
- S10: Prefect v3 introduction/get-started: https://docs.prefect.io/v3/get-started
- S11: Dagster getting started: https://docs.dagster.io/getting-started
- S12: Dagster assets guide: https://docs.dagster.io/guides/build/assets
- S13: Google Cloud Pub/Sub overview: https://docs.cloud.google.com/pubsub/docs/overview
- S14: Google Cloud Tasks overview: https://docs.cloud.google.com/tasks/docs/dual-overview
- S15: Argo Rollouts docs: https://argo-rollouts.readthedocs.io/en/stable/

## Orchestration Pattern Evidence

### 1) Durable Workflow Runtime (Temporal)
- Purpose: Temporal documents workflow execution as durable, code-defined orchestration for distributed steps. [S1]
- Architecture: Event History replay is the source of truth; workflow code is replayed deterministically, and external effects are isolated in Activities. [S1]
- Advantages: Workflows are documented as resilient, recoverable after failures, and capable of very long runtimes. [S1]
- Limitations: Determinism constraints are explicit (for example, no direct non-deterministic time/random/network inside workflow logic). [S1]
- Enterprise usage: UNKNOWN in retrieved source excerpts for named enterprise case studies.
- Scalability: UNKNOWN in retrieved source excerpts for explicit numeric throughput limits.
- Operational considerations: Replay behavior, deterministic APIs, and activity-boundary design are explicit operational constraints. [S1]
- Suitability for cinematic AI production: UNKNOWN in official retrieved sources.

### 2) Cloud State-Machine Orchestration (AWS Step Functions)
- Purpose: Step Functions is documented for distributed applications, process automation, microservice orchestration, and data/ML pipelines. [S2]
- Architecture: Workflows are state machines with state transitions and integrations; service patterns include Request Response, Run a Job (.sync), and Wait for Callback (.waitForTaskToken). [S2]
- Advantages: Standard workflows provide execution history/visual debugging, exactly-once execution, and up to one-year duration. [S2]
- Limitations: Express workflows are documented with at-least-once semantics and up to five-minute execution duration. [S2]
- Enterprise usage: Official examples include human-in-the-loop approvals, error handling with Retry/Catch, Parallel, and Map-based large-item processing. [S2]
- Scalability: Official throughput differences are documented between Standard and Express types. [S2]
- Operational considerations: Retry/Catch, callback tokens, integration-pattern support boundaries by workflow type, and execution history/logging are explicit. [S2]
- Suitability for cinematic AI production: UNKNOWN in official retrieved sources.

### 3) Serverless Service-Orchestration DSL (Google Cloud Workflows)
- Purpose: Workflows is documented as a fully managed serverless orchestration platform for Google Cloud services, custom services, and HTTP APIs. [S3]
- Architecture: YAML/JSON workflow definitions support ordered steps, conditions, loops, parallel steps, subworkflows, connectors, and runtime arguments. [S3]
- Advantages: Official capabilities include state holding, retries, polling/callback waiting for up to one year, and automatic execution logs. [S3]
- Limitations: Callback behavior constraints and timeout handling are explicitly documented (single accepted callback before await in certain sequences, timeout errors). [S5]
- Enterprise usage: Official use cases include business-process automation with approvals, service orchestration, and IT process automation. [S3]
- Scalability: Product docs state independent executions and high concurrent execution support; execution backlogging/queueing controls are documented. [S3][S6]
- Operational considerations: Built-in retry policies, custom retry predicates, callback authorization, audit logs, and execution status filtering are documented. [S4][S5][S6]
- Suitability for cinematic AI production: UNKNOWN in official retrieved sources.

### 4) Stateful Serverless Code Orchestration (Azure Durable Functions)
- Purpose: Durable Functions is documented for stateful workflows in serverless environments via orchestrator/activity/entity functions. [S7]
- Architecture: Runtime-managed state, checkpoints, retries, and recovery are explicit design properties. [S7]
- Advantages: Official positioning emphasizes reliable long-running workflows and multi-language support. [S7]
- Limitations: UNKNOWN in retrieved source excerpts for explicit throughput/latency/limit tables.
- Enterprise usage: UNKNOWN in retrieved source excerpts for named enterprise deployments.
- Scalability: UNKNOWN in retrieved source excerpts for numeric scaling limits.
- Operational considerations: Backend/storage-provider selection and orchestration monitoring are explicitly required setup steps. [S7]
- Suitability for cinematic AI production: UNKNOWN in official retrieved sources.

### 5) Kubernetes-Native Workflow Engine (Argo Workflows)
- Purpose: Argo Workflows is documented as a container-native workflow engine for orchestrating parallel jobs on Kubernetes CRDs. [S8]
- Architecture: Supports step sequences and DAG dependency modeling, with workflow templates, artifact passing, and REST/GRPC interfaces. [S8]
- Advantages: Feature set includes retries, timeouts, suspend/resume, parallelism limits, artifact support, and Prometheus metrics. [S8]
- Limitations: UNKNOWN in retrieved source excerpts for explicit hard platform limits by cluster size.
- Enterprise usage: Docs cite broad adoption and a public users list reference for organizations using Argo Workflows. [S8]
- Scalability: Official positioning includes scalable batch/ML patterns and parallel job orchestration on Kubernetes. [S8]
- Operational considerations: Step/workflow retry controls, scheduling controls, archiving, metrics, and UI/log management are explicit. [S8]
- Suitability for cinematic AI production: UNKNOWN in official retrieved sources.

### 6) DAG-Centric Orchestration (Apache Airflow)
- Purpose: Airflow is documented as a platform to build and run DAG-based workflows composed of dependent tasks. [S9]
- Architecture: Core components include scheduler, DAG processor, metadata DB, webserver, and optional workers/triggerer for distributed deployments. [S9]
- Advantages: Official docs describe distributed deployment, role separation, extensibility, and control-flow constructs (branching/trigger rules/pools). [S9]
- Limitations: Docs note deployment/version-synchronization caveats between scheduler/workers and complexity in secure distributed setups. [S9]
- Enterprise usage: Official docs define distinct operational roles (deployment manager, DAG author, operations user) in larger deployments. [S9]
- Scalability: Airflow is documented as scalable and runnable in distributed environments with multiple component instances. [S9]
- Operational considerations: Dependency management, task concurrency controls, UI-based monitoring, and worker/executor separation are explicit. [S9]
- Suitability for cinematic AI production: UNKNOWN in official retrieved sources.

### 7) Dynamic Pythonic Flow Orchestration (Prefect)
- Purpose: Prefect is documented as an open-source orchestration engine for production workflows in Python. [S10]
- Architecture: Core capabilities include state tracking/recovery, dynamic runtime task branching, event-driven triggers, and deployments to varied infrastructure. [S10]
- Advantages: Official docs describe pause-for-human-intervention, API/schedule/event triggering, and resume from last successful point. [S10]
- Limitations: UNKNOWN in retrieved source excerpts for explicit hard limits/quotas.
- Enterprise usage: UNKNOWN in retrieved source excerpts for named enterprise user disclosures.
- Scalability: Docs state local-to-container/Kubernetes/cloud portability and infrastructure-defined-by-code operation. [S10]
- Operational considerations: Real-time monitoring/logging/UI and CI/CD integration are documented. [S10]
- Suitability for cinematic AI production: UNKNOWN in official retrieved sources.

### 8) Asset-Oriented Orchestration (Dagster)
- Purpose: Dagster is documented as a data orchestrator with lineage, observability, and testability; assets are persistent objects (tables/files/models). [S11][S12]
- Architecture: Asset definitions encode how assets are produced/updated and include explicit dependency knowledge. [S12]
- Advantages: Declarative asset model with materialization/observation workflows and integrated lineage is explicitly documented. [S11][S12]
- Limitations: UNKNOWN in retrieved source excerpts for explicit orchestration limits and throughput ceilings.
- Enterprise usage: UNKNOWN in retrieved source excerpts for named enterprise deployment evidence.
- Scalability: UNKNOWN in retrieved source excerpts for numeric scaling targets.
- Operational considerations: UI/API asset materialization and observation behaviors are documented. [S12]
- Suitability for cinematic AI production: UNKNOWN in official retrieved sources.

### 9) Event Bus and Streaming Coordination (Google Cloud Pub/Sub)
- Purpose: Pub/Sub is documented as asynchronous, scalable messaging for decoupling producers and consumers and enabling event-driven architectures. [S13]
- Architecture: Publisher/subscriber model with asynchronous broadcast delivery; integration with workflows, data pipelines, and orchestration systems is documented. [S13]
- Advantages: Official use cases include enterprise event bus, parallel task processing, and data/analytics streaming pipelines. [S13]
- Limitations: Product guidance states service-to-service intent (not primary service-to-client messaging). [S13]
- Enterprise usage: Official docs explicitly include enterprise event bus and cross-application distribution patterns. [S13]
- Scalability: Docs position Pub/Sub as horizontally scalable and suited for high-concurrency event ingestion/distribution. [S13]
- Operational considerations: Monitoring/logging, IAM controls, subscription/publishing best practices, and replay/seek options are documented. [S13]
- Suitability for cinematic AI production: UNKNOWN in official retrieved sources.

### 10) Managed Task Queue Orchestration (Google Cloud Tasks)
- Purpose: Cloud Tasks is documented for asynchronous offloading of background work outside user request flows. [S14]
- Architecture: Queue-worker model with durable task storage, configurable dispatch rates, retries, schedule times, and deduplication. [S14]
- Advantages: Official docs highlight user-latency reduction, spike smoothing, durable persistence, and retry management. [S14]
- Limitations: Explicitly documented as unsuitable for interactive workflows where users wait for immediate results; delivery timing is not strongly guaranteed. [S14]
- Enterprise usage: Documented use cases include production incident buffering and third-party API rate management. [S14]
- Scalability: Queue rate controls and asynchronous worker dispatch are explicit scaling mechanisms. [S14]
- Operational considerations: At-least-once delivery, idempotent handlers, timeout/retry behavior, and observability tooling are explicit. [S14]
- Suitability for cinematic AI production: UNKNOWN in official retrieved sources.

### 11) Progressive Delivery Orchestration (Argo Rollouts)
- Purpose: Argo Rollouts is documented as a Kubernetes progressive delivery controller supporting blue-green/canary/experimentation patterns. [S15]
- Architecture: Controller + CRDs manage ReplicaSet transitions, traffic shaping through ingress/service meshes, and metric-driven promotion/rollback. [S15]
- Advantages: Fine-grained weighted traffic shifting, automated rollback/promotion, KPI analysis integration, and manual judgement checkpoints are documented. [S15]
- Limitations: Documentation positions native Kubernetes rolling updates as limited; Rollouts addresses these gaps but adds controller/strategy complexity. [S15]
- Enterprise usage: Docs discuss high-volume production risk control and blast-radius management use cases. [S15]
- Scalability: Supports gradual traffic progression patterns and integration with external metric providers for rollout decisions. [S15]
- Operational considerations: Analysis steps, rollback windows, controller metrics, and progressive promotion controls are documented. [S15]
- Suitability for cinematic AI production: UNKNOWN in official retrieved sources.

## Research Area Coverage Snapshot
- 1 End-to-end AI production pipelines: Explicit workflow/state-machine orchestration across Step Functions, Workflows, Temporal, Airflow, Argo. [S2][S3][S1][S9][S8]
- 2 Multi-model orchestration: Explicit LLM invocation within orchestrated activities in Temporal and broad service/API orchestration in Step Functions/Workflows. [S1][S2][S3]
- 3 Prompt chaining: UNKNOWN as explicit prompt-chaining terminology/workflows are not directly documented in retrieved source set.
- 4 Workflow engines: Explicit across Temporal, Argo Workflows, Airflow, Prefect, Durable Functions, Workflows. [S1][S8][S9][S10][S7][S3]
- 5 Event-driven orchestration: Explicit in Step Functions event-driven states, Workflows triggers/callbacks, Pub/Sub patterns. [S2][S3][S5][S13]
- 6 Long-running AI jobs: Explicit in Step Functions Standard (up to one year), Workflows (wait up to one year), Durable/Temporal long-running reliability. [S2][S3][S7][S1]
- 7 Human approval checkpoints: Explicit in Step Functions callback pattern, Workflows callback/approval examples, Rollouts manual judgement. [S2][S5][S15]
- 8 Asset lifecycle management: Explicit in Dagster asset definition/materialization/update model. [S12]
- 9 AI memory during long workflows: Explicit state/event-history persistence in Temporal and runtime-managed state/checkpoints in Durable Functions/Workflows. [S1][S7][S3]
- 10 Failure recovery: Explicit retry/catch/recovery semantics in Step Functions, Workflows, Durable Functions, Cloud Tasks. [S2][S4][S7][S14]
- 11 Retry strategies: Explicit retry configuration/policies in Step Functions, Workflows, Argo, Cloud Tasks. [S2][S4][S8][S14]
- 12 Parallel execution: Explicit parallel states/steps in Step Functions, Workflows, Argo DAG/steps. [S2][S3][S8]
- 13 Dependency management: Explicit DAG/task dependency constructs in Airflow and Argo; asset dependencies in Dagster. [S9][S8][S12]
- 14 Checkpointing: Explicit in Durable Functions runtime and Temporal event-history replay model. [S7][S1]
- 15 Progressive delivery: Explicit in Argo Rollouts blue-green/canary/progressive delivery controller. [S15]
- 16 Background processing: Explicit in Cloud Tasks asynchronous worker model and queue dispatch. [S14]
- 17 Queue coordination: Explicit in Cloud Tasks queues and Pub/Sub asynchronous pub-sub coordination. [S14][S13]
- 18 Streaming user experience: Explicit low-latency asynchronous messaging references in Pub/Sub and execution-streaming/monitoring UX in workflow consoles; cinematic-specific streaming UX is UNKNOWN. [S13][S2][S3]
- 19 AI pipeline observability: Explicit workflow logs/history/audit/metrics across Workflows, Step Functions, Argo, Cloud Tasks, Dagster. [S3][S2][S8][S14][S11]
- 20 Production orchestration patterns: Explicit patterns include state machines, DAG workflows, callbacks, retries, queue-backed background work, and progressive delivery. [S2][S9][S5][S14][S15]

## Assumptions Register
- No assumptions were used for factual claims.
- Any item without explicit official evidence in the retrieved source set is marked UNKNOWN.