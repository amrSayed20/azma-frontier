'use client';

import React from 'react';
import type { EvidenceItemDTO } from '../actions';
import type { DomainId } from '../_lib/evidence-utils';
import {
  resolveKnowledgeLayer,
  authorityOf,
  relevanceOf,
  authorityLabelAr,
  relevanceLabelAr,
  interpretationNoteAr,
  evidenceForTaking,
} from '../_lib/evidence-utils';

interface Props {
  evidence:           EvidenceItemDTO | null;
  domain:             DomainId;
  query:              string;
  open:               boolean;
  onClose:            () => void;
  onNewInvestigation: (query: string) => void;
  onSaveToVault:      (ev: EvidenceItemDTO) => void;
}

/** Copy, with a path for browsers that refuse the clipboard API outright. */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Permission refused or an insecure context — fall through and try the
    // older path rather than telling the Creator the proof cannot be taken.
  }
  try {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(field);
    return ok;
  } catch {
    return false;
  }
}

export function EvidenceGateway({
  evidence, domain, query, open, onClose, onNewInvestigation, onSaveToVault,
}: Props) {
  const [taken, setTaken] = React.useState<'idle' | 'done' | 'failed'>('idle');

  React.useEffect(() => { setTaken('idle'); }, [evidence?.id]);

  if (!evidence) return null;

  const layer = resolveKnowledgeLayer(evidence, domain);
  const authority = authorityOf(evidence);
  const note = interpretationNoteAr(authority);

  async function take() {
    const ok = await copyToClipboard(evidenceForTaking(evidence!, query, domain));
    setTaken(ok ? 'done' : 'failed');
  }

  return (
    <div className={`evidence-gateway ${open ? 'gateway-open' : ''}`} role="complementary" aria-label="بوابة الدليل">
      <div className="gateway-header">
        <div className="gateway-meta">
          <span className={`gateway-tier tier-${layer.tier}`}>{layer.labelAr}</span>
          {/* This figure measures how closely the passage matches the wording of
              the question and nothing else. It stood here bare, beside a tier
              that describes the source, and a reader could only take it as a
              verdict on the source itself. It is named now. */}
          <span className="gateway-confidence">
            مطابقة للسؤال {Math.round(evidence.confidenceScore * 100)}%
          </span>
        </div>
        <button className="gateway-close" onClick={onClose} aria-label="إغلاق بوابة الدليل">✕</button>
      </div>

      <div className="gateway-content custom-scroll">
        <div className="gateway-section">
          <div className="gateway-section-label">حجّية المصدر</div>
          <p className="gateway-authority-text">{authorityLabelAr(authority)}</p>
          <p className="gateway-relevance-text">{relevanceLabelAr(relevanceOf(evidence))}</p>
          {note && <p className="gateway-interpretation-text">{note}</p>}
        </div>

        <div className="gateway-section">
          <div className="gateway-section-label">النص المستخلص</div>
          <blockquote className="gateway-full-text">
            {evidence.extractedText}
          </blockquote>
        </div>

        {evidence.contextWindow && (
          <div className="gateway-section">
            <div className="gateway-section-label">السياق الأصلي</div>
            <p className="gateway-context-text">{evidence.contextWindow}</p>
          </div>
        )}

        <div className="gateway-section">
          <div className="gateway-section-label">إجراءات التحقيق</div>
          <div className="gateway-actions-grid">
            {/* The chamber exists so that someone arguing a case can leave
                holding something usable. Nothing used to leave it. */}
            <button className="gateway-action gateway-action-primary" onClick={take}>
              {taken === 'done'
                ? '✓ نُسخ الدليل بحجّيته — خذه حيث شئت'
                : taken === 'failed'
                  ? '⚠ تعذّر النسخ — حدّد النص وانسخه'
                  : '⎘ خذ الدليل معك'}
            </button>
            <button
              className="gateway-action"
              onClick={() => onNewInvestigation(evidence.contextWindow || evidence.extractedText)}
            >
              ✦ تحقيق جديد من هذا الدليل
            </button>
            <button
              className="gateway-action"
              onClick={() => onSaveToVault(evidence)}
            >
              ⚑ حفظ في الخزانة السيادية
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
