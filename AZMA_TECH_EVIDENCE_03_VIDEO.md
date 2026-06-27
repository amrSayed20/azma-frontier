# AZMA Technology Evidence Collection 03

## Domain
Video Generation Ecosystem

## Scope Statement
Evidence-only collection using primary sources (official documentation, official developer docs, official repositories, official papers/reports, and official release notes).

## Source Index
- S1: OpenAI Video Generation Guide (Sora): https://developers.openai.com/api/docs/guides/video-generation
- S2: OpenAI Deprecations: https://developers.openai.com/api/docs/deprecations
- S3: OpenAI Sora Discontinuation Notice: https://help.openai.com/en/articles/20001152-what-to-know-about-the-sora-discontinuation
- S4: Google Veo 3.1 Gemini API Docs: https://ai.google.dev/gemini-api/docs/video
- S5: Runway API Docs Home: https://docs.dev.runwayml.com/
- S6: Runway Models Guide: https://docs.dev.runwayml.com/guides/models
- S7: Luma Video Generation Docs: https://docs.lumalabs.ai/docs/video-generation
- S8: Luma Changelog: https://docs.lumalabs.ai/changelog
- S9: Pika API Page: https://pika.art/api
- S10: CogVideo Official Repo: https://github.com/zai-org/CogVideo
- S11: Wan2.1 Official Repo: https://github.com/Wan-Video/Wan2.1
- S12: Wan Technical Report (officially linked from repo): https://arxiv.org/abs/2503.20314

## Family Evidence

### 1) OpenAI Sora 2 (API)
- Model architecture: Described as multimodal diffusion; full architecture details not specified in API guide. [S1]
- Generation modality: Text-to-video and image-guided generation are explicit; video extension and editing are explicit. [S1]
- Maximum supported duration: 20s per generation; up to 6 extensions for 120s total. [S1]
- Resolution capabilities: `sora-2-pro` supports 1080p outputs (`1920x1080`, `1080x1920`). [S1]
- Temporal consistency: Extension feature explicitly preserves scene/motion continuity. [S1]
- Camera control: Prompt-level camera description is supported (shot, camera, motion in prompting guidance). [S1]
- Character consistency: Reusable character assets are supported (non-human default). [S1]
- Editing capabilities: `/v1/videos/edits` endpoint is explicit. [S1]
- Fine-tuning capability: UNKNOWN in retrieved official sources. [S1][S2]
- Self-hosting support: UNKNOWN in retrieved official sources. [S1][S2]
- API availability: Videos API exists but is deprecated, shutdown 2026-09-24. [S1][S2]
- Licensing: OpenAI terms/policies are referenced in developer docs. [S1]
- Enterprise readiness: Contact-sales paths and account-manager eligibility gating are documented for restricted workflows. [S1]
- Community maturity: UNKNOWN in retrieved official sources for public community metrics.
- Documentation quality: High (model, lifecycle, endpoints, constraints, error/guardrail guidance). [S1]
- Release cadence: Official deprecation timeline published (announced 2026-03-24, shutdown 2026-09-24). [S2]
- Maintenance activity: Sora web/app discontinued 2026-04-26; API discontinuation documented. [S3]
- Security considerations: Under-18-only outputs, copyrighted character/music rejection, real-person restrictions, human-face image input restrictions. [S1]
- Operational considerations: Async jobs, webhook events, download TTL (1h), batch constraints, render-latency considerations. [S1]

### 2) Google Veo 3.1 (Gemini API)
- Model architecture: UNKNOWN (architecture internals not specified on page).
- Generation modality: Text-to-video, image-to-video, and video extension are explicit. [S4]
- Maximum supported duration: 4/6/8s generation options (model-dependent); extension up to 20 times, up to 148s combined output. [S4]
- Resolution capabilities: 720p/1080p/4k (variant-dependent; extension limited to 720p). [S4]
- Temporal consistency: Extension uses previous video context; first/last-frame interpolation is explicit. [S4]
- Camera control: Prompt guide explicitly supports camera motion/composition terms. [S4]
- Character consistency: Up to 3 reference images can preserve subject appearance. [S4]
- Editing capabilities: Video extension and frame-conditioned generation are explicit; generalized V2V edit endpoint is not explicitly documented as a separate API operation. [S4]
- Fine-tuning capability: UNKNOWN in retrieved official sources.
- Self-hosting support: UNKNOWN in retrieved official sources.
- API availability: Available via Gemini API generateContent flow; async operations documented. [S4]
- Licensing: Google terms and policies are linked on doc pages. [S4]
- Enterprise readiness: UNKNOWN in this source set for enterprise contracts/SLA specifics.
- Community maturity: UNKNOWN in this source set for official community metrics.
- Documentation quality: High (parameters, limits, feature matrix, prompt guide, limitations). [S4]
- Release cadence: Variant statuses include Preview and Stable entries. [S4]
- Maintenance activity: Page contains current update metadata (2026-06-22). [S4]
- Security considerations: Safety filters, SynthID watermarking, person-generation regional restrictions, 2-day retention policy. [S4]
- Operational considerations: Latency bounds, retention windows, polling model, per-variant parameter constraints. [S4]

### 3) Runway Video Family (Gen 4.5 / Aleph 2 / Seedance / Veo on Runway)
- Model architecture: UNKNOWN in retrieved official docs.
- Generation modality: API exposes text-to-video, image-to-video, video-to-video endpoints; model table lists input/output modality by model. [S5][S6]
- Maximum supported duration: UNKNOWN in retrieved official docs.
- Resolution capabilities: Quickstart demonstrates ratio/duration parameters; explicit max resolution not captured in retrieved excerpts. [S5]
- Temporal consistency: UNKNOWN in retrieved official docs.
- Camera control: UNKNOWN in retrieved official docs.
- Character consistency: Character control endpoint exists. [S5]
- Editing capabilities: Aleph 2.0 is documented as editing existing videos with text prompts and keyframes; video-to-video endpoint exists. [S5][S6]
- Fine-tuning capability: UNKNOWN in retrieved official docs.
- Self-hosting support: UNKNOWN in retrieved official docs.
- API availability: Official API docs and reference are available. [S5]
- Licensing: UNKNOWN in retrieved source set (specific legal terms not extracted).
- Enterprise readiness: Enterprise tiers/benefits and higher usage exceptions are documented. [S5]
- Community maturity: Official Runway skills GitHub is linked in docs. [S5]
- Documentation quality: Moderate to high (model catalog + API surface). [S5][S6]
- Release cadence: Deprecation/sunset note for Gen-4 Aleph -> Aleph 2.0 migration is documented. [S6]
- Maintenance activity: Active docs with current model list and deprecations. [S6]
- Security considerations: UNKNOWN in retrieved source set.
- Operational considerations: Task-based async workflow and usage/tiers links are present. [S5]

### 4) Luma Ray 2 Family (Dream Machine API)
- Model architecture: UNKNOWN in retrieved official docs.
- Generation modality: Text-to-video and image-to-video are explicit; extend/reverse-extend/interpolate workflows are explicit. [S7]
- Maximum supported duration: Example values include 5s; full maximum not explicitly stated in retrieved excerpts. [S7]
- Resolution capabilities: Docs state resolution options including 540p, 720p, 1080, 4k. [S7]
- Temporal consistency: Extension/interpolation features are explicit for previously generated videos. [S7]
- Camera control: Camera motions endpoint exists; camera control is language-driven with listed motions endpoint. [S7]
- Character consistency: UNKNOWN in retrieved official docs.
- Editing capabilities: Modify/extend/interpolate APIs are documented. [S7]
- Fine-tuning capability: UNKNOWN in retrieved official docs.
- Self-hosting support: UNKNOWN in retrieved official docs.
- API availability: Official authenticated API endpoints are documented. [S7]
- Licensing: UNKNOWN in retrieved source set (specific legal terms not extracted).
- Enterprise readiness: UNKNOWN in retrieved source set.
- Community maturity: UNKNOWN in retrieved source set for official public metrics.
- Documentation quality: Moderate to high (endpoint examples + callback semantics + ancillary docs). [S7]
- Release cadence: Official changelog exists with versioned entries. [S8]
- Maintenance activity: Changelog and recently updated pages are present. [S7][S8]
- Security considerations: UNKNOWN in retrieved source set.
- Operational considerations: Callback retry semantics, auth model, generation state lifecycle documented. [S7]

### 5) Wan2.1 (Open Video Foundation Models)
- Model architecture: Official repo describes Flow Matching DiT design + Wan-VAE components; technical report is linked. [S11][S12]
- Generation modality: Repo explicitly supports T2V, I2V, First-Last-Frame-to-Video, and VACE editing workflows. [S11]
- Maximum supported duration: Repo states a 5-second 480p generation example for T2V-1.3B; global max duration is not explicitly provided in retrieved excerpts. [S11]
- Resolution capabilities: Official model table includes 480p/720p support; VAE claims 1080p encode/decode capability. [S11]
- Temporal consistency: UNKNOWN as a quantified official metric in retrieved excerpts.
- Camera control: Community and examples mention camera/motion control workflows; first-party endpoint-level camera control semantics are not explicitly standardized in retrieved excerpts. [S11]
- Character consistency: UNKNOWN in retrieved official core docs.
- Editing capabilities: VACE supports video creation/editing with optional video/mask/image conditions. [S11]
- Fine-tuning capability: Repo includes fine-tuning code paths and LoRA-related ecosystem links. [S11]
- Self-hosting support: Open-source code/weights workflow is explicit in official repo. [S11]
- API availability: Official repo is model code; hosted API availability is referenced externally via Wan platform links, but API contract details are not specified in retrieved excerpts. [S11]
- Licensing: Apache 2.0 for repo/models per license section in repo. [S11]
- Enterprise readiness: UNKNOWN in retrieved official source set.
- Community maturity: Public GitHub stars/forks/contributors are visible in official repo. [S11]
- Documentation quality: High for open-source usage (install, tasks, model matrix, examples). [S11]
- Release cadence: Latest-news timeline and frequent dated updates are in README. [S11]
- Maintenance activity: Active commits/issues/pull requests and updates are visible. [S11]
- Security considerations: License section includes explicit usage restrictions/compliance responsibilities. [S11]
- Operational considerations: GPU memory/time guidance, multi-GPU inference strategies, and diffusers paths are documented. [S11]

### 6) CogVideoX Family (Open)
- Model architecture: Official repo cites CogVideoX technical report and model design lineage. [S10]
- Generation modality: Official repo states support for text-to-video, image-to-video, and video continuation; colab links include V2V demo. [S10]
- Maximum supported duration: Model table states 5s/10s (model-dependent). [S10]
- Resolution capabilities: Official model table includes 1360x768 and 720x480 entries (model-dependent). [S10]
- Temporal consistency: UNKNOWN as a quantified official metric in retrieved excerpts.
- Camera control: UNKNOWN in retrieved official docs.
- Character consistency: UNKNOWN in core official docs (community links mention identity-preserving derivatives).
- Editing capabilities: Video continuation support is explicit; generalized editing support in official core table is limited. [S10]
- Fine-tuning capability: Fine-tuning directories and LoRA update notes are explicit. [S10]
- Self-hosting support: Open-source repository includes inference/fine-tuning instructions. [S10]
- API availability: Official repo references external commercial API platform for larger-scale models; endpoint specs not provided in retrieved excerpts. [S10]
- Licensing: Code under Apache 2.0; model licenses vary by model size/family. [S10]
- Enterprise readiness: UNKNOWN in retrieved official source set.
- Community maturity: Public GitHub stars/forks/contributors and release metadata are visible. [S10]
- Documentation quality: High for open-source setup and model matrices. [S10]
- Release cadence: Dated project updates and release tags are present. [S10]
- Maintenance activity: Active repo updates and open issue/PR activity are visible. [S10]
- Security considerations: UNKNOWN in retrieved official source set.
- Operational considerations: Detailed GPU memory/precision/inference-time guidance is documented. [S10]

### 7) Pika API Surface (official public page)
- Model architecture: UNKNOWN.
- Generation modality: UNKNOWN from the official page excerpt.
- Maximum supported duration: UNKNOWN.
- Resolution capabilities: UNKNOWN.
- Temporal consistency: UNKNOWN.
- Camera control: UNKNOWN.
- Character consistency: UNKNOWN.
- Editing capabilities: UNKNOWN.
- Fine-tuning capability: UNKNOWN.
- Self-hosting support: UNKNOWN.
- API availability: Official page states API access via Fal AI integration for Pika video models. [S9]
- Licensing: Terms/acceptable-use/privacy links exist on official page. [S9]
- Enterprise readiness: UNKNOWN.
- Community maturity: Official Discord/social channels are linked. [S9]
- Documentation quality: Low in retrieved source excerpt (high-level landing content only). [S9]
- Release cadence: UNKNOWN.
- Maintenance activity: UNKNOWN.
- Security considerations: Acceptable-use policy link is present. [S9]
- Operational considerations: UNKNOWN.

## Assumptions Register
- No assumptions were used for factual claims.
- Any item without explicit official evidence in the retrieved source set is marked UNKNOWN.