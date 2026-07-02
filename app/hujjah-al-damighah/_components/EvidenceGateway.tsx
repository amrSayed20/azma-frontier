'use client';

import React from 'react';
import type { EvidenceItemDTO } from '../actions';
import type { DomainId } from '../_lib/evidence-utils';
import { resolveKnowledgeLayer } from '../_lib/evidence-utils';

interface Props {
  evidence:           EvidenceItemDTO | null;
  domain:             DomainId;
  open:               boolean;
  onClose:            () => void;
  onNewInvestigation: (query: string) => void;
  onSaveToVault:      (ev: EvidenceItemDTO) => void;
}

function StubAction({ label }: { label: string }) {
  return (
    <button className="gateway-action-stub" disabled aria-label={label}>
      {label}
      <span className="coming-soon">قريباً</span>
    </button>
  );
}

export function EvidenceGateway({ evidence, domain, open, onClose, onNewInvestigation, onSaveToVault }: Props) {
  if (!evidence) return null;
  const layer = resolveKnowledgeLayer(evidence.confidenceScore, evidence.confidenceLevel, domain);

  return (
    <div className={`evidence-gateway ${open ? 'gateway-open' : ''}`} role="complementary" aria-label="بوابة الدليل">
      <div className="gateway-header">
        <div className="gateway-meta">
          <span className={`gateway-tier tier-${layer.tier}`}>{layer.labelAr}</span>
          <span className="gateway-confidence">
            {Math.round(evidence.confidenceScore * 100)}%
          </span>
        </div>
        <button className="gateway-close" onClick={onClose} aria-label="إغلاق بوابة الدليل">✕</button>
      </div>

      <div className="gateway-content custom-scroll">
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
            <button
              className="gateway-action gateway-action-primary"
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
            <StubAction label="الوثيقة الأصلية"    />
            <StubAction label="صور تاريخية"         />
            <StubAction label="أدلة داعمة"           />
            <StubAction label="أدلة معارضة"          />
            <StubAction label="توليد ملخص"           />
            <StubAction label="مقارنة مع دليل"       />
            <StubAction label="تصدير"                />
          </div>
        </div>
      </div>
    </div>
  );
}
