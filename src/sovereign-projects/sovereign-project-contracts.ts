/**
 * AZMA OS — The Sovereign Project, the Storyboard, and the Scene.
 *
 * Constitution Articles 2.2, 7.1–7.4. Phase B3 — the data foundation only.
 *
 * ─── WHY THIS LIVES OUTSIDE EVERY CHAMBER ───────────────────────────────────
 *
 *   A project crosses all five chambers: the Hujjah writes the knowledge into
 *   it, Qiyamah hangs assets off it, Ras Al Amr composes from it, the Khazain
 *   own everything in it, and Makman publishes out of it. Putting it inside any
 *   one chamber would make that chamber the owner of a thing the constitution
 *   gives to none of them.
 *
 *   Article 7.4: the Sovereign Project is «مظلة تنظيمية… وليس حجرة سادسة».
 *   A shared layer, not a chamber — so it sits in src/ beside the Vault rather
 *   than in src/chambers/.
 *
 * ─── WHAT THIS PHASE DOES NOT DO ────────────────────────────────────────────
 *
 *   No timeline behaviour, no UI, no publishing flow, no generation. Article 7.4
 *   of the directive: the foundation must not PREVENT later timeline work, and
 *   it must not pretend to be it.
 */

/**
 * The four project types — Article 7.
 *
 * One vocabulary, one table, one ownership check. Four separate project systems
 * would mean four places for the next rule to be forgotten.
 */
export enum ProjectType {
  /** The umbrella. References the other three. Article 7.4. */
  SOVEREIGN = 'SOVEREIGN',
  /** Research, evidence, ideas, briefs, prompts, storyboards. Article 7.1. */
  KNOWLEDGE = 'KNOWLEDGE',
  /** Grouping and reuse of sovereign assets. Article 7.2. */
  ASSET_COLLECTION = 'ASSET_COLLECTION',
  /** Timeline, scenes, ordering, transitions, exports. Article 7.3. */
  COMPOSITION = 'COMPOSITION',
}

/** Whether a project is still being worked on, finished, or set aside. */
export enum ProjectLifecycle {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export interface SovereignProject {
  readonly projectId: string;
  readonly ownerId: string;
  readonly projectType: ProjectType;
  readonly title: string;
  readonly lifecycleState: ProjectLifecycle;
  /**
   * The Sovereign Project this one belongs to.
   *
   * Null for a SOVEREIGN project — it is the top and belongs to nothing. This
   * is how Article 7.4's umbrella actually holds: the specialised projects
   * point up at it, rather than it holding three nullable foreign keys that
   * would have to be kept in step.
   */
  readonly parentProjectId: string | null;
  readonly createdAt: number;
  readonly updatedAt: number;
}

/**
 * Whether this project type may sit under an umbrella.
 *
 * A SOVEREIGN project under another SOVEREIGN project would be a second
 * umbrella over the first, and Article 7.4 describes exactly one top.
 */
export function mayHaveParent(projectType: ProjectType): boolean {
  return projectType !== ProjectType.SOVEREIGN;
}

// ══ STORYBOARD — Article 2.2 ═══════════════════════════════════════════════

export enum StoryboardLifecycle {
  /** Being written. Scenes may be added, reordered, removed. */
  DRAFT = 'DRAFT',
  /**
   * The Creator has approved it. Article L-3 of the architectural package: a
   * storyboard does not travel to another chamber until its author says so.
   */
  APPROVED = 'APPROVED',
  ARCHIVED = 'ARCHIVED',
}

export interface Storyboard {
  readonly storyboardId: string;
  readonly ownerId: string;
  /** The knowledge that produced it. Article 2.2 — evidence stays connected. */
  readonly knowledgeProjectId: string | null;
  /** The composition it feeds, once one exists. Article 2.2. */
  readonly compositionProjectId: string | null;
  readonly title: string;
  readonly lifecycleState: StoryboardLifecycle;
  readonly createdAt: number;
  readonly updatedAt: number;
}

/**
 * One scene — and the constitutional boundary drawn through its middle.
 *
 * `directionNotes` and the visual the scene asks for are instructions for
 * QIYAMAH: what should exist inside the frame.
 *
 * `order`, `durationSeconds` and `transitionIntent` are instructions for
 * RAS AL AMR: where this sits in time and how it meets what follows.
 *
 * Both live in one row because they describe one scene. The line between them
 * is what Article 4.5 draws, and keeping it visible inside the structure is
 * what stops either chamber from reaching across it.
 */
export interface StoryboardScene {
  readonly sceneId: string;
  readonly storyboardId: string;
  readonly ownerId: string;
  /**
   * The Creator's declared order. An integer they control — not an index into
   * an array. «لا تدّعِ دعم الخط الزمني إذا كان النظام يخزّن قائمة غير مرتبة».
   */
  readonly order: number;
  readonly description: string;
  /** A sovereign asset assigned to this scene, once one exists. */
  readonly visualAssetId: string | null;
  readonly audioAssetId: string | null;
  /** Timing INTENT. The real timeline is Ras Al Amr's, in Phase E. */
  readonly durationSeconds: number | null;
  /** Transition INTENT — how this scene should meet the next. */
  readonly transitionIntent: string | null;
  /** Direction for what belongs inside the frame. Read by Qiyamah. */
  readonly directionNotes: string | null;
  /**
   * The same scene's visual intent, phrased so a stock search can act on it.
   * Machinery: never rendered, never spoken, never returned to the Creator —
   * `description` is the half that is theirs. MEASURED 2026-09-25: with this
   * absent, a production about أصحاب الكهف was illustrated with a
   * crucifix, because the picture was inferred by a stock library instead of
   * decided by the Chamber that wrote the scene.
   */
  readonly visualSearchEn: string | null;
  /**
   * Where this scene's picture comes from. 'stock' when it exists in the world
   * and can be found; 'generate' when it exists nowhere and must be made.
   * Null on scenes written before the distinction existed, and read as stock.
   */
  readonly sourcing: 'stock' | 'generate' | null;
  /** What to create, when sourcing is 'generate'. Null otherwise. */
  readonly creationDemandAr: string | null;
  readonly createdAt: number;
  readonly updatedAt: number;
}

// ══ TOMBSTONE — Articles 6.2, 6.3 ══════════════════════════════════════════

/**
 * Whether the asset was protected from destruction by a published work.
 *
 * Article 6.4: an asset inside a live published work may not be permanently
 * destroyed, and the refusal is explained rather than silent. Recording the
 * state on the tombstone means an audit can tell an ordinary deletion from one
 * that had to be argued with.
 */
export enum PublishedProtection {
  /** Nothing published referenced it. */
  NOT_PROTECTED = 'NOT_PROTECTED',
  /** A published work referenced it; destruction was refused. Article 6.4. */
  PROTECTED_BY_PUBLICATION = 'PROTECTED_BY_PUBLICATION',
}

/**
 * What survives an asset — Article 6.3.
 *
 * NO STORAGE PATH IS RECORDED. Article 7.5 of the directive forbids a tombstone
 * exposing raw storage paths, and the path tells an audit nothing the assetId
 * does not. A column that cannot safely be returned should not be written.
 *
 * The lineage fields are the whole point: when an asset with children is
 * destroyed, those children still point at it. Without this record they become
 * orphans and Article 5.4 breaks at the exact moment Article 6.2 is exercised.
 */
export interface AssetTombstone {
  readonly tombstoneId: string;
  readonly assetId: string;
  readonly ownerId: string;
  readonly assetFamily: string | null;
  readonly capabilityTarget: string | null;
  readonly parentAssetId: string | null;
  readonly rootAssetId: string | null;
  readonly projectId: string | null;
  readonly creationChamber: string | null;
  readonly deletedBy: string;
  readonly deletedAt: number;
  readonly deletionReason: string | null;
  readonly publishedProtection: PublishedProtection;
  /** Enough of the original record for an audit. Never a storage path. */
  readonly metadataSnapshot: Record<string, unknown>;
}

// ══ SOVEREIGN PUBLIC LINK — Articles 9.2, 9.3 ══════════════════════════════

export enum PublicationState {
  PUBLISHED = 'PUBLISHED',
  /** Withdrawn by its owner. Public access must stop. Article 9.3. */
  REVOKED = 'REVOKED',
}

export interface SovereignPublicLink {
  readonly linkId: string;
  /**
   * What appears in the URL. Unguessable by construction — see mintPublicToken.
   *
   * This token is the only thing between a published work and the internet.
   * The security closure shut every public asset path; this is a deliberate,
   * single-work exception, and it is only safe while the token cannot be
   * enumerated.
   */
  readonly publicToken: string;
  readonly ownerId: string;
  /** The FINAL WORK this link publishes. Never a storage path. Article 9.3. */
  readonly finalWorkAssetId: string;
  readonly publicationState: PublicationState;
  readonly createdAt: number;
  readonly revokedAt: number | null;
  readonly revokedBy: string | null;
}

/** Whether a link should serve its work right now. */
export function isLive(link: SovereignPublicLink): boolean {
  return link.publicationState === PublicationState.PUBLISHED && link.revokedAt === null;
}
