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
import { toSearchLanguage, composeAnswer } from '@/src/chambers/hujjah-al-damighah/sovereign-language-bridge';

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
  confidenceScore: number;
  confidenceLevel: string;
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
    const bridged = await toSearchLanguage(understandingOutcome.intent.normalizedQuery);
    const intent = bridged
      ? { ...understandingOutcome.intent, normalizedQuery: bridged }
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

    // Stage 4b — Synthesis: compose the Arabic answer from the gathered
    // evidence. Was OpenAI, whose key was never configured on the server, so
    // this stage was skipped in silence and every Creator saw raw evidence and
    // no answer. Gemini carries it now — the same key the Empire already uses.
    const synthesizedAnswer = (await composeAnswer({
      query,
      evidenceTexts: evidenceOutcome.collection.items.map((item) => item.evidence.extractedText),
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

    const { collection } = evidenceOutcome;
    const scores = collection.items.map((item) => item.evidence.confidenceScore);
    const averageEvidenceScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;

    return {
      success: true,
      evidence: collection.items.map((item) => ({
        id: item.evidence.id,
        extractedText: item.evidence.extractedText,
        contextWindow: item.evidence.contextWindow ?? '',
        confidenceScore: item.evidence.confidenceScore,
        confidenceLevel: String(item.evidence.confidenceLevel),
      })),
      totalSourcesScanned: collection.totalSourcesScanned,
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
