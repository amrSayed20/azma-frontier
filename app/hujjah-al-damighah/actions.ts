'use server';

import { cookies } from 'next/headers';
import OpenAI from 'openai';
import { verifySession } from '@/src/authentication';
import { receiveCitizenKnowledgeRequest } from '@/src/chambers/hujjah-al-damighah/reception-engine';
import { understandKnowledgeReception } from '@/src/chambers/hujjah-al-damighah/understanding-engine';
import { conductInvestigation } from '@/src/chambers/hujjah-al-damighah/investigation-engine';
import { collectEvidence } from '@/src/chambers/hujjah-al-damighah/evidence-layer';
import { declareKnowledge } from '@/src/chambers/hujjah-al-damighah/knowledge-layer';
import { formulateResponse } from '@/src/chambers/hujjah-al-damighah/knowledge-response-layer';
import { exportKnowledgeResponse } from '@/src/chambers/hujjah-al-damighah/knowledge-export-layer';
import { createPerceptionEndpointForOrgan } from '@/src/sovereign-nervous-system';

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

    // Stage 3 — Investigation: only stage authorised to invoke IntelligenceEngine
    const investigationOutcome = await conductInvestigation(understandingOutcome.intent);
    if (!investigationOutcome.ok) {
      return { success: false, evidence: [], totalSourcesScanned: 0, averageEvidenceScore: 0, error: 'Investigation could not be conducted.' };
    }

    // Stage 4 — Evidence: wrap raw bundle with constitutional lineage
    const evidenceOutcome = collectEvidence(investigationOutcome.result);
    if (!evidenceOutcome.ok) {
      return { success: false, evidence: [], totalSourcesScanned: 0, averageEvidenceScore: 0, error: 'Evidence collection failed.' };
    }

    // Stage 4b — Synthesis: compose a real Arabic answer from collected evidence
    let synthesizedAnswer: string | undefined;
    try {
      const openaiApiKey = process.env['OPENAI_API_KEY'];
      if (openaiApiKey && evidenceOutcome.collection.items.length > 0) {
        const openai = new OpenAI({ apiKey: openaiApiKey });
        const evidenceSummary = evidenceOutcome.collection.items
          .slice(0, 5)
          .map((item, i) => `[${i + 1}] ${item.evidence.extractedText}`)
          .join('\n\n');
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: [
                'أنت نظام معرفة سيادي. مهمتك تقديم إجابة عربية واضحة وموثوقة على سؤال المستخدم بناءً على الأدلة المقدمة.',
                'اكتب 3 إلى 5 جمل متماسكة تجيب مباشرة على السؤال.',
                'لا تذكر مصادر المعرفة أو أسماء قواعد البيانات أو المنصات.',
                'قدّم المعلومة كحقيقة موثوقة وبأسلوب رسمي واضح.',
              ].join(' '),
            },
            {
              role: 'user',
              content: `السؤال: ${query}\n\nالأدلة:\n${evidenceSummary}`,
            },
          ],
          max_tokens: 600,
          temperature: 0.3,
        });
        synthesizedAnswer = completion.choices[0]?.message?.content ?? undefined;
      }
    } catch {
      // Synthesis is non-fatal — investigation still returns evidence
    }

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
