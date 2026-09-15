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
import { toSearchLanguage, composeAnswer, toArabic, displayableText } from '@/src/chambers/hujjah-al-damighah/sovereign-language-bridge';
import { authorityOfEvidence } from '@/src/chambers/hujjah-al-damighah/domain/evidence-authority';

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
}

export interface InvestigationDTO {
  success: boolean;
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
    return { success: false, evidence: [], totalSourcesScanned: 0, averageEvidenceScore: 0, error: 'AUTH_REQUIRED' };
  }

  try {
    // Stage 1 — Reception: constitutional entry boundary
    const reception = receiveCitizenKnowledgeRequest(query, category);
    if (reception.status !== 'RECEIVED') {
      return { success: false, evidence: [], totalSourcesScanned: 0, averageEvidenceScore: 0, error: 'Query rejected at the reception boundary.' };
    }

    // Stage 2 — Understanding: classify and normalise the inquiry
    const understandingOutcome = understandKnowledgeReception(reception);
    if (!understandingOutcome.ok) {
      return { success: false, evidence: [], totalSourcesScanned: 0, averageEvidenceScore: 0, error: 'Query could not be understood.' };
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
      return { success: false, evidence: [], totalSourcesScanned: 0, averageEvidenceScore: 0, error: 'Investigation could not be conducted.' };
    }

    // Stage 4 — Evidence: wrap raw bundle with constitutional lineage
    const evidenceOutcome = collectEvidence(investigationOutcome.result);
    if (!evidenceOutcome.ok) {
      return { success: false, evidence: [], totalSourcesScanned: 0, averageEvidenceScore: 0, error: 'Evidence collection failed.' };
    }

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
    const rendered = await toArabic(
      evidenceOutcome.collection.items.map((item) => item.evidence.extractedText),
    );

    const carried = evidenceOutcome.collection.items
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
    for (const item of evidenceOutcome.collection.items) {
      const key = String(authorityOfEvidence(item.evidence));
      authorityTally[key] = (authorityTally[key] ?? 0) + 1;
    }
    const withheldForLanguage = rendered.filter(
      (r) => displayableText(r) === null,
    ).length;
    console.log(
      `[Hujjah] domain=${category} gathered=${evidenceOutcome.collection.items.length} ` +
      `carried=${carried.length} withheldForLanguage=${withheldForLanguage} ` +
      `byAuthority=${JSON.stringify(authorityTally)}`,
    );

    // Stage 4b — Synthesis: compose the Arabic answer from the gathered
    // evidence. Was OpenAI, whose key was never configured on the server, so
    // this stage was skipped in silence and every Creator saw raw evidence and
    // no answer. Gemini carries it now — the same key the Empire already uses.
    const synthesizedAnswer = (await composeAnswer({
      query,
      evidenceTexts: carried.map((e) => e.text),
      isReligious,
    })) ?? undefined;

    // Stage 5 — Knowledge: declare the highest truthful conclusion
    const declaration = declareKnowledge(evidenceOutcome.collection);

    // Stage 6 — Response: wrap declaration for constitutional delivery
    const response = formulateResponse(declaration);

    // Stage 7 — Export: seal the constitutional exit receipt for the CITIZEN destination
    exportKnowledgeResponse(response, 'CITIZEN');

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
      })),
      totalSourcesScanned: evidenceOutcome.collection.totalSourcesScanned,
      averageEvidenceScore,
      synthesizedAnswer,
    };
  } catch (err) {
    hujjahPerception.report({
      signalType: 'Health',
      relatedEvent: null,
      reportingAuthority: 'hujjah-al-damighah',
      purpose: 'An investigation failed.',
      content: null,
    });
    return {
      success: false,
      evidence: [],
      totalSourcesScanned: 0,
      averageEvidenceScore: 0,
      error: String(err),
    };
  }
}
