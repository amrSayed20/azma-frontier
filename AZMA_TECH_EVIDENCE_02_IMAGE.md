# AZMA Technology Evidence Collection 02

## Domain
Image Generation Ecosystem

## Scope Statement
Evidence-only collection under approved constitutions and the evidence program. No recommendations, no rankings, no benchmark conclusions, and no architecture decisions.

## Source Set (retrieved 2026-06-27)
- OpenAI GPT Image 2 model page: https://developers.openai.com/api/docs/models/gpt-image-2
- OpenAI image generation guide: https://developers.openai.com/api/docs/guides/image-generation
- OpenAI enterprise privacy: https://openai.com/enterprise-privacy/
- OpenAI trust portal: https://trust.openai.com/
- Google Gemini image generation (Nano Banana): https://ai.google.dev/gemini-api/docs/image-generation
- Google Vertex image overview: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/image/overview
- Stability API getting started: https://platform.stability.ai/docs/getting-started
- Stability Stable Image overview: https://platform.stability.ai/docs/getting-started/stable-image
- Adobe Firefly API docs: https://developer.adobe.com/firefly-services/docs/firefly-api/
- BFL docs home: https://docs.bfl.ai/
- BFL licensing: https://bfl.ai/licensing
- Midjourney docs home: https://docs.midjourney.com/
- Midjourney terms: https://docs.midjourney.com/hc/en-us/articles/32083055291277-Terms-of-Service
- Midjourney versioning: https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version
- Midjourney website: https://www.midjourney.com/
- HF Stability org: https://huggingface.co/stabilityai
- HF Black Forest Labs org: https://huggingface.co/black-forest-labs

## Family Evidence

### 1) OpenAI GPT Image family
- Model architecture: Unknown in retrieved docs.
- Licensing: Governed by OpenAI policies/terms (API docs and policy links).
- Image generation: Explicitly supported (Image API and Responses API).
- Image editing: Explicitly supported (edits endpoint and multi-turn edits).
- Inpainting/outpainting: Mask-based inpainting explicitly documented; outpainting not explicitly named in retrieved pages.
- Control mechanisms: Size, quality, format, compression, moderation mode, mask input.
- Character consistency: Docs state consistency is possible but may occasionally struggle.
- Fine-tuning: Not supported for gpt-image-2.
- Self-hosting: Not documented in retrieved sources.
- API availability: Yes, with model/endpoints and rate limits documented.
- Enterprise readiness: Enterprise privacy controls (SAML SSO, retention controls) and trust/compliance pages.
- Community maturity: Official docs, forum links, and changelog/deprecation processes present.
- Documentation quality: High, with detailed guide and parameter constraints.
- Release cadence: Snapshot/version entries and deprecation/changelog links present.
- Maintenance activity: Active docs and model snapshots shown.
- Security considerations: Moderation pipeline, blocked-request handling, SOC2/ISO references.
- Operational considerations: Token/cost model, latency notes, rate limits, error handling.

### 2) Google Gemini/Nano Banana and Imagen family
- Model architecture: Gemini image models described as thinking models; deeper architecture details unknown.
- Licensing: Google terms/site policies linked; per-model weight licensing not explicit in retrieved pages.
- Image generation: Explicitly supported.
- Image editing: Explicitly supported, including conversational multi-turn edits.
- Inpainting/outpainting: Inpainting (semantic masking) explicitly documented in prompting section; outpainting not explicitly named in retrieved pages.
- Control mechanisms: Aspect ratio, image size up to 4K, grounding with Google Search, multiple reference images.
- Character consistency: Explicitly documented with reference-image workflows.
- Fine-tuning: Not explicitly documented for image models in retrieved pages.
- Self-hosting: Not documented in retrieved pages.
- API availability: Yes (Gemini API; Vertex AI docs).
- Enterprise readiness: Vertex/Google Cloud onboarding, billing, auth, and project controls documented.
- Community maturity: Official forum/cookbook and broad docs ecosystem present.
- Documentation quality: High, with detailed examples/limitations/configurations.
- Release cadence: Version labels, deprecation notices, and migration guidance present.
- Maintenance activity: Recently updated documentation timestamps shown.
- Security considerations: Prohibited use policy and SynthID watermark references.
- Operational considerations: Batch support, resolution options, language/feature limitations.

### 3) Stability AI Stable Image family
- Model architecture: Stable Diffusion foundation and ControlNet-style control workflows referenced.
- Licensing: Terms of service and privacy links provided; per-model license detail in retrieved pages is limited.
- Image generation: Explicitly supported (Generate category).
- Image editing: Explicitly supported (Edit category).
- Inpainting/outpainting: Inpainting with masks explicitly stated; outpainting not explicitly named in retrieved pages.
- Control mechanisms: Dedicated Control category using maps/guides and control technologies.
- Character consistency: Unknown in retrieved pages.
- Fine-tuning: Unknown in retrieved pages.
- Self-hosting: Enterprise plans explicitly include on-prem/self-hosted options.
- API availability: Yes (REST v2beta reference).
- Enterprise readiness: Enterprise plans, SLA references, support and status pages.
- Community maturity: Official Discord and HF organization with active model activity.
- Documentation quality: Moderate to high; category-level docs and API refs provided.
- Release cadence: Release notes page and migration from legacy API paths.
- Maintenance activity: Platform and HF recent activity evidence present.
- Security considerations: Safety safeguards and acceptable-use enforcement statements.
- Operational considerations: Credit pricing model, API keys, status page, legacy migration.

### 4) Adobe Firefly family
- Model architecture: Public docs describe model generations/features (Image Model 5), not full internals.
- Licensing: Adobe legal/terms and compliance pages linked.
- Image generation: Explicitly supported.
- Image editing: Explicitly supported, including instruct editing and composite operations.
- Inpainting/outpainting: Not explicitly labeled in retrieved page text; compositing and editing features are documented.
- Control mechanisms: Custom models, style presets, image-size controls, harmonization controls.
- Character consistency: Explicitly supported via custom subject/style model training.
- Fine-tuning: Custom Models API supports training subject/style models.
- Self-hosting: Unknown in retrieved pages.
- API availability: Yes (guides and API reference).
- Enterprise readiness: Adobe enterprise support/compliance surfaces present.
- Community maturity: Adobe developer ecosystem and support channels present.
- Documentation quality: High-level docs with guides and references.
- Release cadence: Last updated metadata present.
- Maintenance activity: Ongoing documentation updates present.
- Security considerations: Compliance and legal references exist; detailed security certifications not extracted in this run.
- Operational considerations: Authentication via Adobe Developer Console, API feature guides.

### 5) Black Forest Labs FLUX family
- Model architecture: FLUX family descriptions include generation/editing focus; deeper internals unknown.
- Licensing: Explicit commercial licensing tiers and legal terms, including self-hosted terms.
- Image generation: Explicitly supported.
- Image editing: Explicitly supported, including outpainting and object removal (FLUX tools).
- Inpainting/outpainting: Outpainting explicitly documented; inpainting not explicitly named in retrieved BFL excerpts.
- Control mechanisms: Multi-reference editing and prompt-guided workflows documented.
- Character consistency: Supported through multi-reference workflows; exact guarantees unknown.
- Fine-tuning: Licensing pages explicitly include fine-tuning and LoRA rights for multiple tiers.
- Self-hosting: Explicitly supported via commercial weights licensing.
- API availability: Yes (docs and dashboard/API flows).
- Enterprise readiness: Enterprise licensing tier and trust/security references (ISO 27001, SOC 2 Type II links).
- Community maturity: Official HF org with active collections/models/spaces/activity.
- Documentation quality: Broad docs footprint with quick starts and model pages.
- Release cadence: New model families and updated entries visible.
- Maintenance activity: Recent HF and docs activity visible.
- Security considerations: Usage policy/responsible AI/developer terms linked.
- Operational considerations: Credits/pricing, API key model, dashboard project structure.

### 6) Midjourney family
- Model architecture: Unknown in retrieved sources.
- Licensing: Terms of service and content-rights clauses explicitly documented.
- Image generation: Explicitly supported on web/Discord.
- Image editing: Image Editor documented in terms and version docs; tools include region editing/pan/zoom workflows.
- Inpainting/outpainting: Version docs explicitly reference inpainting/outpainting tools (Pan, Zoom Out, Edit/Vary Region).
- Control mechanisms: Version parameter, style/image references, weights, personalization, remix controls.
- Character consistency: Character Reference and Character Weight features documented for specific versions.
- Fine-tuning: Not documented in retrieved sources.
- Self-hosting: Not documented in retrieved sources.
- API availability: Public API availability not established in retrieved official pages; treated as unknown.
- Enterprise readiness: Explicit enterprise controls/compliance evidence not extracted in this run.
- Community maturity: Large public community channels and long version history documented.
- Documentation quality: Comprehensive user documentation for controls and policies.
- Release cadence: Clear version timeline (V6, V6.1, V7, V8.1).
- Maintenance activity: Current default/version updates documented in 2026.
- Security considerations: Policy restrictions, rate limiting terms, moderation/community rules.
- Operational considerations: GPU-time cost model, plan/rate-limit terms, feature compatibility matrix.

## Assumptions Register
- No assumptions were used for evidence claims.
- Any item not explicitly stated in retrieved source text is marked Unknown.