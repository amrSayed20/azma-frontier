/**
 * AZMA OS — CONSTITUTIONAL RESTORATION CAMPAIGN
 * RESTORATION PACKAGE II: CONSTITUTIONAL INHERITANCE (TYPOGRAPHY AUTHORITY)
 * ENGINEERING REVIEW
 * (Construction ID SIO-007)
 *
 * Authority: "The Sovereign Identity Layer — Constitutional Dossier,"
 * Chapter II Article II ("The Sovereign Typography System... it does not
 * own language. It owns visual expression of language."), Chapter I
 * Article IV ("no chamber may independently define... its own
 * typography"), Chapter V Article III ("Zero Duplication") and Article
 * XIV Phase III ("reconnect every chamber... without redesign, without
 * introducing parallel systems").
 *
 * READ THIS FIRST: this Package restores Font Authority only — every
 * chamber's own font-family declaration was reconnected to the certified
 * Sovereign Typography System (TYPOGRAPHY.family, tokens.ts). It does
 * NOT touch font-size, font-weight, letter-spacing, or line-height. That
 * scope reduction is deliberate and disclosed below, not a silent gap.
 */

export const SIO7_FRESH_INVENTORY = {
  statement:
    'A full repository audit (all 9 active chamber CSS files, sovereign-high-council\'s live styles component, and app/globals.css) found font-family fragmented across 4 partial variants of the certified stack (system-ui,\'Segoe UI\',sans-serif / system-ui,sans-serif / system-ui,-apple-system,sans-serif / "Segoe UI",sans-serif), 2 chambers using an entirely different, unrelated font family (sovereign-member: Cairo/Tajawal; sovereign-high-council: Inter/Cairo via a Google Fonts @import), and 1 chamber (sovereign-explorer) declaring no font-family at all. Not one chamber used the exact certified string before this Package.',
} as const;

export const SIO7_MECHANISM = {
  statement:
    'A new custom property, --azma-font-family, was added to src/design-system/azma-identity.css\'s :root block, holding the certified TYPOGRAPHY.family string verbatim — no new value was introduced, this only names an already-certified constant so it can be referenced instead of copied. .azma-chamber\'s own font-family declaration in the same file was updated to consume var(--azma-font-family) instead of repeating the literal (removing duplication inside the Sovereign Identity Layer\'s own module). Because azma-identity.css is already loaded globally (app/layout.tsx) before any chamber CSS, every chamber can already reference var(--azma-font-family) today without needing the .azma-chamber class applied to any element — the same mechanism used in SIO-006.',
} as const;

export const SIO7_FONT_AUTHORITY_RESTORED = [
  { chamber: 'hujjah-al-damighah', before: "system-ui, 'Segoe UI', sans-serif", after: 'var(--azma-font-family)', note: 'partial subset of the certified stack, missing Helvetica Neue/Arial fallbacks' },
  { chamber: 'sovereign-vault-palace', before: "system-ui, 'Segoe UI', sans-serif", after: 'var(--azma-font-family)', note: 'same partial subset' },
  { chamber: 'sovereign-vault', before: 'system-ui, sans-serif', after: 'var(--azma-font-family)', note: 'further truncated subset' },
  { chamber: 'makman-al-ghayah', before: 'system-ui, sans-serif', after: 'var(--azma-font-family)', note: 'same truncated subset' },
  { chamber: 'qiyamah-chamber', before: 'system-ui, sans-serif', after: 'var(--azma-font-family)', note: 'same truncated subset' },
  { chamber: 'ras-amr', before: 'system-ui, -apple-system, sans-serif', after: 'var(--azma-font-family)', note: 'a distinct variant adding -apple-system while dropping the certified fallbacks' },
  { chamber: 'sovereign-gate', before: '"Segoe UI",sans-serif', after: 'var(--azma-font-family)', note: 'dropped system-ui entirely; different quoting style' },
  { chamber: 'sovereign-explorer', before: 'none declared — fell back to whichever ambient font happened to be active', after: 'var(--azma-font-family)', note: 'filling a genuine gap, not overriding an intentional choice' },
] as const;

export const SIO7_VISUAL_CHANGE_DISCLOSURE = {
  statement:
    'All 8 repoints above are functionally near-identical in virtually every real environment — every value involved is a chain of generic system-font fallbacks (system-ui / Segoe UI / Helvetica Neue / Arial / sans-serif), which render as the OS default UI font regardless of which specific subset of that fallback chain is listed. This is disclosed honestly as "functionally equivalent, technically a broadened/normalized fallback chain" rather than claimed as strictly zero-diff, since the literal CSS value did change in each file.',
} as const;

export const SIO7_DELIBERATELY_NOT_TOUCHED = [
  {
    item: 'sovereign-member.css font-family ("Cairo","Tajawal",sans-serif)',
    reason:
      'Cairo/Tajawal are Arabic-optimized web fonts, and this chamber (like every chamber) renders with direction: rtl. Replacing them with the certified system-ui stack could be either (a) restoring Font Authority as the Dossier requires, or (b) removing a functional Arabic-readability choice that a generic system-font fallback does not replace equivalently across every OS. This is a genuine constitutional ambiguity, not an engineering judgment call — flagged for Constitutional Review rather than resolved unilaterally, per this Package\'s own explicit instruction ("do not resolve constitutional uncertainty through engineering assumptions").',
  },
  {
    item: "sovereign-high-council's Inter/Cairo Google Fonts import and font-family rules (page.tsx / SovereignHighCouncilStyles.tsx)",
    reason: 'Same ambiguity as sovereign-member (Cairo is shared between them), plus this chamber additionally sources Inter from an external Google Fonts @import — a second, independently-sourced font system with its own drift question (external network dependency vs. system fallback) beyond font-family choice alone. Flagged, not touched.',
  },
  {
    item: 'font-size, font-weight, letter-spacing, and line-height across all 9 chambers',
    reason:
      'The audit found hundreds of individual numeric literals across these 4 properties (particularly in hujjah-al-damighah\'s 4,764-line file and sovereign-vault-palace\'s 1,895-line file). Many coincidentally match a TYPOGRAPHY.scale/tracking/leading value (e.g. many "14px" and "24px" occurrences), but the same numeric values are also used elsewhere in these files for unrelated purposes (padding, gaps, border widths) that happen to share the same number. A mechanical find-and-replace keyed only on numeric value would risk repointing non-typography literals into typography tokens — exactly the kind of engineering assumption this Package\'s Constitutional Boundaries section forbids resolving unilaterally. Restoring these four properties correctly requires per-occurrence semantic review (confirming each literal is actually sizing/spacing/weighting TEXT, not some other property that happens to share a number), which is a larger, slower, chamber-by-chamber effort than this Package\'s scope. Identified as real, unresolved constitutional drift; not silently left for later without disclosure.',
  },
] as const;

export const SIO7_REPOSITORY_EVIDENCE = {
  statement:
    'Every chamber\'s prior font-family string was read and quoted exactly before being classified. TYPOGRAPHY.family and its --azma-font-family exposure were confirmed to not previously exist as a named custom property in azma-identity.css before this Package added one. The Google Fonts @import string and both font-family rules in sovereign-high-council were read verbatim from SovereignHighCouncilStyles.tsx and page.tsx before being excluded. No chamber page.tsx or _components file declares inline typography styles — all typography lives in the .css files, confirmed via a full-repository check before scoping this Package to CSS files only.',
} as const;

export const SIO7_RUNTIME_RELATIONSHIPS = [
  { system: 'Sovereign Identity Layer / azma-identity.css', relationship: 'Gained one new named constant (--azma-font-family); no existing rule\'s rendered value changed.' },
  { system: 'Sovereign Identity Orchestrator (src/sovereign-identity/)', relationship: 'Unmodified. Typography is a static, chamber-invariant constant (TYPOGRAPHY.family) already exposed via SovereignConstitutionalConstants.typography since SIO-004 — this Package did not need to touch the orchestrator.' },
  { system: '8 chamber CSS files', relationship: 'Each now consumes var(--azma-font-family) for its own root viewport element\'s font-family instead of an independently copied/approximated literal.' },
  { system: 'sovereign-member, sovereign-high-council', relationship: 'Unchanged — flagged for Constitutional Review, not reconnected in this Package.' },
] as const;

export const SIO7_RISKS_DISCOVERED = [
  {
    risk: 'Repointing font-family in 8 files simultaneously is, cumulatively, a customer-visible change across most of the platform, even though each individual diff is a near-equivalent fallback-chain normalization.',
    disposition: 'Accepted as functionally negligible (all values involved are generic system-font fallback chains, not distinct typefaces) and verified via full production build; a real browser check remains the only way to fully confirm zero perceptible difference.',
  },
  {
    risk: 'The Arabic-font question (Cairo/Tajawal vs. system-ui) could resurface identically in a future Typography Restoration Package unless explicitly ruled on.',
    disposition: 'Disclosed above, not silently deferred — awaiting Constitutional Review on whether Arabic-optimized fonts constitute legitimate functional necessity or forbidden chamber-owned typography.',
  },
] as const;

export const SIO7_LAUNCH_CLASSIFICATION = {
  classification: 'Constitutional Launch Asset (same standing ruling applied to SIO-005B and SIO-006 — restores identity, does not remove an operational Launch blocker).',
  reasoning: 'Evaluated independently of Critical/Important/Polish. Does not touch either open Critical blocker (payment integration, Creator-authorization capture).',
} as const;

export const SIO7_SUCCESS_CRITERION = {
  question: 'Does every chamber now inherit its font-family from the Sovereign Typography Authority rather than remaining its own origin?',
  answer:
    '7 of 9 chambers plus sovereign-explorer\'s previously-undeclared gap: yes. sovereign-member and sovereign-high-council remain on their own independently-chosen Arabic-optimized font stacks, disclosed as an open constitutional question rather than silently resolved. Font-size, weight, tracking, and leading remain chamber-local across all 9 chambers — identified, not restored, in this Package.',
} as const;

export const SIO7_LAUNCH_IMPACT = {
  statement:
    'Functionally negligible change to the current Creator experience — every repointed value is a generic system-font fallback chain, not a distinct typeface. The real impact is architectural: 8 chambers now have a single point of font-family truth instead of 4 independently-drifting variants.',
} as const;

export const SIO7_DEFERRAL_COST = {
  statement:
    'None to the current Launch. Deferring the remaining Typography Restoration work (font-size/weight/tracking/leading reconnection, the sovereign-member/sovereign-high-council Arabic-font ruling) costs completeness of constitutional unity, not Launch viability.',
} as const;

export const SIO7_VALIDATION_RESULTS = {
  typescript: 'PASS',
  eslint: 'PASS',
  build: 'PASS',
} as const;

export const SIO7_ENGINEERING_REVIEW_DECLARATION = {
  filesModified: [
    'src/design-system/azma-identity.css',
    'app/hujjah-al-damighah/hujjah-al-damighah.css',
    'app/sovereign-vault-palace/sovereign-vault.css',
    'app/sovereign-vault/sovereign-vault.css',
    'app/makman-al-ghayah/makman-al-ghayah.css',
    'app/qiyamah-chamber/qiyamah-chamber.css',
    'app/ras-amr/ras-amr.css',
    'app/sovereign-gate/gate.css',
    'app/sovereign-explorer/sovereign-explorer.css',
  ],
  chamberComponentsModified: false,
  chamberStructureModified: false,
  fontSizeWeightTrackingLeadingTouched: false,
  sovereignMemberOrHighCouncilTouched: false,
  status: 'RESTORATION PACKAGE II: CONSTITUTIONAL INHERITANCE (TYPOGRAPHY AUTHORITY) (SIO-007), ENGINEERING REVIEW, complete. All validations pass.',
} as const;
