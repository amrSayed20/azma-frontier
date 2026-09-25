/**
 * AZMA OS — Durable storage for projects, storyboards, scenes, tombstones and
 * sovereign public links. Constitution Articles 2.2, 6.3, 7, 9.3. Phase B3.
 *
 * Follows the conventions already established in this directory: plain
 * functions taking a `DatabaseSync`, snake_case columns mapped at the boundary,
 * and ownership enforced in the statement rather than assumed by the caller.
 *
 * ─── THE RULE EVERY FUNCTION HERE OBEYS ─────────────────────────────────────
 *
 *   Every read that can return another Creator's row takes an ownerId and
 *   filters on it. Not because the callers are careless, but because the
 *   security closure proved that an ownership check which lives only in a
 *   caller is an ownership check that one new caller will forget.
 */

import { randomBytes, randomUUID } from 'crypto';
import type { DatabaseSync } from 'node:sqlite';
import {
  ProjectType,
  ProjectLifecycle,
  StoryboardLifecycle,
  PublishedProtection,
  PublicationState,
  mayHaveParent,
  type SovereignProject,
  type Storyboard,
  type StoryboardScene,
  type AssetTombstone,
  type SovereignPublicLink,
} from '../sovereign-projects/sovereign-project-contracts';

// ══ PROJECTS — Article 7 ═══════════════════════════════════════════════════

function rowToProject(row: Record<string, unknown>): SovereignProject {
  return {
    projectId: row.project_id as string,
    ownerId: row.owner_id as string,
    projectType: row.project_type as ProjectType,
    title: row.title as string,
    lifecycleState: row.lifecycle_state as ProjectLifecycle,
    parentProjectId: (row.parent_project_id as string | null) ?? null,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

const PROJECT_COLUMNS =
  'project_id, owner_id, project_type, title, lifecycle_state, parent_project_id, created_at, updated_at';

export type CreateProjectOutcome =
  | { readonly ok: true; readonly project: SovereignProject }
  | { readonly ok: false; readonly reason: 'INVALID_TYPE' | 'SOVEREIGN_CANNOT_HAVE_PARENT' | 'PARENT_NOT_FOUND' };

/**
 * Create a project of one of the four constitutional types.
 *
 * Refuses rather than corrects. A SOVEREIGN project handed a parent is not
 * quietly detached — it is refused, because a second umbrella over the first is
 * a misunderstanding of Article 7.4 that should surface at the call site.
 *
 * A parent must exist AND belong to the same Creator: a project hanging under
 * someone else's umbrella would cross the tenant boundary through a foreign key.
 */
export function createProject(
  db: DatabaseSync,
  input: {
    ownerId: string;
    projectType: ProjectType;
    title: string;
    parentProjectId?: string | null;
    lifecycleState?: ProjectLifecycle;
    nowMs?: number;
  },
): CreateProjectOutcome {
  if (!Object.values(ProjectType).includes(input.projectType)) {
    return { ok: false, reason: 'INVALID_TYPE' };
  }

  const parentProjectId = input.parentProjectId ?? null;
  if (parentProjectId !== null && !mayHaveParent(input.projectType)) {
    return { ok: false, reason: 'SOVEREIGN_CANNOT_HAVE_PARENT' };
  }
  if (parentProjectId !== null) {
    const parent = getProject(db, parentProjectId, input.ownerId);
    if (!parent) return { ok: false, reason: 'PARENT_NOT_FOUND' };
  }

  const now = input.nowMs ?? Date.now();
  const project: SovereignProject = {
    projectId: `proj_${randomUUID()}`,
    ownerId: input.ownerId,
    projectType: input.projectType,
    title: input.title,
    lifecycleState: input.lifecycleState ?? ProjectLifecycle.ACTIVE,
    parentProjectId,
    createdAt: now,
    updatedAt: now,
  };

  db.prepare(
    `INSERT INTO sovereign_projects (${PROJECT_COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    project.projectId, project.ownerId, project.projectType, project.title,
    project.lifecycleState, project.parentProjectId, project.createdAt, project.updatedAt,
  );

  return { ok: true, project };
}

/** One project, only if this Creator owns it. */
export function getProject(db: DatabaseSync, projectId: string, ownerId: string): SovereignProject | null {
  const row = db
    .prepare(`SELECT ${PROJECT_COLUMNS} FROM sovereign_projects WHERE project_id = ? AND owner_id = ?`)
    .get(projectId, ownerId);
  return row ? rowToProject(row as Record<string, unknown>) : null;
}

/** A Creator's projects, newest first; optionally of one type. */
export function listProjectsForOwner(
  db: DatabaseSync,
  ownerId: string,
  projectType?: ProjectType,
): readonly SovereignProject[] {
  const rows = projectType
    ? db.prepare(`SELECT ${PROJECT_COLUMNS} FROM sovereign_projects WHERE owner_id = ? AND project_type = ? ORDER BY created_at DESC`).all(ownerId, projectType)
    : db.prepare(`SELECT ${PROJECT_COLUMNS} FROM sovereign_projects WHERE owner_id = ? ORDER BY created_at DESC`).all(ownerId);
  return rows.map((r) => rowToProject(r as Record<string, unknown>));
}

/** The specialised projects gathered under one Sovereign Project. Article 7.4. */
export function listProjectsUnderUmbrella(
  db: DatabaseSync,
  parentProjectId: string,
  ownerId: string,
): readonly SovereignProject[] {
  const rows = db
    .prepare(`SELECT ${PROJECT_COLUMNS} FROM sovereign_projects WHERE parent_project_id = ? AND owner_id = ? ORDER BY created_at ASC`)
    .all(parentProjectId, ownerId);
  return rows.map((r) => rowToProject(r as Record<string, unknown>));
}

// ══ STORYBOARD & SCENES — Article 2.2 ══════════════════════════════════════

const STORYBOARD_COLUMNS =
  'storyboard_id, owner_id, knowledge_project_id, composition_project_id, title, lifecycle_state, created_at, updated_at';

function rowToStoryboard(row: Record<string, unknown>): Storyboard {
  return {
    storyboardId: row.storyboard_id as string,
    ownerId: row.owner_id as string,
    knowledgeProjectId: (row.knowledge_project_id as string | null) ?? null,
    compositionProjectId: (row.composition_project_id as string | null) ?? null,
    title: row.title as string,
    lifecycleState: row.lifecycle_state as StoryboardLifecycle,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

export function createStoryboard(
  db: DatabaseSync,
  input: {
    ownerId: string;
    title: string;
    knowledgeProjectId?: string | null;
    compositionProjectId?: string | null;
    nowMs?: number;
  },
): Storyboard {
  const now = input.nowMs ?? Date.now();
  const storyboard: Storyboard = {
    storyboardId: `sb_${randomUUID()}`,
    ownerId: input.ownerId,
    knowledgeProjectId: input.knowledgeProjectId ?? null,
    compositionProjectId: input.compositionProjectId ?? null,
    title: input.title,
    lifecycleState: StoryboardLifecycle.DRAFT,
    createdAt: now,
    updatedAt: now,
  };
  db.prepare(`INSERT INTO storyboards (${STORYBOARD_COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    storyboard.storyboardId, storyboard.ownerId, storyboard.knowledgeProjectId,
    storyboard.compositionProjectId, storyboard.title, storyboard.lifecycleState,
    storyboard.createdAt, storyboard.updatedAt,
  );
  return storyboard;
}

export function getStoryboard(db: DatabaseSync, storyboardId: string, ownerId: string): Storyboard | null {
  const row = db
    .prepare(`SELECT ${STORYBOARD_COLUMNS} FROM storyboards WHERE storyboard_id = ? AND owner_id = ?`)
    .get(storyboardId, ownerId);
  return row ? rowToStoryboard(row as Record<string, unknown>) : null;
}

export function listStoryboardsForOwner(db: DatabaseSync, ownerId: string): readonly Storyboard[] {
  const rows = db
    .prepare(`SELECT ${STORYBOARD_COLUMNS} FROM storyboards WHERE owner_id = ? ORDER BY created_at DESC`)
    .all(ownerId);
  return rows.map((r) => rowToStoryboard(r as Record<string, unknown>));
}

const SCENE_COLUMNS =
  'scene_id, storyboard_id, owner_id, scene_order, description, visual_asset_id, audio_asset_id, duration_seconds, transition_intent, direction_notes, visual_search_en, sourcing, creation_demand_ar, created_at, updated_at';

function rowToScene(row: Record<string, unknown>): StoryboardScene {
  return {
    sceneId: row.scene_id as string,
    storyboardId: row.storyboard_id as string,
    ownerId: row.owner_id as string,
    order: row.scene_order as number,
    description: row.description as string,
    visualAssetId: (row.visual_asset_id as string | null) ?? null,
    audioAssetId: (row.audio_asset_id as string | null) ?? null,
    durationSeconds: (row.duration_seconds as number | null) ?? null,
    transitionIntent: (row.transition_intent as string | null) ?? null,
    directionNotes: (row.direction_notes as string | null) ?? null,
    visualSearchEn: (row.visual_search_en as string | null) ?? null,
    sourcing: (row.sourcing as 'stock' | 'generate' | null) ?? null,
    creationDemandAr: (row.creation_demand_ar as string | null) ?? null,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

export type AddSceneOutcome =
  | { readonly ok: true; readonly scene: StoryboardScene }
  | { readonly ok: false; readonly reason: 'STORYBOARD_NOT_FOUND' };

/**
 * Add a scene.
 *
 * The storyboard must exist AND belong to this Creator — checked here rather
 * than trusted, so a scene cannot be inserted into someone else's storyboard by
 * passing its id.
 *
 * When no order is supplied the scene goes last. Appending is what a Creator
 * writing a storyboard means by "add a scene"; inserting in the middle is a
 * reorder, which is a separate, deliberate act.
 */
export function addScene(
  db: DatabaseSync,
  input: {
    storyboardId: string;
    ownerId: string;
    description: string;
    order?: number;
    visualAssetId?: string | null;
    audioAssetId?: string | null;
    durationSeconds?: number | null;
    transitionIntent?: string | null;
    directionNotes?: string | null;
    visualSearchEn?: string | null;
    sourcing?: 'stock' | 'generate' | null;
    creationDemandAr?: string | null;
    nowMs?: number;
  },
): AddSceneOutcome {
  if (!getStoryboard(db, input.storyboardId, input.ownerId)) {
    return { ok: false, reason: 'STORYBOARD_NOT_FOUND' };
  }

  const next = db
    .prepare('SELECT COALESCE(MAX(scene_order), 0) AS m FROM storyboard_scenes WHERE storyboard_id = ?')
    .get(input.storyboardId) as unknown as { m: number };

  const now = input.nowMs ?? Date.now();
  const scene: StoryboardScene = {
    sceneId: `scene_${randomUUID()}`,
    storyboardId: input.storyboardId,
    ownerId: input.ownerId,
    order: input.order ?? Number(next.m) + 1,
    description: input.description,
    visualAssetId: input.visualAssetId ?? null,
    audioAssetId: input.audioAssetId ?? null,
    durationSeconds: input.durationSeconds ?? null,
    transitionIntent: input.transitionIntent ?? null,
    directionNotes: input.directionNotes ?? null,
    visualSearchEn: input.visualSearchEn ?? null,
    sourcing: input.sourcing ?? null,
    creationDemandAr: input.creationDemandAr ?? null,
    createdAt: now,
    updatedAt: now,
  };

  db.prepare(`INSERT INTO storyboard_scenes (${SCENE_COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    scene.sceneId, scene.storyboardId, scene.ownerId, scene.order, scene.description,
    scene.visualAssetId, scene.audioAssetId, scene.durationSeconds,
    scene.transitionIntent, scene.directionNotes, scene.visualSearchEn,
    scene.sourcing, scene.creationDemandAr,
    scene.createdAt, scene.updatedAt,
  );
  return { ok: true, scene };
}

/** The scenes of one storyboard, in the Creator's declared order. */
export function listScenes(db: DatabaseSync, storyboardId: string, ownerId: string): readonly StoryboardScene[] {
  const rows = db
    .prepare(`SELECT ${SCENE_COLUMNS} FROM storyboard_scenes WHERE storyboard_id = ? AND owner_id = ? ORDER BY scene_order ASC, created_at ASC`)
    .all(storyboardId, ownerId);
  return rows.map((r) => rowToScene(r as Record<string, unknown>));
}

/** Move a scene to a new position. Returns false if it is not this Creator's. */
export function setSceneOrder(
  db: DatabaseSync,
  sceneId: string,
  ownerId: string,
  order: number,
  nowMs: number = Date.now(),
): boolean {
  const result = db
    .prepare('UPDATE storyboard_scenes SET scene_order = ?, updated_at = ? WHERE scene_id = ? AND owner_id = ?')
    .run(order, nowMs, sceneId, ownerId);
  return Number(result.changes) > 0;
}

/** Assign an asset to a scene. Returns false if the scene is not this Creator's. */
export function assignSceneAsset(
  db: DatabaseSync,
  sceneId: string,
  ownerId: string,
  assignment: { visualAssetId?: string | null; audioAssetId?: string | null },
  nowMs: number = Date.now(),
): boolean {
  const scene = db
    .prepare(`SELECT ${SCENE_COLUMNS} FROM storyboard_scenes WHERE scene_id = ? AND owner_id = ?`)
    .get(sceneId, ownerId);
  if (!scene) return false;

  const current = rowToScene(scene as Record<string, unknown>);
  const result = db
    .prepare('UPDATE storyboard_scenes SET visual_asset_id = ?, audio_asset_id = ?, updated_at = ? WHERE scene_id = ? AND owner_id = ?')
    .run(
      assignment.visualAssetId !== undefined ? assignment.visualAssetId : current.visualAssetId,
      assignment.audioAssetId !== undefined ? assignment.audioAssetId : current.audioAssetId,
      nowMs, sceneId, ownerId,
    );
  return Number(result.changes) > 0;
}

// ══ TOMBSTONES — Articles 6.2, 6.3 ═════════════════════════════════════════

const TOMBSTONE_COLUMNS =
  'tombstone_id, asset_id, owner_id, asset_family, capability_target, parent_asset_id, root_asset_id, project_id, creation_chamber, deleted_by, deleted_at, deletion_reason, published_protection, metadata_snapshot';

function rowToTombstone(row: Record<string, unknown>): AssetTombstone {
  return {
    tombstoneId: row.tombstone_id as string,
    assetId: row.asset_id as string,
    ownerId: row.owner_id as string,
    assetFamily: (row.asset_family as string | null) ?? null,
    capabilityTarget: (row.capability_target as string | null) ?? null,
    parentAssetId: (row.parent_asset_id as string | null) ?? null,
    rootAssetId: (row.root_asset_id as string | null) ?? null,
    projectId: (row.project_id as string | null) ?? null,
    creationChamber: (row.creation_chamber as string | null) ?? null,
    deletedBy: row.deleted_by as string,
    deletedAt: row.deleted_at as number,
    deletionReason: (row.deletion_reason as string | null) ?? null,
    publishedProtection: row.published_protection as PublishedProtection,
    metadataSnapshot: JSON.parse((row.metadata_snapshot as string) || '{}') as Record<string, unknown>,
  };
}

/**
 * Record what survives an asset — Article 6.3.
 *
 * THE STORAGE PATH IS STRIPPED HERE, not left to the caller to remember.
 * Article 7.5 of the directive forbids a tombstone exposing raw storage paths,
 * and `secureStorageUri` is the field most likely to be passed in by habit
 * inside a metadata blob. Removing it at the boundary means the rule holds even
 * when a future caller forgets it.
 */
export function recordTombstone(
  db: DatabaseSync,
  input: {
    assetId: string;
    ownerId: string;
    assetFamily?: string | null;
    capabilityTarget?: string | null;
    parentAssetId?: string | null;
    rootAssetId?: string | null;
    projectId?: string | null;
    creationChamber?: string | null;
    deletedBy: string;
    deletionReason?: string | null;
    publishedProtection?: PublishedProtection;
    metadataSnapshot?: Record<string, unknown>;
    nowMs?: number;
  },
): AssetTombstone {
  const snapshot = { ...(input.metadataSnapshot ?? {}) };
  // Never persist an address the constitution forbids returning.
  delete snapshot.secureStorageUri;
  delete snapshot.secure_storage_uri;
  delete snapshot.assetUrl;

  const tombstone: AssetTombstone = {
    tombstoneId: `tomb_${randomUUID()}`,
    assetId: input.assetId,
    ownerId: input.ownerId,
    assetFamily: input.assetFamily ?? null,
    capabilityTarget: input.capabilityTarget ?? null,
    parentAssetId: input.parentAssetId ?? null,
    rootAssetId: input.rootAssetId ?? null,
    projectId: input.projectId ?? null,
    creationChamber: input.creationChamber ?? null,
    deletedBy: input.deletedBy,
    deletedAt: input.nowMs ?? Date.now(),
    deletionReason: input.deletionReason ?? null,
    publishedProtection: input.publishedProtection ?? PublishedProtection.NOT_PROTECTED,
    metadataSnapshot: snapshot,
  };

  db.prepare(`INSERT INTO asset_tombstones (${TOMBSTONE_COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    tombstone.tombstoneId, tombstone.assetId, tombstone.ownerId, tombstone.assetFamily,
    tombstone.capabilityTarget, tombstone.parentAssetId, tombstone.rootAssetId,
    tombstone.projectId, tombstone.creationChamber, tombstone.deletedBy, tombstone.deletedAt,
    tombstone.deletionReason, tombstone.publishedProtection, JSON.stringify(tombstone.metadataSnapshot),
  );
  return tombstone;
}

/**
 * What became of an asset that is no longer there.
 *
 * This is what keeps a derived asset from being orphaned by its ancestor's
 * destruction: the child still points at a parent id, and that id still has an
 * answer. Article 5.4 and Article 6.2 would otherwise contradict each other.
 */
export function findTombstoneByAssetId(db: DatabaseSync, assetId: string, ownerId: string): AssetTombstone | null {
  const row = db
    .prepare(`SELECT ${TOMBSTONE_COLUMNS} FROM asset_tombstones WHERE asset_id = ? AND owner_id = ? ORDER BY deleted_at DESC LIMIT 1`)
    .get(assetId, ownerId);
  return row ? rowToTombstone(row as Record<string, unknown>) : null;
}

export function listTombstonesForOwner(db: DatabaseSync, ownerId: string): readonly AssetTombstone[] {
  const rows = db
    .prepare(`SELECT ${TOMBSTONE_COLUMNS} FROM asset_tombstones WHERE owner_id = ? ORDER BY deleted_at DESC`)
    .all(ownerId);
  return rows.map((r) => rowToTombstone(r as Record<string, unknown>));
}

// ══ SOVEREIGN PUBLIC LINKS — Articles 9.2, 9.3 ═════════════════════════════

const LINK_COLUMNS =
  'link_id, public_token, owner_id, final_work_asset_id, publication_state, created_at, revoked_at, revoked_by';

function rowToLink(row: Record<string, unknown>): SovereignPublicLink {
  return {
    linkId: row.link_id as string,
    publicToken: row.public_token as string,
    ownerId: row.owner_id as string,
    finalWorkAssetId: row.final_work_asset_id as string,
    publicationState: row.publication_state as PublicationState,
    createdAt: row.created_at as number,
    revokedAt: (row.revoked_at as number | null) ?? null,
    revokedBy: (row.revoked_by as string | null) ?? null,
  };
}

/**
 * Mint an unguessable public identifier — Article 9.3.
 *
 * 32 bytes from the platform CSPRNG, base64url, no padding. Not a UUID (v4 has
 * 122 bits and a recognisable shape), not a counter, not a timestamp, not a
 * hash of anything the Creator could predict.
 *
 * This matters more here than anywhere else in the system: the security closure
 * shut every public path to an asset, and this token is the single deliberate
 * exception. An enumerable token would reopen by the front door what was closed
 * at the back.
 */
export function mintPublicToken(): string {
  return randomBytes(32).toString('base64url');
}

export function createPublicLink(
  db: DatabaseSync,
  input: { ownerId: string; finalWorkAssetId: string; nowMs?: number },
): SovereignPublicLink {
  const link: SovereignPublicLink = {
    linkId: `link_${randomUUID()}`,
    publicToken: mintPublicToken(),
    ownerId: input.ownerId,
    finalWorkAssetId: input.finalWorkAssetId,
    publicationState: PublicationState.PUBLISHED,
    createdAt: input.nowMs ?? Date.now(),
    revokedAt: null,
    revokedBy: null,
  };
  db.prepare(`INSERT INTO sovereign_public_links (${LINK_COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    link.linkId, link.publicToken, link.ownerId, link.finalWorkAssetId,
    link.publicationState, link.createdAt, link.revokedAt, link.revokedBy,
  );
  return link;
}

/**
 * Resolve a token to its link.
 *
 * Deliberately takes NO ownerId — a public link is public, that is its purpose.
 * The caller decides what to do with a revoked one; this returns the record
 * including its revocation, so the refusal is made where it can be seen.
 */
export function findPublicLinkByToken(db: DatabaseSync, publicToken: string): SovereignPublicLink | null {
  const row = db.prepare(`SELECT ${LINK_COLUMNS} FROM sovereign_public_links WHERE public_token = ?`).get(publicToken);
  return row ? rowToLink(row as Record<string, unknown>) : null;
}

/** Withdraw a publication. Public access must stop. Article 9.3. */
export function revokePublicLink(
  db: DatabaseSync,
  linkId: string,
  ownerId: string,
  nowMs: number = Date.now(),
): boolean {
  const result = db
    .prepare('UPDATE sovereign_public_links SET publication_state = ?, revoked_at = ?, revoked_by = ? WHERE link_id = ? AND owner_id = ?')
    .run(PublicationState.REVOKED, nowMs, ownerId, linkId, ownerId);
  return Number(result.changes) > 0;
}

export function listPublicLinksForOwner(db: DatabaseSync, ownerId: string): readonly SovereignPublicLink[] {
  const rows = db
    .prepare(`SELECT ${LINK_COLUMNS} FROM sovereign_public_links WHERE owner_id = ? ORDER BY created_at DESC`)
    .all(ownerId);
  return rows.map((r) => rowToLink(r as Record<string, unknown>));
}
