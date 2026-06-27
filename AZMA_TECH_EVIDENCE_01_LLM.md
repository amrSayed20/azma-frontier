# AZMA Technology Evidence Collection 01

## Domain
Large Language Models (LLMs)

## Scope Statement
Evidence-only record under approved constitutions and evidence program. No rankings, no adoption decision, no architecture decision.

## Source Set (retrieved 2026-06-27)
- OpenAI Models: https://developers.openai.com/api/docs/models
- OpenAI Enterprise Privacy: https://openai.com/enterprise-privacy/
- OpenAI Trust Portal: https://trust.openai.com/
- Anthropic Models Overview: https://platform.claude.com/docs/en/docs/about-claude/models
- Google Gemini Models: https://ai.google.dev/gemini-api/docs/models
- Mistral Models Overview: https://docs.mistral.ai/getting-started/models/models_overview/
- Meta Llama official site (redirect target): https://www.llama.com/
- Meta Llama HF org: https://huggingface.co/meta-llama
- Mistral HF org: https://huggingface.co/mistralai

## Family Evidence

### 1) OpenAI GPT family
- Architecture: Unknown in retrieved official model page.
- Licensing: API terms/policies exist; model-weight license terms not listed on model page. Unknown for closed API models.
- Context length: GPT-5.5 and GPT-5.4 listed with 1M context; GPT-5.4 mini listed 400K.
- Multimodal: Official page states all latest models support text and image input.
- Self-hosting: No self-hosting path stated in retrieved model docs for GPT API models.
- API availability: Responses API and SDK availability explicitly stated.
- Enterprise readiness: Enterprise privacy commitments, SAML SSO, admin controls documented.
- Community maturity: Official developer docs plus public developer resources present.
- Release cadence: Current and deprecated model tracks are documented; changelog/deprecations pages exist.
- Maintenance activity: Active model catalog and deprecation process documented.
- Documentation quality: Structured model cards and guide links present.
- Security posture: SOC 2/ISO references and trust portal documentation present.
- Operational considerations: Rate limits, deployment checklist, production best practices pages present.

### 2) Anthropic Claude family
- Architecture: Unknown in retrieved model overview.
- Licensing: Commercial API/cloud surface documented; weight license terms not listed in model overview.
- Context length: 1M for Opus/Sonnet/Fable lines shown; Haiku 200k shown.
- Multimodal: Model overview states current Claude models support text and image input.
- Self-hosting: No self-hosting distribution path stated in retrieved model overview.
- API availability: Claude API, AWS, Bedrock, Google Cloud, Microsoft Foundry availability documented.
- Enterprise readiness: Multi-cloud endpoint and regional/global routing notes documented.
- Community maturity: Public docs, migration guides, and support/community links present.
- Release cadence: Dated model IDs, versioning policy, and deprecation schedule documented.
- Maintenance activity: Migration guides and model deprecation notices published.
- Documentation quality: Detailed comparison tables and versioning notes present.
- Security posture: Unknown from Anthropic security page due retrieval failure in this run.
- Operational considerations: Token limits, batch output limits, endpoint-type behavior documented.

### 3) Google Gemini family
- Architecture: Unknown in retrieved model page.
- Licensing: API terms/site policies available; model-weight license terms not explicit on model index page.
- Context length: Prior model entry explicitly references 1M context window (Gemini 2.0 Flash shut down entry).
- Multimodal: Multiple text/image/audio/video model lines documented.
- Self-hosting: No self-hosting path stated in retrieved Gemini API model docs.
- API availability: Gemini API docs, API reference, key management, libraries documented.
- Enterprise readiness: Billing, regions, status, rate limits, and policy pages linked.
- Community maturity: Official community forum and cookbook links present.
- Release cadence: Stable/Preview/Latest/Experimental naming and deprecations policy documented.
- Maintenance activity: Last updated timestamp present; deprecation page linked.
- Documentation quality: Extensive model taxonomy and operational guide links present.
- Security posture: Abuse monitoring and usage policy references are linked; deeper certification evidence not extracted here.
- Operational considerations: Streaming, caching, batch, webhooks, rate limits documented.

### 4) Meta Llama family
- Architecture: HF official org text describes Llama 4 as mixture-of-experts and natively multimodal.
- Licensing: HF org states license/acceptable use acceptance required for model access.
- Context length: Unknown in retrieved source set.
- Multimodal: HF org states Llama 4 supports text and multimodal experiences.
- Self-hosting: Open model distributions are downloadable through model repos subject to license acceptance.
- API availability: Unknown from retrieved official Meta page snapshot; HF provides model repo access, not a single canonical Meta API statement in this run.
- Enterprise readiness: Unknown in retrieved source set.
- Community maturity: HF org shows large followership and active model collections.
- Release cadence: Multiple family generations and updated model entries shown.
- Maintenance activity: Recent updates visible on HF model entries.
- Documentation quality: Family descriptions and collection structure present.
- Security posture: Llama Guard and Prompt Guard families are listed in HF org description.
- Operational considerations: Hardware/serving guidance not extracted in this run.

### 5) Mistral family
- Architecture: Specific architecture details not uniformly listed on overview page.
- Licensing: Model cards label models as OPEN or PREMIER.
- Context length: Mistral Moderation 2 listed with 128k context on overview page.
- Multimodal: Overview includes multimodal, audio, OCR, and coding-specialized families.
- Self-hosting: OPEN model lines and public checkpoints are listed in Mistral docs/HF org.
- API availability: Mistral docs include API links and product surfaces.
- Enterprise readiness: Terms/legal pages and product surfaces are linked.
- Community maturity: HF organization shows active models/spaces/datasets and recent activity.
- Release cadence: Version tags (e.g., v26.04) and legacy/deprecated tables are maintained.
- Maintenance activity: Frequent model/version updates visible in docs and HF org.
- Documentation quality: Central model overview and model-card links present.
- Security posture: Unknown in retrieved source set for formal certifications.
- Operational considerations: Model selection and model card granularity suggest operational guidance exists; full deployment constraints not extracted here.

## Assumptions Register
- No assumptions used for evidence claims.
- Any unverified dimension is marked Unknown.