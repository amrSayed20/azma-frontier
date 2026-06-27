# AZMA Technology Evidence Collection 03 Report

## Executive Summary

Technology Evidence Collection 03 for the Video Generation Ecosystem is complete as an evidence-only constitutional activity using primary sources.

Created:
- AZMA_TECH_EVIDENCE_03_VIDEO.md
- AZMA_TECH_EVIDENCE_03_REPORT.md

Evidence was collected from official developer documentation, official release/deprecation notices, and official repositories/reports for major families: OpenAI Sora 2 API, Google Veo 3.1 API, Runway video models, Luma Ray 2 API, Wan2.1, CogVideoX, and the currently exposed Pika API surface.

Primary-source findings (facts only):
- Modalities: Text-to-video and image-to-video are broadly documented across major families; explicit video-to-video/editing support is documented for several families (for example Runway endpoint taxonomy, OpenAI edits/extensions, Luma extend/interpolate, Wan VACE workflows, and CogVideo continuation references).
- Duration/resolution: Explicit constraints are available for some families (for example OpenAI Sora generation/extension limits and 1080p references; Google Veo duration tiers, extension ceilings, and 720p/1080p/4k constraints; Luma and open-model family resolution declarations).
- Control/consistency: Official sources document camera/prompt controls and temporal continuity mechanisms in some families (for example Veo prompt camera directives, Sora extension continuity, Luma camera-motion endpoint). Character/identity consistency support is explicit in select families (for example Sora character assets and Veo reference images), while several families remain undocumented in official retrieved sources.
- API and operations: All surveyed major families except the limited Pika public page provide concrete API or repo-operational workflows; async job orchestration and callback/polling patterns are explicitly documented in OpenAI, Google, Luma, and Runway sources.
- Licensing and governance: Licensing clarity varies. Open-source families (Wan2.1/CogVideoX) publish explicit repository/model licenses; platform families link terms/policies but often do not expose architecture-level or fine-tuning-level detail in public endpoint docs.
- Security and compliance: Explicit safety/watermark/guardrail details are strongest in OpenAI and Google primary docs. For several families, security/compliance specifics were not explicit in retrieved primary sources and are marked UNKNOWN.

All unknown or non-explicit items are marked UNKNOWN in the evidence file. No ranking, recommendation, benchmarking conclusion, implementation, or architectural decision was produced.

STOP.

Wait for Chief Architect approval before Technology Evidence Collection 04.