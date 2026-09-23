'use server';

import { cookies } from 'next/headers';
import { verifySession } from '@/src/authentication';
import { receiveCitizenKnowledgeRequest } from '@/src/chambers/hujjah-al-damighah/reception-engine';
import { understandKnowledgeReception } from '@/src/chambers/hujjah-al-damighah/understanding-engine';
import { conductInvestigation } from '@/src/chambers/hujjah-al-damighah/investigation-engine';
import { collectEvidence } from '@/src/chambers/hujjah-al-damighah/evidence-layer';
import { declareKnowledge } from '@/src/chambers/hujjah-al-damighah/knowledge-layer';
import { formulateResponse } from '@/src/chambers/hujjah-al-damighah/knowledge-response-layer';
import { exportKnowledgeResponse } from '@/src/chambers/hujjah-al-damighah/knowledge-export-layer';
import { createPerceptionEndpointForOrgan } from '@/src/sovereign-nervous-system';
import { toSearchLanguage, composeAnswerOutcome, toArabic, displayableText } from '@/src/chambers/hujjah-al-damighah/sovereign-language-bridge';
import { authorityOfEvidence, SourceAuthority } from '@/src/chambers/hujjah-al-damighah/domain/evidence-authority';
import { judgeSubjectRelevance, sortingNoticeAr } from '@/src/chambers/hujjah-al-damighah/subject-relevance';
import { KnowledgeInvestigationRepository } from '@/src/persistent-storage/knowledge-investigation-repository';
import { getDb } from '@/src/persistent-storage/db';
import { InvestigationFailure, failureSpokenAr } from './_lib/investigation-failure';
import { SovereignVaultManager } from '@/src/vault/sovereign-vault-manager';
import { persistUploadedAsset } from '@/src/vault/vault-asset-upload-storage';
import { AssetFamily, SourceChamber } from '@/src/vault/sovereign-vault-types';
import { CapabilityTarget } from '@/src/core/sovereign-orchestrator/qiyamah-intent-types';

/**
 * A failed investigation, said to the Creator in their own tongue.
 *
 * Every early return in this action used to build its own object by hand, and
 * three of them put machine text in the one field the screen prints. There is
 * now one way to fail, and it cannot carry an exception's words.
 */
function failed(failure: InvestigationFailure): InvestigationDTO {
  return {
    success: false,
    evidence: [],
    totalSourcesScanned: 0,
    averageEvidenceScore: 0,
    error: failureSpokenAr(failure),
  };
}

/**
 * Marks an investigation as the chamber's own rather than a Milestone Goal's.
 *
 * The investigation store is keyed by goal because it was built for the
 * Sovereign path, where every investigation answers one. A Creator typing a
 * question has no goal, and inventing a plausible-looking id would put records
 * that belong to no goal into the Sovereign path's own history. This is
 * explicit and searchable instead.
 */
const CHAMBER_INVESTIGATION_GOAL_ID = 'citizen-chamber';

let investigationStore: KnowledgeInvestigationRepository | null = null;
function knowledgeInvestigationStore(): KnowledgeInvestigationRepository {
  // Built on the Empire's own connection, the same one every other repository
  // uses — not a second one opened beside it.
  investigationStore ??= new KnowledgeInvestigationRepository(getDb());
  return investigationStore;
}

/**
 * Constitutional Nervous System integration.
 * Reports organ lifecycle — never interprets investigation findings.
 */
const hujjahPerception = createPerceptionEndpointForOrgan('hujjah-al-damighah');

/**
 * The creator-facing evidence item.
 * sourceProvider is intentionally absent — the Empire never reveals
 * which provider or Ministry contributed knowledge (Knowledge Source
 * Abstraction Principle).
 */
export interface EvidenceItemDTO {
  id: string;
  extractedText: string;
  contextWindow: string;
  /** How directly this passage bears on the question. Not its standing. */
  confidenceScore: number;
  confidenceLevel: string;
  /**
   * What kind of source this is — a SourceAuthority value. Kept separate from
   * the score so the chamber can show a decisive text with a distant bearing
   * instead of calling it weak. See domain/evidence-authority.ts.
   */
  sourceAuthority: string;
  /**
   * The text as its source held it, when what is displayed is a rendering of
   * it. Absent when the source was already in the Creator's tongue.
   *
   * A rendering that cannot be checked against its original is a claim about a
   * source rather than the source itself.
   */
  originalText?: string;
  /** Declares the machine's hand. Absent only when nothing was rendered. */
  translationLabelAr?: string;
  /**
   * Where this text is found, and what the scholars said of it — carried as its
   * own field so that no preview or window can cut it off. The evidence board
   * shows a hundred characters; a citation at the end of the text never
   * survived that.
   */
  attributionAr?: string;
}

export interface InvestigationDTO {
  success: boolean;
  /**
   * What the chamber set aside as being about something else, in the Creator's
   * words. Absent when nothing was set aside.
   */
  setAsideNoticeAr?: string;
  evidence: EvidenceItemDTO[];
  totalSourcesScanned: number;
  averageEvidenceScore: number;
  synthesizedAnswer?: string;
  error?: string;
}

/** The Creator declares a religious question by choosing this domain. The id
    comes straight from KNOWLEDGE_DOMAINS in the chamber's own evidence-utils.
    It is never inferred from wording: mistaking a historical question for a
    religious one would rule on it, and that is not a detector's call. */
const RELIGIOUS_CATEGORIES = new Set(['religious']);

export async function runInvestigation(
  query: string,
  category: string,
): Promise<InvestigationDTO> {
  const jar = await cookies();
  const sessionId = jar.get('azma_session')?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (!session) {
    return failed(InvestigationFailure.NOT_ADMITTED);
  }

  try {
    // Stage 1 — Reception: constitutional entry boundary
    const reception = receiveCitizenKnowledgeRequest(query, category);
    if (reception.status !== 'RECEIVED') {
      return failed(InvestigationFailure.QUESTION_NOT_ACCEPTED);
    }

    // Stage 2 — Understanding: classify and normalise the inquiry
    const understandingOutcome = understandKnowledgeReception(reception);
    if (!understandingOutcome.ok) {
      return failed(InvestigationFailure.QUESTION_NOT_UNDERSTOOD);
    }

    // The Creator declares a religious question themselves, from the category
    // they chose. Inferring it from the wording would mistake a historical
    // question for a religious one and rule on it — a judgement no detector
    // should make on a Creator's behalf.
    const isReligious = RELIGIOUS_CATEGORIES.has(category.trim().toLowerCase());

    // Stage 2b — Language bridge: most repositories hold nothing in Arabic, so
    // an Arabic question reached them as an unmatched string and the library
    // stayed silent. It is asked in the language each catalogue indexes.
    //
    // The rendering used to be written over normalizedQuery, which erased the
    // Creator's own words from every stage downstream. Anything indexed in
    // Arabic was then asked in English and could never answer, and any Arabic
    // passage was graded against an English question and scored zero. It now
    // travels beside the original rather than replacing it.
    const bridged = await toSearchLanguage(understandingOutcome.intent.normalizedQuery);
    const intent = bridged
      ? { ...understandingOutcome.intent, catalogueQuery: bridged }
      : understandingOutcome.intent;

    // Stage 3 — Investigation: only stage authorised to invoke IntelligenceEngine
    const investigationOutcome = await conductInvestigation(intent);
    if (!investigationOutcome.ok) {
      return failed(InvestigationFailure.NOTHING_FOUND);
    }

    // Stage 4 — Evidence: wrap raw bundle with constitutional lineage
    const evidenceOutcome = collectEvidence(investigationOutcome.result);
    if (!evidenceOutcome.ok) {
      return failed(InvestigationFailure.NOTHING_FOUND);
    }

    // Stage 4 ½ — On the subject, or merely carrying the word?
    //
    // Retrieval finds passages that carry a word, which is all it can do over
    // thirty-six thousand narrations. But a word is not a subject: asked for
    // the story of Yunus ﷺ the chamber returned the verse, then narrations
    // transmitted by a man named Yunus, then a singer who shares the name.
    // Separating the chain from the narration removed the transmitters; nothing
    // in string matching removes the singer.
    //
    // So the candidates are read once and each is judged on one question — is
    // this in the subject asked about? — and what is not is set aside and
    // counted, never dropped in silence.
    //
    // Only the Qur'an is kept regardless. I first protected the Sunnah the same
    // way and it defeated the whole purpose: a narration about Ramadan cannot
    // be set aside from a question about Yunus ﷺ if narrations are exempt, and
    // narrations reaching a question they have nothing to do with is precisely
    // what the Founder reported. A narration's *standing* is protected — it is
    // never labelled folklore, and its grade is never invented — but whether it
    // is on the subject is a different question, and authenticity does not
    // answer it. A sound hadith about fasting is still not about Yunus.
    const subjectVerdict = await judgeSubjectRelevance(
      query,
      evidenceOutcome.collection.items.map((item) => ({
        id: item.evidence.id,
        text: item.evidence.extractedText,
        keepAlways: authorityOfEvidence(item.evidence) === SourceAuthority.SCRIPTURE,
      })),
    );
    const onSubject = new Set(subjectVerdict.onSubject);
    const subjectItems = evidenceOutcome.collection.items.filter((i) => onSubject.has(i.evidence.id));

    // Stage 4a — The Creator's tongue.
    //
    // Measured on the live page: a Creator asking «قصة أصحاب الفيل» in Arabic
    // was shown «Media Topic: Mecca», «Warfare in pre-Islamic Arabia» and three
    // more English entries. The chamber speaks, so those were not merely
    // awkward to read past — they were read aloud, in a language the Creator
    // did not ask in.
    //
    // Everything crosses here, before display and therefore before speech, and
    // a passage that cannot cross is withheld rather than shown in English. The
    // Founder's two rules pull against each other at this exact point — «لا
    // يعرض النص باللغة الإنجليزية» and «لا أريد أن يستغرق الحصول على الإجابة
    // وقتاً طويلاً» — and the language rule wins, because it is an identity and
    // the other is a comfort. Withholding costs a Creator one piece of
    // evidence; showing English costs the chamber its voice.
    const rendered = await toArabic(subjectItems.map((item) => item.evidence.extractedText));

    const carried = subjectItems
      .map((item, i) => ({ item, text: displayableText(rendered[i]!), record: rendered[i]! }))
      .filter((e): e is { item: typeof e.item; text: string; record: typeof e.record } =>
        typeof e.text === 'string' && e.text.length > 0);

    // What the chamber actually assembled, counted where it can still be seen.
    //
    // The chamber had no way to say where evidence was lost. A Creator asking
    // for a narration received verses and nothing else, and every stage between
    // the search and the screen was equally plausible as the place it vanished
    // — so the search was measured, the store was measured, the ranking was
    // measured, and the answer was still not in hand. A room that cannot
    // account for its own output cannot be trusted with a religious question.
    //
    // No repository, host or model is named. What is counted is what kind of
    // evidence survived, which is the Empire's own business.
    const authorityTally: Record<string, number> = {};
    for (const item of subjectItems) {
      const key = String(authorityOfEvidence(item.evidence));
      authorityTally[key] = (authorityTally[key] ?? 0) + 1;
    }
    const withheldForLanguage = rendered.filter(
      (r) => displayableText(r) === null,
    ).length;
    console.log(
      `[Hujjah] domain=${category} gathered=${evidenceOutcome.collection.items.length} ` +
      `onSubject=${subjectItems.length} judged=${subjectVerdict.judged} ` +
      `carried=${carried.length} withheldForLanguage=${withheldForLanguage} ` +
      `byAuthority=${JSON.stringify(authorityTally)}`,
    );

    // Stage 4b — Synthesis: compose the Arabic answer from the gathered
    // evidence. Was OpenAI, whose key was never configured on the server, so
    // this stage was skipped in silence and every Creator saw raw evidence and
    // no answer. Gemini carries it now — the same key the Empire already uses.
    //
    // It then failed in silence a second time, under Gemini. MEASURED on
    // production 2026-09-23: no investigation carried «الجواب المركَّب», and
    // the Creator saw «الملخص» — a count of evidence — where the answer
    // belongs. `?? undefined` discarded the reason, so nothing in the Empire
    // could tell a missing key from a refusal from a timeout. The reason is
    // now recorded. A stage that skips itself must say that it did.
    const synthesis = await composeAnswerOutcome({
      query,
      // The citation travels with the passage, so the composed answer can say
      // which collection a narration is in and what the scholars said of it
      // instead of paraphrasing an unattributed sentence.
      evidenceTexts: carried.map((e) =>
        e.item.evidence.attributionAr ? `${e.text}\n[${e.item.evidence.attributionAr}]` : e.text),
      isReligious,
    });
    const synthesizedAnswer = synthesis.text ?? undefined;
    if (synthesis.failure) {
      console.error('[Hujjah] answer not composed:', JSON.stringify({
        failure: synthesis.failure,
        httpStatus: synthesis.httpStatus,
        evidenceCount: carried.length,
      }));
    }

    // Stage 5 — Knowledge: declare the highest truthful conclusion
    const declaration = declareKnowledge(evidenceOutcome.collection);

    // Stage 6 — Response: wrap declaration for constitutional delivery
    const response = formulateResponse(declaration);

    // Stage 7 — Export: seal the constitutional exit receipt for the CITIZEN destination
    const exportRecord = exportKnowledgeResponse(response, 'CITIZEN');

    // Stage 7b — Remember it.
    //
    // The store, the contract and the repository were all built and wired to
    // SOEL, and the chamber never wrote a line to them: a Creator's own
    // investigation died with their session while a table sat ready for it.
    // Using what exists rather than building beside it.
    //
    // The store is keyed by goal, and a Creator asking a question in the
    // chamber has no goal — so a reserved id marks these as the chamber's own
    // rather than a Milestone Goal's. Inventing a plausible-looking goalId
    // would corrupt the Sovereign path's records with investigations that
    // belong to no goal at all.
    try {
      knowledgeInvestigationStore().save({
        investigationId: exportRecord.exportId,
        goalId: CHAMBER_INVESTIGATION_GOAL_ID,
        creatorId: session.creatorId,
        records: [exportRecord],
        recordCount: 1,
        investigatedAtMs: Date.now(),
      });
    } catch (err) {
      // A memory that fails must not cost the Creator the answer they already
      // have. It is reported, not swallowed silently.
      console.warn(`[Hujjah] investigation not persisted: ${String(err).slice(0, 120)}`);
    }

    hujjahPerception.report({
      signalType: 'State',
      relatedEvent: 'Creator Completed Goal',
      reportingAuthority: 'hujjah-al-damighah',
      purpose: 'An investigation completed successfully.',
      content: null,
    });

    // The match rate is measured over the evidence the Creator actually
    // receives, not over what was gathered — a withheld passage cannot be part
    // of a number describing what they are looking at.
    const scores = carried.map((e) => e.item.evidence.confidenceScore);
    const averageEvidenceScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;

    return {
      success: true,
      evidence: carried.map(({ item, text, record }) => ({
        id: item.evidence.id,
        extractedText: text,
        contextWindow: text,
        confidenceScore: item.evidence.confidenceScore,
        confidenceLevel: String(item.evidence.confidenceLevel),
        sourceAuthority: String(authorityOfEvidence(item.evidence)),
        // The original never travels as the displayed text, but it never
        // disappears either: a Creator who wants to check a rendering must be
        // able to see what it was rendered from.
        originalText: record.translationType === 'ORIGINAL' ? undefined : record.originalText,
        translationLabelAr: record.translationType === 'ORIGINAL'
          ? undefined
          : 'ترجمة آلية — والأصل محفوظ',
        attributionAr: item.evidence.attributionAr,
      })),
      totalSourcesScanned: evidenceOutcome.collection.totalSourcesScanned,
      averageEvidenceScore,
      synthesizedAnswer,
      // Evidence is never dropped in silence. A Creator who asked about الصبر
      // and is handed four passages instead of ten is owed the reason.
      setAsideNoticeAr: sortingNoticeAr(subjectVerdict) || undefined,
    };
  } catch (err) {
    hujjahPerception.report({
      signalType: 'Health',
      relatedEvent: null,
      reportingAuthority: 'hujjah-al-damighah',
      purpose: 'An investigation failed.',
      content: null,
    });
    // The exception's own words stay on this side of the wire. Every provider
    // stamps its name and the document's identifier into what it throws —
    // «[SovereignLibraryProvider] Cannot read 'book-1513': HTTP 403» — and this
    // field is printed to the Creator unaltered. The engineer who needs that
    // line reads it here; the Creator never does.
    console.error('[Hujjah] Investigation failed:', err);
    return failed(InvestigationFailure.CHAMBER_FAULT);
  }
}

/**
 * What the Creator gets back when they keep a piece of evidence.
 *
 * `ok: false` carries the Creator's own words for why, never the machine's —
 * the same rule the failure vocabulary enforces above.
 */
export interface VaultDepositDTO {
  ok: boolean;
  /** The Vault's own id for what was kept. Present only on success. */
  assetId?: string;
  /** Why not, in the Creator's tongue. Present only on failure. */
  reasonAr?: string;
}

/**
 * Keep a piece of evidence in the Creator's Vault — really.
 *
 * ─── WHAT WAS MEASURED ──────────────────────────────────────────────────────
 *
 *   The chamber told the Creator «محفوظ في الخزانة» while writing to
 *   `sessionStorage`, inside a try/catch that swallowed the error and showed
 *   the message anyway. Evidence a Creator chose to keep died when the tab
 *   closed, and they were told twice over that it had not. A false success is
 *   worse than a refusal: a refusal can be retried.
 *
 * ─── WHY THIS IS A CONNECTION, NOT A NEW CAPABILITY ─────────────────────────
 *
 *   `SovereignVaultManager.depositAsset()` is the boundary every other chamber
 *   already deposits through, backed by the vault_assets table and bound to the
 *   Creator by tenant. Al Hujjah was the only chamber that had not been wired
 *   to it. Building a chamber-local store beside it would have been the
 *   architectural failure the Sovereign Spine rule names outright.
 *
 * ─── WHAT IS KEPT, AND WHAT IS NOT ──────────────────────────────────────────
 *
 *   The evidence and its citation — «صحيح البخاري، كتاب بدء الوحي، رقم ١» —
 *   because that is الحجّة and it is what makes the text checkable later.
 *   Never the provider, the repository, or the document's machine identifier:
 *   the Creator sees the proof, not the source.
 */
export async function depositEvidenceToVault(
  evidenceText: string,
  attributionAr: string | undefined,
  questionAr: string,
): Promise<VaultDepositDTO> {
  const jar = await cookies();
  const sessionId = jar.get('azma_session')?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (!session) {
    return { ok: false, reasonAr: failureSpokenAr(InvestigationFailure.NOT_ADMITTED) };
  }

  const text = evidenceText.trim();
  if (text.length === 0) {
    return { ok: false, reasonAr: 'لا يوجد نصٌّ لحفظه.' };
  }

  try {
    // The kept document reads as the Creator will read it months from now:
    // what they asked, the text itself, and where it is found.
    const document = [
      `السؤال: ${questionAr.trim()}`,
      '',
      text,
      ...(attributionAr ? ['', attributionAr] : []),
    ].join('\n');

    const persisted = await persistUploadedAsset(Buffer.from(document, 'utf-8'), '.txt');

    const asset = await new SovereignVaultManager().depositAsset({
      // The Chamber of Evidence produced this text. Article 10.
      creationChamber: SourceChamber.HUJJAH_AL_DAMIGHAH,
      operationId: persisted.assetId,
      subscriberTenantId: session.creatorId,
      capabilityTarget: CapabilityTarget.WRITING,
      assetFamily: AssetFamily.STRUCTURAL,
      secureStorageUri: persisted.assetUrl,
      metadata: {
        // Named for what the Creator kept, not for the machinery that found it.
        originChamber: 'hujjah-al-damighah',
        questionAr: questionAr.trim().slice(0, 300),
        ...(attributionAr ? { attributionAr } : {}),
      },
    });

    return { ok: true, assetId: asset.assetId };
  } catch (err) {
    console.error('[Hujjah] Vault deposit failed:', err);
    return { ok: false, reasonAr: 'تعذّر الحفظ في الخزانة. لم يُحفظ شيء، فأعد المحاولة.' };
  }
}

/**
 * Keep the whole investigation — the question, the answer, and every piece of
 * evidence with its citation — as one document in the Creator's Vault.
 *
 * The chamber's «احفظ في الخزانة» wrote a summary line to `sessionStorage`
 * under the chamber-to-chamber transfer key and said it was saved. That key is
 * real and still used, but it is a HANDOFF: Vault Palace and Qiyamah read it
 * once on arrival and delete it. Nothing was ever kept. A Creator who spent an
 * hour assembling evidence and pressed save had, by the next morning, nothing.
 *
 * Deposited through the same boundary as a single piece of evidence, for the
 * same reason, carrying citations and never a source.
 */
export async function depositInvestigationToVault(
  questionAr: string,
  synthesizedAnswer: string | undefined,
  evidence: readonly EvidenceItemDTO[],
): Promise<VaultDepositDTO> {
  const jar = await cookies();
  const sessionId = jar.get('azma_session')?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (!session) {
    return { ok: false, reasonAr: failureSpokenAr(InvestigationFailure.NOT_ADMITTED) };
  }

  if (evidence.length === 0) {
    return { ok: false, reasonAr: 'لا توجد أدلة لحفظها.' };
  }

  try {
    const lines: string[] = [`السؤال: ${questionAr.trim()}`, ''];
    if (synthesizedAnswer && synthesizedAnswer.trim().length > 0) {
      lines.push('الجواب المركَّب:', synthesizedAnswer.trim(), '');
    }
    lines.push(`الأدلة (${evidence.length}):`, '');
    evidence.forEach((item, index) => {
      lines.push(`— [${index + 1}] ${item.extractedText.trim()}`);
      if (item.attributionAr) lines.push(`   ${item.attributionAr.replace(/\n/g, '\n   ')}`);
      lines.push('');
    });

    const persisted = await persistUploadedAsset(Buffer.from(lines.join('\n'), 'utf-8'), '.txt');

    const asset = await new SovereignVaultManager().depositAsset({
      // The Chamber of Evidence produced this text. Article 10.
      creationChamber: SourceChamber.HUJJAH_AL_DAMIGHAH,
      operationId: persisted.assetId,
      subscriberTenantId: session.creatorId,
      capabilityTarget: CapabilityTarget.WRITING,
      assetFamily: AssetFamily.STRUCTURAL,
      secureStorageUri: persisted.assetUrl,
      metadata: {
        originChamber: 'hujjah-al-damighah',
        questionAr: questionAr.trim().slice(0, 300),
        // The synthesized answer, bounded: this is what the next Chamber can
        // actually take up as material for creation (Constitution 10.1 — the
        // purpose and the brief), and Qiyamah's idea accepts 1000 characters.
        // The full text, with every piece of evidence, is the asset itself.
        answerAr: synthesizedAnswer && synthesizedAnswer.trim().length > 0
          ? synthesizedAnswer.trim().slice(0, 700)
          : undefined,
        evidenceCount: evidence.length,
      },
    });

    return { ok: true, assetId: asset.assetId };
  } catch (err) {
    console.error('[Hujjah] Investigation deposit failed:', err);
    return { ok: false, reasonAr: 'تعذّر الحفظ في الخزانة. لم يُحفظ شيء، فأعد المحاولة.' };
  }
}
