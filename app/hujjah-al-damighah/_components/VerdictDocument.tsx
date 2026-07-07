'use client';

import React from 'react';
import type { InvestigationDTO } from '../actions';
import type { DomainId, OutputFormat } from '../_lib/evidence-utils';
import {
  bucketEvidence,
  resolveKnowledgeLayer,
  verdictText,
  generateVerdictExplanation,
  generateUnknownRemains,
  generateNextInvestigation,
} from '../_lib/evidence-utils';

interface Props {
  dto:            InvestigationDTO;
  query:          string;
  domain:         DomainId;
  outputFormat:   OutputFormat;
  onFormatChange: (f: OutputFormat) => void;
}

function VField({
  label, value, large, mono, italic, conflict,
}: {
  label:    string;
  value:    string;
  large?:   boolean;
  mono?:    boolean;
  italic?:  boolean;
  conflict?: boolean;
}) {
  return (
    <div className="vd-field">
      <span className="vd-label">{label}</span>
      <span className={[
        'vd-value',
        large    ? 'vdv-large'    : '',
        mono     ? 'vdv-mono'     : '',
        italic   ? 'vdv-italic'   : '',
        conflict ? 'vdv-conflict' : '',
      ].filter(Boolean).join(' ')}>
        {value}
      </span>
    </div>
  );
}

export function VerdictDocument({ dto, query, domain, outputFormat, onFormatChange }: Props) {
  const vText       = verdictText(dto, outputFormat, query, domain);
  const buckets     = bucketEvidence(dto);
  const pct         = Math.round(dto.averageEvidenceScore * 100);
  const explanation = generateVerdictExplanation(dto, domain);
  const unknowns    = generateUnknownRemains(dto, query);
  const nextInv     = generateNextInvestigation(query, buckets);
  const sessionDate = new Date().toLocaleDateString('ar-SA', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const supportingLayers = Array.from(new Set(
    [...buckets.supported, ...buckets.narratives]
      .map(e => resolveKnowledgeLayer(e.confidenceScore, e.confidenceLevel, domain).labelAr),
  ));
  const conflictingLayers = Array.from(new Set(
    buckets.disputed
      .map(e => resolveKnowledgeLayer(e.confidenceScore, e.confidenceLevel, domain).labelAr),
  ));

  return (
    <div className="verdict-document living-frame-verdict">
      <div className="vd-header">
        <span className="vd-glyph" aria-hidden="true">⚖</span>
        <span className="vd-title">وثيقة الحكم الإمبراطورية</span>
        <span className="vd-glyph" aria-hidden="true">⚖</span>
      </div>

      <div className="vd-format-row" role="group" aria-label="حجم الحكم">
        {(['short', 'medium', 'long'] as OutputFormat[]).map(fmt => (
          <button
            key={fmt}
            className={`vd-fmt-btn ${outputFormat === fmt ? 'vfmt-active' : ''}`}
            onClick={() => onFormatChange(fmt)}
          >
            {fmt === 'short' ? 'موجز' : fmt === 'medium' ? 'مفصَّل' : 'كامل'}
          </button>
        ))}
      </div>

      <div className="vd-fields">
        <VField label="القضية"          value={query}    />
        <VField label="الحكم"           value={vText}    large />
        <div className="vd-row-pair">
          <VField label="درجة الثقة"  value={`${pct}%`}            mono />
          <VField label="عدد الأدلة"  value={`${dto.evidence.length}`} mono />
        </div>
        {supportingLayers.length > 0 && (
          <VField label="طبقات داعمة"     value={supportingLayers.join(' · ')}  />
        )}
        {conflictingLayers.length > 0 && (
          <VField label="طبقات متعارضة"   value={conflictingLayers.join(' · ')} conflict />
        )}
        <VField
          label="عناصر مجهولة"
          value={buckets.unverified.length > 0
            ? `${buckets.unverified.length} عنصر غير محدد`
            : 'لا توجد'}
        />
        <VField label="سبب الحكم"               value={explanation} large />
        <VField label="ما يزال مجهولاً"          value={unknowns}   italic />
        <VField label="التحقيق المقترح التالي"   value={nextInv}    italic />
      </div>

      <div className="vd-footer">
        <span>جلسة: {sessionDate}</span>
        <span>المحكمة الإمبراطورية للمعرفة</span>
      </div>
    </div>
  );
}
