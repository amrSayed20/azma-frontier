'use client';

import React from 'react';
import type { InvestigationDTO } from '../actions';
import type { DomainId, OutputFormat } from '../_lib/evidence-utils';
import {
  bucketEvidence,
  resolveKnowledgeLayer,
  verdictText,
  shapeAnswer,
  generateVerdictExplanation,
  generateUnknownRemains,
  generateNextInvestigation,
  scriptureEvidence,
  topAuthority,
  relevanceOf,
  authorityLabelAr,
  relevanceLabelAr,
  interpretationNoteAr,
  SourceAuthority,
} from '../_lib/evidence-utils';
import { buildLadder } from '../_lib/evidence-ladder';

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
  // The shaper governs what is actually read: the composed answer.
  const shownAnswer = dto.synthesizedAnswer ? shapeAnswer(dto.synthesizedAnswer, outputFormat) : null;
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
      .map(e => resolveKnowledgeLayer(e, domain).labelAr),
  ));
  const conflictingLayers = Array.from(new Set(
    buckets.disputed
      .map(e => resolveKnowledgeLayer(e, domain).labelAr),
  ));

  // The four things the single «درجة الثقة» figure used to speak for. They are
  // shown as four lines because they are four different claims: what the source
  // is, whether its text was really retrieved, how closely it bears on this
  // question, and what the chamber says it means — which, for scripture, is
  // nothing at all.
  const authority = topAuthority(dto);
  const ladder = buildLadder(dto, domain);
  const scripture = scriptureEvidence(dto);
  const interpretationNote = interpretationNoteAr(authority);

  return (
    <div className="verdict-document living-frame-verdict">
      <div className="vd-header">
        <span className="vd-glyph" aria-hidden="true">✦</span>
        <span className="vd-title">ملخص نتائج البحث</span>
        <span className="vd-glyph" aria-hidden="true">✦</span>
      </div>

      {/* MEASURED live 2026-09-24: these three buttons existed, rendered, and
          were 1021px wide on the Founder's screen — and the Founder asked for
          an output-shaping control, because three bare words with no heading
          do not announce what they are. The capability was never hidden; it
          was unnamed. It says what it does now, and what it will not do. */}
      <div className="vd-format-shaper">
        <span className="vd-format-label">صياغة المخرجات</span>
        <span className="vd-format-note">الأدلّة نفسها — عرضٌ آخر، بلا إعادة تحقيق</span>
      </div>
      <div className="vd-format-row" role="group" aria-label="صياغة المخرجات">
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
        <VField label="الموضوع"         value={query}    />
        {shownAnswer && (
          <VField label="الإجابة"         value={shownAnswer} large />
        )}
        {/* At full length the Creator also gets the measurement behind the
            answer — how many layers were examined, and how well they matched. */}
        {shownAnswer && outputFormat === 'long' && (
          <VField label="خلف الإجابة"     value={vText} />
        )}
        {!dto.synthesizedAnswer && (
          <VField label="الملخص"          value={vText}    large />
        )}
        {dto.evidence.length > 0 && (
          <VField label="حجّية أعلى مصدر" value={authorityLabelAr(authority)} />
        )}

        {/* The ladder. Ten passages in a flat list made a Creator work out
            item by item what kind of thing each one was; ranked by kind, the
            shape of the answer is visible before anything is opened. A rung
            reports what a named scholar said — it never forms an opinion. */}
        {ladder.length > 0 && (
          <div className="vd-ladder">
            <span className="vd-label">أنواع الأدلة في موضوعك</span>
            {ladder.map((rung) => (
              <div key={rung.id} className={`vd-rung vd-rung-${rung.id}`}>
                <div className="vd-rung-head">
                  <span className="vd-rung-title">{rung.titleAr}</span>
                  <span className="vd-rung-count">{rung.items.length}</span>
                </div>
                <p className="vd-rung-meaning">{rung.meaningAr}</p>
              </div>
            ))}
          </div>
        )}

        {/* Evidence is never dropped in silence. */}
        {dto.setAsideNoticeAr && (
          <VField label="ما نُحّي" value={dto.setAsideNoticeAr} italic />
        )}
        <div className="vd-row-pair">
          {/* This figure has only ever measured how closely the retrieved texts
              match the wording of the question. It is named for what it
              measures now, so that a low number can no longer be read as a
              verdict on a source's standing. */}
          <VField label="مطابقة الأدلة للسؤال" value={`${pct}%`}            mono />
          <VField label="عدد الأدلة"           value={`${dto.evidence.length}`} mono />
        </div>
        {scripture.length > 0 && (
          <VField
            label="صلة النص القرآني بالسؤال"
            value={`${relevanceLabelAr(relevanceOf(scripture[0]!))} — والحجّية قطعية لا تتغير بصياغة السؤال.`}
          />
        )}
        {interpretationNote && authority === SourceAuthority.SCRIPTURE && (
          <VField label="التفسير" value={interpretationNote} italic />
        )}
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
        <VField label="تفسير النتائج"            value={explanation} large />
        <VField label="ما يزال مجهولاً"          value={unknowns}   italic />
        <VField label="التحقيق المقترح التالي"   value={nextInv}    italic />
      </div>

      <div className="vd-footer">
        <span>بحث: {sessionDate}</span>
        <span>حجرة المعرفة السيادية</span>
      </div>
    </div>
  );
}
