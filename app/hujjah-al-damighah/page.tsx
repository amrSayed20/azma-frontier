/**
 * AZMA OS – Hujjah Al-Damighah
 * The Imperial Court of Knowledge.
 * Resurrection of the Soul — AZMA Tongue Constitutional Decree.
 */

'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import './hujjah-al-damighah.css';
import { runInvestigation, type InvestigationDTO, type EvidenceItemDTO } from './actions';
import { LivingCompanion } from '@/src/components/living-companion/LivingCompanion';
import { EvidenceGateway }   from './_components/EvidenceGateway';
import { VerdictDocument }   from './_components/VerdictDocument';
import { InvestigationFile } from './_components/InvestigationFile';
import {
  KNOWLEDGE_DOMAINS,
  type DomainId,
  type OutputFormat,
  type KnowledgeTier,
  resolveKnowledgeLayer,
  bucketEvidence,
  getConstitutionalTier,
} from './_lib/evidence-utils';
import {
  readMemory,
  commitSession,
  signalFocusMode,
  getPreferredFormat,
  getPreferredDomain,
  isQuietMode,
  getReturnGreeting,
  getAdaptiveProbing,
  getContinuationContext,
  getDynamicDelay,
  getRelationshipCallback,
  shouldExpressCuriosity,
  recordHesitation,
  recordQuickSubmit,
  recordExploration,
  getRhythmProfile,
  getIdleDelay,
  type CitizenMemory,
} from './_lib/citizen-memory';

// ══════════════════════════════════════════════════════════════════
//  AZMA TONGUE — Constitutional Communication System
// ══════════════════════════════════════════════════════════════════

type AzmaTongue    = 'conversation' | 'writing' | 'silent';
type ChamberInit   = 'awakening' | 'tongue-sel' | 'active';
type Phase         = 'idle' | 'examining' | 'hearing' | 'stillness' | 'revealing' | 'complete';
type Mood          = 'arrival' | 'listening' | 'investigation' | 'gathering' | 'reasoning' | 'deliberation' | 'silence' | 'verdict' | 'reflection';
type InvStage      = 'idle' | 'receiving' | 'collecting' | 'classifying' | 'deliberating';
type CitizenStance = 'support' | 'object' | 'more-evidence' | 'suspend' | null;

const TONGUE_DEFS: { id: AzmaTongue; glyph: string; nameAr: string; descAr: string }[] = [
  { id: 'conversation', glyph: '◎', nameAr: 'محادثة',   descAr: 'الحجرة تتحدث معك — حوار طبيعي بلا أوامر' },
  { id: 'writing',      glyph: '⬡', nameAr: 'كتابة',     descAr: 'الحجرة تفكر معك — لوح تفكير تعاوني'       },
  { id: 'silent',       glyph: '◇', nameAr: 'سكوت',      descAr: 'الحجرة تراقبك — تفاعل بصري بلا كلام'     },
];

const CHAMBER_INITIATIONS: Record<AzmaTongue, string[]> = {
  conversation: [
    'المحكمة مستعدة. ما الفكرة التي تريد اختبارها؟',
    'الحجرة المعرفية تستيقظ. ما الذي يشغل ذهنك؟',
    'ادخل إلى المحكمة. دعنا نبدأ من البداية.',
  ],
  writing: [
    'الورقة أمامك. الحجرة ستقرأ أفكارك وتبني معك.',
    'اكتب ما تعتقده. سنبني الأدلة معاً من هناك.',
    'ابدأ بالكتابة. الحجرة تراقب وتستعد للاستقصاء.',
  ],
  silent: [
    'اختر مجال معرفتك. الحجرة تنتظر.',
    'الحجرة صامتة وجاهزة. ما المجال الذي تريد استقصاءه؟',
  ],
};

const PROBING_QS = [
  'ما الذي يجعلك غير متأكد من هذا تحديداً؟',
  'هل تريد أن نفحص الأدلة المعارضة أيضاً؟',
  'هل ثمة جانب لم تذكره بعد في هذه القضية؟',
  'هل تريد أن نتعمق أكثر في هذه المسألة؟',
  'ما الذي تريد إثباته بالتحديد الآن؟',
  'هل تريد مقارنة هذا مع موقف فكري مختلف؟',
];

// ── Silent Mode Concept System ────────────────────────────────────
const SILENT_CONCEPTS: Record<DomainId, string[]> = {
  religious:  ['السببية', 'الوجود', 'التوحيد', 'القدر',     'النبوة',          'الوحي'      ],
  medical:    ['التشخيص', 'العلاج', 'الوراثة', 'الخلية',    'الجهاز المناعي',  'الأمراض'    ],
  scientific: ['الطاقة',  'المادة', 'الزمن',   'الجاذبية',  'الكم',            'الكون'      ],
  history:    ['الحضارة', 'السلطة', 'التحولات','الثقافة',    'الصراع',          'التراث'     ],
  culture:    ['الفكر',   'الأدب',  'الفلسفة', 'الهوية',    'الفن',            'القيم'      ],
};

function assembleSilentQuery(domain: DomainId, concepts: string[]): string {
  const domDef  = KNOWLEDGE_DOMAINS.find((d) => d.id === domain);
  const domName = domDef?.fullAr ?? domain;
  if (concepts.length === 0) return '';
  if (concepts.length === 1) return `ما ${concepts[0]} في المنظور ${domName}؟`;
  if (concepts.length === 2) return `ما العلاقة بين ${concepts[0]} و${concepts[1]} في سياق ${domName}؟`;
  return `كيف يتفاعل ${concepts[0]} مع ${concepts[1]} و${concepts[2]} في المنظور ${domName}؟`;
}

// ── Chamber Voice — alive, not assistant ───────────────────────────
const COMPANION_MSGS: Record<string, string> = {
  receiving:    'الحجرة تستمع…',
  collecting:   'الأدلة تتكشّف…',
  classifying:  'الحجرة تزن…',
  deliberating: 'الحجرة تفكر معك…',
  silence:      'لحظة صمت.',
  complete:     'التحقيق اكتمل.',
  departure:    'تفكيرك الآن مختلف. هذا هو المقصود.',
  gatewayOpen:  'بوابة الدليل مفتوحة.',
  vaultSaved:   'محفوظ في الخزانة.',
};

// ── Chamber Curiosity — meaningful broadening questions ────────────
const CHAMBER_CURIOSITIES = [
  'ماذا لو كان العكس صحيحاً تماماً؟',
  'ما الدليل الذي سيقنعك بتغيير موقفك؟',
  'ما الذي نحن نتجاهله في هذه المسألة؟',
  'هل التفسير الأبسط هو الأصح هنا؟',
  'ما الذي لم تسألني عنه بعد؟',
  'أين الحد بين اليقين والظن في هذه القضية؟',
  'هل يمكن أن تكون الإجابة مختلفة في سياق آخر؟',
];

// ── Court Questions — Article IV ──────────────────────────────────
function selectCourtQuestions(dto: InvestigationDTO): string[] {
  const b = dto.success ? bucketEvidence(dto) : null;
  const qs: string[] = [];
  if (b && b.disputed.length > 0)   qs.push('ما الذي لا يزال محل خلاف بين المصادر؟');
  qs.push('ما الدليل الذي سيغيّر هذا الحكم؟');
  if (b && b.unverified.length > 0) qs.push('ما الافتراضات التي تستند إليها في هذه القضية؟');
  return qs.slice(0, 2);
}

// ── Utilities ──────────────────────────────────────────────────────
const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

function getStoredTongue(): AzmaTongue | null {
  if (typeof window === 'undefined') return null;
  const s = localStorage.getItem('azma.tongue.style');
  if (s === 'conversation' || s === 'writing' || s === 'silent') return s;
  return null;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] ?? arr[0]!;
}

// ── Evidence Grouping — visual thinking ──────────────────────────
type EvidenceGrouping = 'conviction' | 'examining' | 'doubt';

interface ThinkingCanvasProps {
  evidence:        EvidenceItemDTO[];
  evidenceGroups:  Record<string, EvidenceGrouping>;
  onGroupEvidence: (id: string, group: EvidenceGrouping) => void;
}

function ThinkingCanvas({ evidence, evidenceGroups, onGroupEvidence }: ThinkingCanvasProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  if (evidence.length < 2) return null;

  const ungrouped    = evidence.filter((ev) => !evidenceGroups[ev.id]);
  const inConviction = evidence.filter((ev) => evidenceGroups[ev.id] === 'conviction');
  const inExamining  = evidence.filter((ev) => evidenceGroups[ev.id] === 'examining');
  const inDoubt      = evidence.filter((ev) => evidenceGroups[ev.id] === 'doubt');

  const ZONES: [EvidenceGrouping, string, typeof inConviction][] = [
    ['conviction', 'يقين',      inConviction],
    ['examining',  'قيد الفحص', inExamining],
    ['doubt',      'شك',         inDoubt],
  ];

  return (
    <div className="thinking-canvas">
      <div className="tc-header">
        <span className="tc-glyph" aria-hidden="true">◈</span>
        <span className="tc-title">صنّف الأدلة — فكّر بالحركة</span>
      </div>
      {ungrouped.length > 0 && (
        <div className="tc-pool">
          {ungrouped.map((ev) => (
            <div
              key={ev.id}
              className="tc-ev-chip"
              draggable
              onDragStart={() => setDraggedId(ev.id)}
              aria-label={ev.extractedText.slice(0, 30)}
              role="listitem"
            >
              {ev.extractedText.slice(0, 34)}…
            </div>
          ))}
        </div>
      )}
      <div className="tc-zones">
        {ZONES.map(([zone, label, items]) => (
          <div
            key={zone}
            className={`tc-zone tcz-${zone}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedId) { onGroupEvidence(draggedId, zone); setDraggedId(null); }
            }}
          >
            <span className="tcz-label">{label}</span>
            {items.map((ev) => (
              <div key={ev.id} className="tc-chip">
                {ev.extractedText.slice(0, 28)}…
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Competing Positions — Article II ─────────────────────────────
interface CompetingPositionsProps {
  supported: EvidenceItemDTO[];
  disputed:  EvidenceItemDTO[];
  domain:    DomainId;
  onSelect:  (ev: EvidenceItemDTO) => void;
}

function CompetingPositions({ supported, disputed, domain, onSelect }: CompetingPositionsProps) {
  if (supported.length === 0 || disputed.length === 0) return null;
  const topS = supported.slice(0, 2);
  const topD = disputed.slice(0, 2);
  return (
    <div className="competing-positions">
      <div className="cp-header">
        <span className="cp-rule" aria-hidden="true" />
        <span className="cp-glyph" aria-hidden="true">⚖</span>
        <span className="cp-title">المواقف المتنافسة</span>
        <span className="cp-rule" aria-hidden="true" />
      </div>
      <div className="cp-layout">
        <div className="cp-side cp-supporting">
          <div className="cp-side-label">الموقف المؤيد</div>
          {topS.map((ev) => {
            const layer = resolveKnowledgeLayer(ev.confidenceScore, ev.confidenceLevel, domain);
            return (
              <button key={ev.id} className="cp-ev-btn cp-ev-support" onClick={() => onSelect(ev)}>
                <span className={`cp-tier tier-${layer.tier as KnowledgeTier}`}>{layer.labelAr}</span>
                <p className="cp-text">{ev.extractedText.slice(0, 90)}…</p>
              </button>
            );
          })}
        </div>
        <div className="cp-spine" aria-hidden="true">
          <div className="cp-spine-line" />
          <span className="cp-spine-glyph">◐</span>
          <div className="cp-spine-line" />
        </div>
        <div className="cp-side cp-opposing">
          <div className="cp-side-label">الموقف المعارض</div>
          {topD.map((ev) => {
            const layer = resolveKnowledgeLayer(ev.confidenceScore, ev.confidenceLevel, domain);
            return (
              <button key={ev.id} className="cp-ev-btn cp-ev-oppose" onClick={() => onSelect(ev)}>
                <span className={`cp-tier tier-${layer.tier as KnowledgeTier}`}>{layer.labelAr}</span>
                <p className="cp-text">{ev.extractedText.slice(0, 90)}…</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Hearing Block — Article I–VI ─────────────────────────────────
const CITIZEN_STANCES: { id: CitizenStance; ar: string; hint: string }[] = [
  { id: 'support',       ar: 'أؤيد',         hint: 'الأدلة تقنعني'      },
  { id: 'object',        ar: 'أعترض',         hint: 'ثمة ما يقلقني'      },
  { id: 'more-evidence', ar: 'أريد المزيد',   hint: 'الأدلة غير كافية'   },
  { id: 'suspend',       ar: 'أوقف الحكم',    hint: 'المسألة معقدة'       },
];

interface HearingBlockProps {
  result:             InvestigationDTO;
  domain:             DomainId;
  citizenStance:      CitizenStance;
  onStance:           (s: CitizenStance) => void;
  onProceed:          () => void;
  courtQuestions:     string[];
  showCourtQuestions: boolean;
  onEvidenceSelect:   (ev: EvidenceItemDTO) => void;
}

function HearingBlock({
  result, domain, citizenStance, onStance, onProceed,
  courtQuestions, showCourtQuestions, onEvidenceSelect,
}: HearingBlockProps) {
  if (!result.success) return null;
  const b    = bucketEvidence(result);
  const topS = b.supported.slice(0, 2);
  const topD = b.disputed.slice(0, 2);
  return (
    <div className="hearing-block">
      <div className="hearing-header">
        <span className="hearing-rule" aria-hidden="true" />
        <span className="hearing-glyph" aria-hidden="true">⚖</span>
        <span className="hearing-title">جلسة الاستماع — المحكمة الإمبراطورية</span>
        <span className="hearing-rule" aria-hidden="true" />
      </div>

      <div className="hearing-layout">
        <div className="hearing-side hearing-prosecution">
          <div className="hearing-side-label">
            <span className="hsl-mark">●</span> الاتهام — أقوى الأدلة
          </div>
          {topS.length > 0 ? topS.map((ev) => {
            const layer = resolveKnowledgeLayer(ev.confidenceScore, ev.confidenceLevel, domain);
            return (
              <button key={ev.id} className="hearing-ev-btn hev-support" onClick={() => onEvidenceSelect(ev)}>
                <span className="hev-tier">{layer.labelAr}</span>
                <p className="hev-text">{ev.extractedText.slice(0, 100)}…</p>
              </button>
            );
          }) : (
            <p className="hearing-empty">لا توجد أدلة قاطعة</p>
          )}
        </div>
        <div className="hearing-spine" aria-hidden="true">
          <div className="hearing-spine-line" />
          <span className="hearing-spine-glyph">◐</span>
          <div className="hearing-spine-line" />
        </div>
        <div className="hearing-side hearing-defense">
          <div className="hearing-side-label">
            <span className="hsl-mark">◑</span> الدفاع — أقوى الاعتراضات
          </div>
          {topD.length > 0 ? topD.map((ev) => {
            const layer = resolveKnowledgeLayer(ev.confidenceScore, ev.confidenceLevel, domain);
            return (
              <button key={ev.id} className="hearing-ev-btn hev-oppose" onClick={() => onEvidenceSelect(ev)}>
                <span className="hev-tier">{layer.labelAr}</span>
                <p className="hev-text">{ev.extractedText.slice(0, 100)}…</p>
              </button>
            );
          }) : (
            <p className="hearing-empty">لا يوجد اعتراض جوهري</p>
          )}
        </div>
      </div>

      {showCourtQuestions && courtQuestions.length > 0 && (
        <div className="court-questions" aria-live="polite">
          <div className="cq-header">
            <span className="cq-glyph" aria-hidden="true">◈</span>
            <span className="cq-title">أسئلة المحكمة قبل الحكم</span>
          </div>
          <ul className="cq-list">
            {courtQuestions.map((q, i) => (
              <li key={i} className="cq-item" style={{ animationDelay: `${i * 300}ms` }}>{q}</li>
            ))}
          </ul>
        </div>
      )}

      {!citizenStance && (
        <div className="citizen-stance">
          <div className="cs-prompt">موقفك قبل إصدار الحكم</div>
          <div className="cs-actions">
            {CITIZEN_STANCES.map(({ id, ar, hint }) => (
              <button key={String(id)} className={`cs-btn cs-${String(id)}`} onClick={() => onStance(id)}>
                <span className="cs-ar">{ar}</span>
                <span className="cs-hint">{hint}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {citizenStance && (
        <div className="stance-acknowledged" aria-live="polite">
          <span className="sa-mark">◎</span>
          <span className="sa-text">موقفك موثَّق. المحكمة تأخذه في الاعتبار.</span>
        </div>
      )}

      <div className="hearing-footer">
        <button className="hearing-proceed-btn" onClick={onProceed}>
          <span className="hpb-glyph" aria-hidden="true">⚖</span>
          {citizenStance ? 'إصدار الحكم' : 'المضي للحكم'}
        </button>
      </div>
    </div>
  );
}

// ── Minority View — Article VII ───────────────────────────────────
interface MinorityViewProps {
  disputed: EvidenceItemDTO[];
  domain:   DomainId;
  onSelect: (ev: EvidenceItemDTO) => void;
}

function MinorityView({ disputed, domain, onSelect }: MinorityViewProps) {
  if (disputed.length === 0) return null;
  const top   = disputed[0]!;
  const layer = resolveKnowledgeLayer(top.confidenceScore, top.confidenceLevel, domain);
  return (
    <div className="minority-view">
      <div className="mv-header">
        <span className="mv-glyph" aria-hidden="true">◑</span>
        <span className="mv-title">الموقف الأقل شيوعاً — يستحق الاحترام</span>
      </div>
      <button className="mv-ev-btn" onClick={() => onSelect(top)}>
        <span className={`mv-tier ctier-${getConstitutionalTier(layer.tier)}`}>{layer.labelAr}</span>
        <p className="mv-text">{top.extractedText.slice(0, 120)}…</p>
      </button>
      <p className="mv-note">الحجرة لا تخفي الاعتراض الجوهري. اليقين لا يعني غياب الخلاف.</p>
    </div>
  );
}

// ── Evidence Category ─────────────────────────────────────────────
interface EvCatProps {
  titleAr:  string;
  type:     'supported' | 'narratives' | 'disputed' | 'unverified';
  items:    EvidenceItemDTO[];
  domain:   DomainId;
  onSelect: (ev: EvidenceItemDTO) => void;
}

function EvidenceCategory({ titleAr, type, items, domain, onSelect }: EvCatProps) {
  if (items.length === 0) return null;
  const marks: Record<string, string> = {
    supported: '●', narratives: '◐', disputed: '◑', unverified: '○',
  };
  return (
    <div className={`evidence-category category-${type}${items.length >= 3 ? ' cat-rich' : ''}`}>
      <div className="category-header">
        <span className="category-mark">{marks[type]}</span>
        <span className="category-title">{titleAr}</span>
        <span className="category-count">({items.length})</span>
      </div>
      <div className="category-items">
        {items.map((ev, idx) => {
          const layer = resolveKnowledgeLayer(ev.confidenceScore, ev.confidenceLevel, domain);
          return (
            <button
              key={ev.id}
              className={`evidence-entry evidence-entry-btn ctier-entry-${getConstitutionalTier(layer.tier)}`}
              style={{ animationDelay: `${idx * 150}ms` }}
              onClick={() => onSelect(ev)}
              aria-label={`افتح بوابة الدليل: ${layer.labelAr}`}
            >
              <span className={`entry-tier tier-${layer.tier as KnowledgeTier} ctier-${getConstitutionalTier(layer.tier)}`}>{layer.labelAr}</span>
              <p className="entry-text">&ldquo;{ev.extractedText}&rdquo;</p>
              <span className="entry-score">{Math.round(ev.confidenceScore * 100)}%</span>
              <span className="entry-gateway-hint" aria-hidden="true">← بوابة</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Verdict Block — module-level component ───────────────────────
interface VerdictBlockProps {
  hasVerdict:        boolean;
  result:            InvestigationDTO | null;
  query:             string;
  activeDomain:      DomainId;
  outputFormat:      OutputFormat;
  onFormatChange:    (f: OutputFormat) => void;
  showProbing:       boolean;
  phase:             Phase;
  probingQuestion:   string;
  showCuriosity:     boolean;
  curiosityQuestion: string;
  citizenStance:     CitizenStance;
  evidenceGroups:    Record<string, EvidenceGrouping>;
  onGroupEvidence:   (id: string, group: EvidenceGrouping) => void;
  onEvidenceSelect:  (ev: EvidenceItemDTO) => void;
  onContinue:        () => void;
  onExpand:          () => void;
  onChallenge:       () => void;
  onAppeal:          () => void;
  onTransferQiyamah: () => void;
  onSaveVault:       () => void;
  savedToVault:      boolean;
}

function VerdictBlock({
  hasVerdict, result, query, activeDomain, outputFormat, onFormatChange,
  showProbing, phase, probingQuestion, showCuriosity, curiosityQuestion,
  citizenStance,
  evidenceGroups, onGroupEvidence,
  onEvidenceSelect, onContinue, onExpand, onChallenge, onAppeal, onTransferQiyamah, onSaveVault, savedToVault,
}: VerdictBlockProps) {
  if (!hasVerdict || !result) return null;
  const b = result.success ? bucketEvidence(result) : null;
  const isUncertain = result.success && result.averageEvidenceScore < 0.42;
  const evCount = result.success ? Math.min(result.evidence.length, 6) : 0;
  return (
    <div className={`verdict-sanctum ev-count-${evCount}`}>
      {!result.success && (
        <div className="verdict-error" role="alert">
          <p>{result.error ?? 'تعذّر الاتصال بالمستودعات المعرفية.'}</p>
        </div>
      )}
      {isUncertain && (
        <div className="verdict-uncertainty" role="status">
          <span className="vu-sigil" aria-hidden="true">◌</span>
          <p className="vu-text">الأدلة الحالية لا تكفي لحكم قاطع — هذه المسألة لا تزال قيد الفحص</p>
        </div>
      )}
      {result.success && b && (
        <>
          <VerdictDocument
            dto={result}
            query={query}
            domain={activeDomain}
            outputFormat={outputFormat}
            onFormatChange={onFormatChange}
          />
          <CompetingPositions
            supported={b.supported}
            disputed={b.disputed}
            domain={activeDomain}
            onSelect={onEvidenceSelect}
          />
          <MinorityView
            disputed={b.disputed}
            domain={activeDomain}
            onSelect={onEvidenceSelect}
          />
          {citizenStance === 'suspend' && (
            <div className="verdict-uncertainty" role="status">
              <span className="vu-sigil" aria-hidden="true">◌</span>
              <p className="vu-text">الحكم موقوف بناءً على طلبك — الأسئلة تبقى مفتوحة</p>
            </div>
          )}
          {result.evidence.length > 0 && (
            <div className="evidence-taxonomy">
              <div className="taxonomy-header">
                <span className="taxonomy-rule" />
                <span className="taxonomy-title">السجل المصنَّف — انقر لفتح بوابة الدليل</span>
                <span className="taxonomy-rule" />
              </div>
              <EvidenceCategory titleAr="الأدلة المؤيدة"             type="supported"  items={b.supported}  domain={activeDomain} onSelect={onEvidenceSelect} />
              <EvidenceCategory titleAr="الروايات الداعمة"           type="narratives" items={b.narratives} domain={activeDomain} onSelect={onEvidenceSelect} />
              <EvidenceCategory titleAr="الادعاءات المتنازع عليها"  type="disputed"   items={b.disputed}   domain={activeDomain} onSelect={onEvidenceSelect} />
              <EvidenceCategory titleAr="البيانات غير المتحقق منها" type="unverified" items={b.unverified} domain={activeDomain} onSelect={onEvidenceSelect} />
              {b.supported.length === 0 && (
                <div className="open-questions">
                  <span className="oq-mark">?</span>
                  <span className="oq-text">أسئلة مفتوحة — لم تُوجد أدلة قاطعة. القضية تحتاج إلى دراسة إضافية.</span>
                </div>
              )}
            </div>
          )}
          {phase === 'complete' && result.evidence.length >= 2 && (
            <ThinkingCanvas
              evidence={result.evidence}
              evidenceGroups={evidenceGroups}
              onGroupEvidence={onGroupEvidence}
            />
          )}
          {showProbing && phase === 'complete' && (
            <div className="chamber-probing" aria-live="polite">
              <span className="probing-sigil" aria-hidden="true">◈</span>
              <p className="probing-question">{probingQuestion}</p>
            </div>
          )}
          {showCuriosity && phase === 'complete' && (
            <div className="chamber-curiosity" aria-live="polite">
              <span className="curiosity-sigil" aria-hidden="true">◎</span>
              <p className="curiosity-question">{curiosityQuestion}</p>
            </div>
          )}
          <InvestigationFile
            onContinue={onContinue}
            onExpand={onExpand}
            onChallenge={onChallenge}
            onAppeal={onAppeal}
            onTransferQiyamah={onTransferQiyamah}
            onSaveVault={onSaveVault}
            savedToVault={savedToVault}
          />
        </>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════

export default function HujjahAlDamighah() {
  const router = useRouter();

  // ── Chamber Init ─────────────────────────────────────────────────
  const [chamberInit, setChamberInit] = useState<ChamberInit>('awakening');
  const [tongue, setTongue]           = useState<AzmaTongue | null>(() => getStoredTongue());

  // ── Citizen Memory ────────────────────────────────────────────────
  const [citizenMemory, setCitizenMemory] = useState<CitizenMemory>(() => readMemory());

  // ── Investigation State ──────────────────────────────────────────
  const [phase, setPhase]             = useState<Phase>('idle');
  const [invStage, setInvStage]       = useState<InvStage>('idle');
  const [query, setQuery]             = useState('');
  const [activeDomain, setActiveDomain] = useState<DomainId>(
    () => getPreferredDomain(readMemory()) ?? 'religious',
  );
  const [outputFormat, setOutputFormat] = useState<OutputFormat>(
    () => getPreferredFormat(readMemory()) ?? 'short',
  );
  const [result, setResult]           = useState<InvestigationDTO | null>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [isExiting, setIsExiting]     = useState(false);

  // ── Continuation Banner ───────────────────────────────────────────
  const [showContinuation, setShowContinuation] = useState(
    () => getContinuationContext(readMemory()).show,
  );

  // ── Session-level behavior tracking (refs to avoid re-renders) ───
  const sessionExpandedRef      = useRef(false);
  const sessionVaultedRef       = useRef(false);

  // ── Rhythm observation refs ────────────────────────────────────────
  const queryLengthRef          = useRef(0);
  const queryStartTimeRef       = useRef<number | null>(null);
  const sessionDomainChangesRef = useRef(0);

  // ── Adaptive idle timer delay ──────────────────────────────────────
  const idleDelayRef = useRef<number>(30_000);
  useEffect(() => {
    idleDelayRef.current = getIdleDelay(citizenMemory);
  }, [citizenMemory]);

  // ── Hearing / Deliberation ────────────────────────────────────────
  const [citizenStance, setCitizenStance]       = useState<CitizenStance>(null);
  const [courtQuestionsState, setCourtQuestionsState] = useState<string[]>([]);
  const [showCourtQuestions, setShowCourtQuestions]   = useState(false);
  const hearingTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Proximity tracking — Article I (no state, pure DOM) ───────────────
  const proximityRafRef = useRef<number>(0);
  const proximityPosRef = useRef({ x: 50, y: 50, tx: 50, ty: 50 });

  useEffect(() => {
    function onMove(e: MouseEvent) {
      proximityPosRef.current.tx = (e.clientX / window.innerWidth)  * 100;
      proximityPosRef.current.ty = (e.clientY / window.innerHeight) * 100;
    }
    function tick() {
      const p = proximityPosRef.current;
      p.x += (p.tx - p.x) * 0.018;
      p.y += (p.ty - p.y) * 0.018;
      const el = document.getElementById('court-prox-glow');
      if (el) { el.style.left = `${p.x.toFixed(2)}%`; el.style.top = `${p.y.toFixed(2)}%`; }
      proximityRafRef.current = requestAnimationFrame(tick);
    }
    window.addEventListener('mousemove', onMove, { passive: true });
    proximityRafRef.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(proximityRafRef.current);
    };
  }, []);

  // ── Evidence visual thinking ───────────────────────────────────────
  const [evidenceGroups, setEvidenceGroups] = useState<Record<string, EvidenceGrouping>>({});

  // ── Companion ─────────────────────────────────────────────────────
  const [companionText, setCompanionText]       = useState('');
  const [companionVisible, setCompanionVisible] = useState(false);
  const [textToSpeak, setTextToSpeak]           = useState('');

  // ── Evidence Gateway ─────────────────────────────────────────────
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItemDTO | null>(null);
  const [gatewayOpen, setGatewayOpen]           = useState(false);
  const [savedToVault, setSavedToVault]         = useState(false);

  // ── Chamber Voice ─────────────────────────────────────────────────
  const [probingQuestion, setProbingQuestion]   = useState('');
  const [showProbing, setShowProbing]           = useState(false);
  const [curiosityQuestion, setCuriosityQuestion] = useState('');
  const [showCuriosity, setShowCuriosity]       = useState(false);

  // ── Silent Mode ───────────────────────────────────────────────────
  const [silentDomain, setSilentDomain]     = useState<DomainId | null>(null);
  const [silentConcepts, setSilentConcepts] = useState<string[]>([]);

  // ── Writing Mode ──────────────────────────────────────────────────
  const [writingSuggestion, setWritingSuggestion] = useState('');
  const writingDebRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Refs ──────────────────────────────────────────────────────────
  const stageTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const idleTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseRef       = useRef<Phase>(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // ── Stable greeting per session per tongue — memory-aware ────────
  const chamberGreeting = useMemo(
    () => getReturnGreeting(citizenMemory, CHAMBER_INITIATIONS[tongue ?? 'conversation']),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tongue],
  );

  // ── Mood ──────────────────────────────────────────────────────────
  const mood: Mood = useMemo(() => {
    if (phase === 'idle' && !query) return 'arrival';
    if (phase === 'idle' && !!query) return 'listening';
    if (phase === 'examining') {
      if (invStage === 'receiving')   return 'investigation';
      if (invStage === 'collecting')  return 'gathering';
      if (invStage === 'classifying') return 'gathering';
      return 'reasoning';
    }
    if (phase === 'hearing')   return 'deliberation';
    if (phase === 'stillness') return 'silence';
    if (phase === 'revealing') return 'verdict';
    if (phase === 'complete')  return 'reflection';
    return 'listening';
  }, [phase, invStage, query]);

  // ── Companion Helpers ─────────────────────────────────────────────
  const showCompanion = useCallback((text: string, alsoSpeak = false) => {
    setCompanionText(text);
    setCompanionVisible(true);
    if (alsoSpeak) setTextToSpeak(text);
  }, []);

  const hideCompanion = useCallback(() => setCompanionVisible(false), []);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(
      () => showCompanion('المحكمة لا تزال تنتظر. الدليل لا يُستعجل.'),
      idleDelayRef.current,
    );
  }, [showCompanion]);

  // ── Chamber Awakening Effect ──────────────────────────────────────
  useEffect(() => {
    const stored   = getStoredTongue();
    const mem      = readMemory();
    const quiet    = isQuietMode(mem);
    const greeting = getReturnGreeting(mem, CHAMBER_INITIATIONS[stored ?? 'conversation']);
    // Rhythm-adapted greeting delay: hesitant citizens get more space before companion appears
    const greetDelay = getRhythmProfile(mem) === 'hesitant' ? 700
                     : getRhythmProfile(mem) === 'confident' ? 200
                     : 400;
    const t = setTimeout(() => {
      if (stored) {
        setTongue(stored);
        setChamberInit('active');
        if (!quiet) setTimeout(() => showCompanion(greeting), greetDelay);
        resetIdleTimer();
      } else {
        setChamberInit('tongue-sel');
      }
    }, 1_600);
    return () => {
      clearTimeout(t);
      if (idleTimerRef.current)    clearTimeout(idleTimerRef.current);
      if (writingDebRef.current)   clearTimeout(writingDebRef.current);
      if (hearingTimerRef.current) clearTimeout(hearingTimerRef.current);
      stageTimersRef.current.forEach(clearTimeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Silent Mode Auto-Submit ───────────────────────────────────────
  useEffect(() => {
    if (silentConcepts.length < 2 || tongue !== 'silent') return;
    const assembled = assembleSilentQuery(silentDomain ?? 'scientific', silentConcepts);
    const domain    = silentDomain ?? 'scientific';
    const t = setTimeout(() => {
      setQuery(assembled);
      setActiveDomain(domain);
      void handleSubmitQuery(assembled, domain);
    }, 700);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [silentConcepts]);

  // ── Tongue Selection ──────────────────────────────────────────────
  function selectTongue(t: AzmaTongue) {
    localStorage.setItem('azma.tongue.style', t);
    setTongue(t);
    setChamberInit('active');
    setTimeout(() => showCompanion(pickRandom(CHAMBER_INITIATIONS[t])), 600);
    resetIdleTimer();
  }

  function changeTongue(t: AzmaTongue) {
    localStorage.setItem('azma.tongue.style', t);
    setTongue(t);
    setResult(null);
    setPhase('idle');
    phaseRef.current = 'idle';
    setSilentDomain(null);
    setSilentConcepts([]);
    setShowProbing(false);
    setShowCuriosity(false);
    setWritingSuggestion('');
    showCompanion(pickRandom(CHAMBER_INITIATIONS[t]));
  }

  // ── Core Investigation Submit ─────────────────────────────────────
  async function handleSubmitQuery(q: string, domain: DomainId) {
    const trimmed = q.trim();
    if (!trimmed || phaseRef.current === 'examining' || phaseRef.current === 'stillness') return;

    // Reset hearing + session-level trackers
    if (hearingTimerRef.current) { clearTimeout(hearingTimerRef.current); hearingTimerRef.current = null; }
    setCitizenStance(null);
    setCourtQuestionsState([]);
    setShowCourtQuestions(false);
    sessionExpandedRef.current    = false;
    sessionVaultedRef.current     = false;
    sessionDomainChangesRef.current = 0;

    // Quick-submit detection: submitted within 8s of starting to type
    if (queryStartTimeRef.current !== null) {
      if (Date.now() - queryStartTimeRef.current < 8_000) {
        const updated = recordQuickSubmit(citizenMemory);
        setCitizenMemory(updated);
      }
      queryStartTimeRef.current = null;
    }
    queryLengthRef.current = 0;

    hideCompanion();
    setPhase('examining');
    phaseRef.current = 'examining';
    setResult(null);
    setSavedToVault(false);
    setGatewayOpen(false);
    setSelectedEvidence(null);
    setShowProbing(false);
    setShowCuriosity(false);
    setShowContinuation(false);
    setEvidenceGroups({});
    setSessionCount((c) => c + 1);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    setInvStage('receiving');
    showCompanion(COMPANION_MSGS.receiving);

    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => { setInvStage('collecting');  showCompanion(COMPANION_MSGS.collecting);  }, 700));
    timers.push(setTimeout(() => { setInvStage('classifying'); showCompanion(COMPANION_MSGS.classifying); }, 1_900));
    timers.push(setTimeout(() => { setInvStage('deliberating');showCompanion(COMPANION_MSGS.deliberating);}, 3_500));
    stageTimersRef.current = timers;

    const dto = await runInvestigation(trimmed, domain);
    timers.forEach(clearTimeout);
    setInvStage('idle');
    setResult(dto);

    // Open the Hearing — citizen deliberates before verdict (Article I)
    setPhase('hearing');
    phaseRef.current = 'hearing';
    const qs = selectCourtQuestions(dto);
    setCourtQuestionsState(qs);
    setCitizenStance(null);
    setShowCourtQuestions(false);
    setTimeout(() => setShowCourtQuestions(true), 1_500);
    showCompanion('المحكمة تفتح المداولة…');

    // Auto-proceed after 14s if citizen does not act
    if (hearingTimerRef.current) clearTimeout(hearingTimerRef.current);
    hearingTimerRef.current = setTimeout(() => {
      void proceedToVerdict(dto, trimmed, domain);
    }, 14_000);
  }

  // ── Proceed to Verdict — called from citizen action or auto-timer ─
  async function proceedToVerdict(dto: InvestigationDTO, q: string, d: DomainId) {
    if (phaseRef.current !== 'hearing') return;
    if (hearingTimerRef.current) { clearTimeout(hearingTimerRef.current); hearingTimerRef.current = null; }

    const pct = dto.success ? Math.round(dto.averageEvidenceScore * 100) : 0;
    if (pct < 35 && dto.success) {
      showCompanion('الأدلة تشير إلى اتجاه مختلف — الحجرة تحترم السؤال.');
      await delay(900);
    } else {
      showCompanion(COMPANION_MSGS.silence);
    }

    setPhase('stillness');
    phaseRef.current = 'stillness';
    await delay(Math.round(850 + citizenMemory.thinkingStyle.prefersDetail * 950));

    if (phaseRef.current !== 'stillness') return;
    setPhase('revealing');
    phaseRef.current = 'revealing';
    await delay(160);
    setPhase('complete');
    phaseRef.current = 'complete';

    showCompanion(COMPANION_MSGS.complete, true);
    resetIdleTimer();

    const updatedMemory = commitSession({
      query: q, domain: d, format: outputFormat,
      didExpand: sessionExpandedRef.current, didSaveVault: sessionVaultedRef.current,
    });
    setCitizenMemory(updatedMemory);

    const pq = getAdaptiveProbing(updatedMemory, PROBING_QS);
    setProbingQuestion(pq);
    setTimeout(() => setShowProbing(true), getDynamicDelay(updatedMemory, 3_000));

    const relCallback = getRelationshipCallback(updatedMemory);
    if (relCallback) {
      setTimeout(() => showCompanion(relCallback), getDynamicDelay(updatedMemory, 7_000));
    }

    if (dto.success && shouldExpressCuriosity(updatedMemory, dto.averageEvidenceScore)) {
      const cq = pickRandom(CHAMBER_CURIOSITIES);
      setCuriosityQuestion(cq);
      setTimeout(() => setShowCuriosity(true), getDynamicDelay(updatedMemory, 8_500));
    }
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    await handleSubmitQuery(query, activeDomain);
  }

  // ── Voice Transcript ──────────────────────────────────────────────
  const handleVoiceTranscript = useCallback((text: string) => {
    setQuery(text);
    setTimeout(() => { void handleSubmitQuery(text, activeDomain); }, 50);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDomain]);

  // ── Conversation Query Change — hesitation observation ────────────
  function handleConversationQueryChange(text: string) {
    // Hesitation signal: typed a substantive query then deleted back to near-empty
    if (queryLengthRef.current > 20 && text.length < 5) {
      const updated = recordHesitation(citizenMemory);
      setCitizenMemory(updated);
    }
    // Start timing for quick-submit detection on first character typed
    if (queryLengthRef.current === 0 && text.length > 0) {
      queryStartTimeRef.current = Date.now();
    }
    queryLengthRef.current = text.length;
    setQuery(text);
    resetIdleTimer();
  }

  // ── Writing Mode ──────────────────────────────────────────────────
  function handleWritingChange(text: string) {
    setQuery(text);
    resetIdleTimer();
    if (writingDebRef.current) clearTimeout(writingDebRef.current);
    if (text.length > 12) {
      writingDebRef.current = setTimeout(() => {
        setWritingSuggestion(pickRandom([
          'هل تريد أن نبدأ بالأدلة القاطعة أولاً؟',
          'ما الجانب الأكثر إثارة للجدل في هذه القضية؟',
          'هل تريد مقاربة تاريخية أم معاصرة؟',
          'ما الافتراض الأساسي الذي تستند إليه هنا؟',
          'هل هناك حادثة محددة تريد فحصها؟',
        ]));
      }, 2_500);
    } else {
      setWritingSuggestion('');
    }
  }

  function handleWritingKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      void handleSubmitQuery(query, activeDomain);
    }
  }

  // ── Silent Mode ───────────────────────────────────────────────────
  function handleSilentDomain(domain: DomainId) {
    setSilentDomain(domain);
    setSilentConcepts([]);
    setActiveDomain(domain);
    showCompanion(`${KNOWLEDGE_DOMAINS.find((d) => d.id === domain)?.fullAr ?? domain} — اختر المفاهيم.`);
  }

  function handleSilentConcept(concept: string) {
    setSilentConcepts((prev) => {
      if (prev.includes(concept)) return prev.filter((c) => c !== concept);
      if (prev.length >= 3) return prev;
      return [...prev, concept];
    });
  }

  // ── Domain Change ─────────────────────────────────────────────────
  function handleDomainChange(id: DomainId) {
    setActiveDomain(id);
    if (phase === 'complete') { setResult(null); setPhase('idle'); phaseRef.current = 'idle'; hideCompanion(); }
    // Exploration signal: switched domain before submitting
    if (phase === 'idle') {
      sessionDomainChangesRef.current += 1;
      if (sessionDomainChangesRef.current >= 2) {
        const updated = recordExploration(citizenMemory);
        setCitizenMemory(updated);
      }
    }
    resetIdleTimer();
  }

  // ── Evidence Gateway ──────────────────────────────────────────────
  function handleEvidenceSelect(ev: EvidenceItemDTO) {
    setSelectedEvidence(ev);
    setGatewayOpen(true);
    showCompanion(COMPANION_MSGS.gatewayOpen);
  }

  function handleNewInvestigationFromEvidence(evidenceContext: string) {
    setGatewayOpen(false);
    setQuery(evidenceContext.slice(0, 200));
    setResult(null);
    setPhase('idle');
    phaseRef.current = 'idle';
    setSavedToVault(false);
    setTimeout(() => document.getElementById('hujjah-input')?.focus(), 100);
  }

  function handleSaveEvidenceToVault(ev: EvidenceItemDTO) {
    try {
      const existing = JSON.parse(sessionStorage.getItem('azma.vault.evidence') ?? '[]') as EvidenceItemDTO[];
      sessionStorage.setItem('azma.vault.evidence', JSON.stringify(
        [...existing.filter((e) => e.id !== ev.id), ev],
      ));
    } catch { /* ignore */ }
    showCompanion(COMPANION_MSGS.vaultSaved);
  }

  // ── Investigation File Actions ────────────────────────────────────
  function handleContinue() {
    if (hearingTimerRef.current) { clearTimeout(hearingTimerRef.current); hearingTimerRef.current = null; }
    setResult(null);
    setPhase('idle');
    phaseRef.current = 'idle';
    setSavedToVault(false);
    setShowProbing(false);
    setShowCuriosity(false);
    setCitizenStance(null);
    setCourtQuestionsState([]);
    setShowCourtQuestions(false);
    setEvidenceGroups({});
    if (tongue === 'silent') { setSilentDomain(null); setSilentConcepts([]); }
    setTimeout(() => document.getElementById('hujjah-input')?.focus(), 80);
  }

  function handleGroupEvidence(id: string, group: EvidenceGrouping) {
    const newGroups = { ...evidenceGroups, [id]: group };
    setEvidenceGroups(newGroups);
    // Chamber responds when many items land in doubt — offers to deepen investigation
    const doubtCount = Object.values(newGroups).filter((g) => g === 'doubt').length;
    if (doubtCount >= 3) {
      setTimeout(() => showCompanion('كثير من الأدلة تثير الشك — هل نوسّع التحقيق؟'), 600);
    }
  }

  function handleExpand() {
    if (!result) return;
    sessionExpandedRef.current = true;
    const expandQuery = `توسيع وتعمّق في: ${query.trim()}`;
    setQuery(expandQuery);
    setResult(null);
    setSavedToVault(false);
    setShowProbing(false);
    setPhase('idle');
    phaseRef.current = 'idle';
    setTimeout(() => { void handleSubmitQuery(expandQuery, activeDomain); }, 80);
  }

  function handleSaveVault() {
    if (!result) return;
    sessionVaultedRef.current = true;
    try {
      sessionStorage.setItem('azma.transfer.investigation', JSON.stringify({
        query: query.trim(), evidenceCount: result.evidence.length,
        averageScore: result.averageEvidenceScore, timestamp: Date.now(), sessionNumber: sessionCount,
      }));
    } catch { /* ignore */ }
    setSavedToVault(true);
    showCompanion(COMPANION_MSGS.vaultSaved);
  }

  // ── Citizen Stance — Article V ────────────────────────────────────
  function handleCitizenStance(stance: CitizenStance) {
    setCitizenStance(stance);
    if (!result) return;
    if (stance === 'more-evidence') {
      if (hearingTimerRef.current) { clearTimeout(hearingTimerRef.current); hearingTimerRef.current = null; }
      handleExpand();
      return;
    }
    const msg = stance === 'object'  ? 'الحجرة تحترم اعتراضك. الحكم سيأخذه في الاعتبار.'
              : stance === 'support' ? 'موقفك موثَّق. المحكمة تمضي في المداولة.'
              :                        'الحكم موقوف بناءً على طلبك. الأسئلة تبقى مفتوحة.';
    showCompanion(msg);
    setTimeout(() => { void proceedToVerdict(result, query.trim(), activeDomain); }, 900);
  }

  function handleProceedToVerdict() {
    if (!result) return;
    void proceedToVerdict(result, query.trim(), activeDomain);
  }

  // ── Appeal — Article VIII ─────────────────────────────────────────
  function handleAppeal() {
    if (!result || !query.trim()) return;
    const appealQ = `استئناف ومراجعة: ${query.trim()}`;
    setQuery(appealQ);
    setResult(null);
    setSavedToVault(false);
    setShowProbing(false);
    setShowCuriosity(false);
    setCitizenStance(null);
    setCourtQuestionsState([]);
    setShowCourtQuestions(false);
    setEvidenceGroups({});
    setPhase('idle');
    phaseRef.current = 'idle';
    showCompanion('أدلة جديدة تفتح التحقيق من جديد…');
    setTimeout(() => { void handleSubmitQuery(appealQ, activeDomain); }, 300);
  }

  function handleChallengeVerdict() {
    if (!result || !query.trim()) return;
    const challengeQ = `دحض وتحدّ: ${query.trim()}`;
    setQuery(challengeQ);
    setResult(null);
    setSavedToVault(false);
    setShowProbing(false);
    setShowCuriosity(false);
    setEvidenceGroups({});
    setPhase('idle');
    phaseRef.current = 'idle';
    showCompanion('الحجرة تعيد الفحص من زاوية مختلفة…');
    setTimeout(() => { void handleSubmitQuery(challengeQ, activeDomain); }, 300);
  }

  function handleCinematicExit(destination: string) {
    if (result) {
      try {
        sessionStorage.setItem('azma.transfer.investigation', JSON.stringify({
          query: query.trim(), evidence: result.evidence, timestamp: Date.now(),
        }));
      } catch { /* ignore */ }
    }
    showCompanion(COMPANION_MSGS.departure);
    setIsExiting(true);
    setTimeout(() => router.push(destination), 720);
  }

  // ── Continuation resume ───────────────────────────────────────────
  const contCtx = useMemo(() => getContinuationContext(citizenMemory), [citizenMemory]);

  function handleResumeContinuation() {
    if (!contCtx.domain || !contCtx.query) return;
    setQuery(contCtx.query);
    setActiveDomain(contCtx.domain);
    setShowContinuation(false);
    setTimeout(() => document.getElementById('hujjah-input')?.focus(), 80);
  }

  // ── Focus signal (citizen types quickly after companion message) ──
  function handleInputFocusSignal() {
    if (companionVisible) {
      const updated = signalFocusMode(citizenMemory);
      setCitizenMemory(updated);
    }
  }

  // ── Derived ───────────────────────────────────────────────────────
  const isExamining = phase === 'examining';
  const hasVerdict  = (phase === 'revealing' || phase === 'complete') && result !== null;
  const isHearing   = phase === 'hearing' && result !== null;

  // ── Familiarity — Article VIII (environmental, not textual) ──────────
  const familiarityClass = citizenMemory.totalSessions >= 5 ? 'court-familiar-deep'
                         : citizenMemory.totalSessions >= 2 ? 'court-familiar'
                         : '';

  // ── Certainty atmosphere — Article I (chamber reflects evidence confidence)
  const certaintyClass = useMemo(() => {
    if (phase !== 'complete' || !result?.success) return '';
    const b   = bucketEvidence(result);
    const pct = result.averageEvidenceScore;
    if (b.disputed.length > 0 && b.supported.length > 0) return 'certainty-conflict';
    if (pct >= 0.70) return 'certainty-high';
    if (pct >= 0.45) return 'certainty-moderate';
    return 'certainty-low';
  }, [phase, result]);

  // ── Court mood — Article II (eight atmospheric states)
  const courtMoodClass = useMemo(() => {
    if (citizenStance === 'suspend') return 'court-mood-suspended';
    if (phase === 'complete' && result?.success) {
      const b   = bucketEvidence(result);
      const pct = result.averageEvidenceScore;
      if (pct >= 0.70 && b.disputed.length === 0) return 'court-mood-certain';
      if (pct < 0.45)                             return 'court-mood-doubtful';
    }
    if (phase === 'hearing' && showCourtQuestions) return 'court-mood-questioning';
    return '';
  }, [phase, result, citizenStance, showCourtQuestions]);

  // ── Shared verdict block props (all three modes) ─────────────────
  const verdictProps: VerdictBlockProps = {
    hasVerdict,
    result,
    query: query.trim(),
    activeDomain,
    outputFormat,
    onFormatChange:    setOutputFormat,
    showProbing,
    phase,
    probingQuestion,
    showCuriosity,
    curiosityQuestion,
    citizenStance,
    evidenceGroups,
    onGroupEvidence:   handleGroupEvidence,
    onEvidenceSelect:  handleEvidenceSelect,
    onContinue:        handleContinue,
    onExpand:          handleExpand,
    onChallenge:       handleChallengeVerdict,
    onAppeal:          handleAppeal,
    onTransferQiyamah: () => handleCinematicExit('/qiyamah-chamber'),
    onSaveVault:       handleSaveVault,
    savedToVault,
  };

  // ── Shared gateway (all modes) ────────────────────────────────────
  const sharedGateway = (
    <EvidenceGateway
      evidence={selectedEvidence}
      domain={activeDomain}
      open={gatewayOpen}
      onClose={() => setGatewayOpen(false)}
      onNewInvestigation={handleNewInvestigationFromEvidence}
      onSaveToVault={handleSaveEvidenceToVault}
    />
  );

  // ════════════════════════════════════════════════════════════════
  //  RENDER
  // ════════════════════════════════════════════════════════════════

  return (
    <main
      className={`hujjah-viewport breathing mood-${mood} ${isExiting ? 'chamber-sealing' : ''} ${familiarityClass} ${certaintyClass} ${courtMoodClass}`}
      data-inv-count={sessionCount % 4}
      dir="rtl"
    >
      {/* Atmospheric Background — chamber breathes continuously */}
      <div className="neon-layer" aria-hidden="true">
        <div className="cyber-grid" />
        <div className="ambient-depth-gradient" />
        <div className="ambient-secondary-glow" />
        <div className="chamber-vault" />
        <div className="chamber-breath-glow" />
        <div className="chamber-light-beam" />
        <div id="court-prox-glow" className="court-proximity-glow" />
      </div>

      {/* ── Chamber Awakening ────────────────────────────────────── */}
      {chamberInit === 'awakening' && (
        <div className="chamber-awakening" aria-hidden="true">
          <div className="awakening-inner">
            <div className="awakening-seal">⚖</div>
            <p className="awakening-breath">الحجرة المعرفية تستيقظ</p>
          </div>
        </div>
      )}

      {/* ── AZMA Tongue Selector ─────────────────────────────────── */}
      {chamberInit === 'tongue-sel' && (
        <div className="tongue-selector" role="dialog" aria-label="اختر أسلوب التواصل مع المحكمة">
          <div className="tongue-selector-inner">
            <div className="tongue-header">
              <span className="tongue-crown-glyph" aria-hidden="true">⚖</span>
              <h2 className="tongue-title">كيف تريد أن نتواصل؟</h2>
              <p className="tongue-subtitle">الحجرة تتكيف معك — لا معك تتكيف معها</p>
            </div>
            <div className="tongue-options">
              {TONGUE_DEFS.map((def) => (
                <button
                  key={def.id}
                  className="tongue-option"
                  onClick={() => selectTongue(def.id)}
                  aria-label={`اختر أسلوب: ${def.nameAr}`}
                >
                  <span className="tongue-opt-glyph" aria-hidden="true">{def.glyph}</span>
                  <span className="tongue-opt-name">{def.nameAr}</span>
                  <span className="tongue-opt-desc">{def.descAr}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Active Chamber ───────────────────────────────────────── */}
      {chamberInit === 'active' && (
        <>
          {/* Crown Bar */}
          <div className="crown-bar">
            <LivingCompanion
              message={companionText}
              visible={companionVisible}
              textToSpeak={textToSpeak}
              onVoiceTranscript={handleVoiceTranscript}
            />
            {/* Tongue Switcher */}
            <div className="tongue-switcher" role="group" aria-label="أسلوب التواصل">
              {TONGUE_DEFS.map((def) => (
                <button
                  key={def.id}
                  className={`tongue-switch-btn ${tongue === def.id ? 'tsb-active' : ''}`}
                  onClick={() => changeTongue(def.id)}
                  title={def.nameAr}
                  aria-pressed={tongue === def.id}
                  aria-label={def.nameAr}
                >
                  {def.glyph}
                </button>
              ))}
            </div>
            <div className="crown-nav">
              <button className="sovereign-exit-btn" onClick={() => handleCinematicExit('/ras-amr')}>
                ⮜ العودة
              </button>
            </div>
          </div>

          {/* ══ CONVERSATION MODE ══════════════════════════════════ */}
          {(tongue === 'conversation' || tongue === null) && (
            <div className="imperial-court-layout">

              {/* Knowledge Archives */}
              <aside className="knowledge-archives living-frame-archives">
                <div className="archives-header">
                  <div className="archives-classification">المستودعات المعرفية</div>
                  <h2 className="archives-title">أرشيف المعرفة</h2>
                  {sessionCount > 0 && (
                    <div className="archives-session-docket">جلسة #{sessionCount}</div>
                  )}
                </div>
                <div className="archive-domains">
                  {KNOWLEDGE_DOMAINS.map((domain) => (
                    <div
                      key={domain.id}
                      className={`archive-domain ${activeDomain === domain.id ? 'archive-domain-active' : ''}`}
                      onClick={() => handleDomainChange(domain.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleDomainChange(domain.id)}
                      aria-pressed={activeDomain === domain.id}
                    >
                      <span className="archive-domain-mark" aria-hidden="true">◈</span>
                      <div className="archive-domain-labels">
                        <span className="archive-domain-name">{domain.nameAr}</span>
                        <span className="archive-domain-sub">{domain.fullAr}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="archive-divider" />
                {hasVerdict && result!.evidence.length > 0 && (
                  <div className="archive-records custom-scroll">
                    <div className="archive-records-label">سجلات الجلسة</div>
                    {result!.evidence.map((ev, idx) => {
                      const layer = resolveKnowledgeLayer(ev.confidenceScore, ev.confidenceLevel, activeDomain);
                      return (
                        <button
                          key={ev.id}
                          className={`archive-record tier-record-${layer.tier} archive-record-btn`}
                          style={{ animationDelay: `${idx * 55}ms` }}
                          onClick={() => handleEvidenceSelect(ev)}
                          aria-label={`افتح بوابة الدليل: ${layer.labelAr}`}
                        >
                          <span className={`archive-record-tier tier-${layer.tier}`}>{layer.labelAr}</span>
                          <p className="archive-record-excerpt">
                            {(ev.contextWindow || ev.extractedText).slice(0, 55)}…
                          </p>
                          <span className="archive-record-score">{Math.round(ev.confidenceScore * 100)}%</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {(isExamining || phase === 'stillness') && (
                  <div className="archive-scanning" aria-live="polite">
                    <div className="scanning-label">تُفهرَس الأرشيفات</div>
                    <div className="scanning-bars">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="scanning-bar" style={{ animationDelay: `${i * 200}ms` }} />
                      ))}
                    </div>
                  </div>
                )}
              </aside>

              {/* Court Space */}
              <section className="court-space">
                <div className="court-frieze">
                  <span className="frieze-rule" aria-hidden="true" />
                  <span className="frieze-glyph" aria-hidden="true">⚖</span>
                  <span className="frieze-title">المحكمة الإمبراطورية للمعرفة</span>
                  <span className="frieze-glyph" aria-hidden="true">⚖</span>
                  <span className="frieze-rule" aria-hidden="true" />
                </div>

                {/* Dialogue Podium — no chatbot patterns */}
                <div className="dialogue-podium">
                  <form className="dialogue-form" onSubmit={handleSubmit}>
                    <textarea
                      id="hujjah-input"
                      className="dialogue-input"
                      value={query}
                      onChange={(e) => handleConversationQueryChange(e.target.value)}
                      onFocus={handleInputFocusSignal}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          void handleSubmit();
                        }
                      }}
                      disabled={isExamining}
                      aria-label="حوار المحكمة"
                      rows={2}
                    />
                    <div className="dialogue-meta">
                      {isExamining ? (
                        <>
                          <span className="dialogue-stage-hint">
                            {invStage === 'receiving'    ? 'تستمع…'
                            : invStage === 'collecting'  ? 'تتكشّف…'
                            : invStage === 'classifying' ? 'تزن…'
                            : 'تفكّر…'}
                          </span>
                          <span className="dialogue-examining-pulse" aria-hidden="true" />
                        </>
                      ) : (
                        <span className="dialogue-key-hint" aria-hidden="true">
                          ↵ للإرسال · Shift+↵ سطر جديد
                        </span>
                      )}
                    </div>
                  </form>
                </div>

                {/* Deliberation Hall */}
                <div className="deliberation-hall custom-scroll">

                  {/* Continuation — chamber remembers */}
                  {showContinuation && contCtx.show && phase === 'idle' && !result && (
                    <div className="chamber-continuation" role="complementary">
                      <span className="cont-glyph" aria-hidden="true">◇</span>
                      <span className="cont-text">
                        الفكرة لم تنتهِ — {contCtx.query.slice(0, 42)}{contCtx.query.length > 42 ? '…' : ''}
                      </span>
                      <button className="cont-resume-btn" onClick={handleResumeContinuation}>
                        متابعة التفكير
                      </button>
                      <button
                        className="cont-dismiss-btn"
                        onClick={() => setShowContinuation(false)}
                        aria-label="إغلاق"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Chamber speaks first */}
                  {phase === 'idle' && !result && (
                    <div className="chamber-speaks-first">
                      <div className="csf-sigil" aria-hidden="true">⚖</div>
                      <p className="csf-utterance">{chamberGreeting}</p>
                    </div>
                  )}

                  {isHearing && result && (
                    <HearingBlock
                      result={result}
                      domain={activeDomain}
                      citizenStance={citizenStance}
                      onStance={handleCitizenStance}
                      onProceed={handleProceedToVerdict}
                      courtQuestions={courtQuestionsState}
                      showCourtQuestions={showCourtQuestions}
                      onEvidenceSelect={handleEvidenceSelect}
                    />
                  )}

                  {phase === 'examining' && (
                    <div className="court-deliberating" aria-live="polite" aria-atomic="true">
                      <div className="deliberation-ring" aria-hidden="true" />
                      <p className="deliberation-stage-label">
                        {invStage === 'receiving'    && 'الحجرة تستمع…'}
                        {invStage === 'collecting'   && 'الأدلة تتكشّف…'}
                        {invStage === 'classifying'  && 'الحجرة تزن…'}
                        {invStage === 'deliberating' && 'الحجرة تفكر معك…'}
                        {invStage === 'idle'         && 'التفكير جارٍ'}
                      </p>
                      <p className="deliberation-inscription">المحكمة الإمبراطورية تعمل…</p>
                    </div>
                  )}

                  {phase === 'stillness' && (
                    <div className="moment-of-truth" aria-hidden="true">
                      <div className="truth-rule" />
                      <span className="truth-word">لحظة…</span>
                      <div className="truth-rule" />
                    </div>
                  )}

                  <VerdictBlock {...verdictProps} />
                </div>

                {sharedGateway}
              </section>
            </div>
          )}

          {/* ══ WRITING MODE ════════════════════════════════════════ */}
          {tongue === 'writing' && (
            <div className="writing-chamber">
              <div className="writing-layout">

                {/* Chamber Margin — right side in RTL (first in DOM) */}
                <aside className="chamber-margin">
                  <div className="margin-header">
                    <span className="margin-glyph" aria-hidden="true">◈</span>
                    <span className="margin-label">هوامش الحجرة</span>
                  </div>
                  <div className="margin-domains">
                    {KNOWLEDGE_DOMAINS.map((domain) => (
                      <button
                        key={domain.id}
                        className={`margin-domain-btn ${activeDomain === domain.id ? 'mdb-active' : ''}`}
                        onClick={() => handleDomainChange(domain.id)}
                      >
                        {domain.nameAr}
                      </button>
                    ))}
                  </div>
                  <div className="margin-divider" />
                  {writingSuggestion && !isExamining && (
                    <div className="margin-suggestion" aria-live="polite">
                      <span className="suggestion-mark" aria-hidden="true">◇</span>
                      <p className="suggestion-text">{writingSuggestion}</p>
                    </div>
                  )}
                  {isExamining && (
                    <div className="margin-examining" aria-live="polite">
                      <div className="margin-scan-line" aria-hidden="true" />
                      <p className="margin-stage">
                        {invStage === 'receiving'    ? 'تستمع…'
                        : invStage === 'collecting'  ? 'تتكشّف…'
                        : invStage === 'classifying' ? 'تزن…'
                        : 'تفكّر…'}
                      </p>
                    </div>
                  )}
                  {hasVerdict && result?.success && (() => {
                    const b = bucketEvidence(result);
                    const top = [...b.supported, ...b.narratives].slice(0, 5);
                    return top.length > 0 ? (
                      <div className="margin-evidence custom-scroll">
                        <div className="margin-ev-label">أدلة الجلسة</div>
                        {top.map((ev) => {
                          const layer = resolveKnowledgeLayer(ev.confidenceScore, ev.confidenceLevel, activeDomain);
                          return (
                            <button
                              key={ev.id}
                              className="margin-ev-item"
                              onClick={() => handleEvidenceSelect(ev)}
                            >
                              <span className={`mev-tier tier-${layer.tier}`}>{layer.labelAr}</span>
                              <span className="mev-text">{ev.extractedText.slice(0, 60)}…</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : null;
                  })()}
                </aside>

                {/* Writing Canvas — left side in RTL (second in DOM) */}
                <div className="writing-canvas-area">
                  <div className="writing-canvas-header">
                    <span className="canvas-frieze-glyph" aria-hidden="true">⬡</span>
                    <span className="canvas-frieze-title">لوح التفكير المعرفي</span>
                    <span className="canvas-frieze-glyph" aria-hidden="true">⬡</span>
                  </div>
                  <form className="writing-form" onSubmit={handleSubmit}>
                    <textarea
                      id="hujjah-input"
                      className="writing-textarea"
                      value={query}
                      onChange={(e) => handleWritingChange(e.target.value)}
                      onFocus={handleInputFocusSignal}
                      onKeyDown={handleWritingKeyDown}
                      placeholder={chamberGreeting}
                      disabled={isExamining}
                      aria-label="لوح الكتابة المعرفية"
                    />
                    <div className="writing-actions">
                      <span className="writing-key-hint" aria-hidden="true">
                        Ctrl+↵ للاستقصاء
                      </span>
                      {!isExamining && query.trim() && (
                        <button type="submit" className="writing-submit-btn">
                          ⚖ استقصاء
                        </button>
                      )}
                      {isExamining && (
                        <span className="writing-examining" aria-live="polite">
                          <span className="seal-spinner" aria-hidden="true" />
                          المحكمة تعمل…
                        </span>
                      )}
                    </div>
                  </form>
                  {phase === 'examining' && (
                    <div className="writing-deliberating" aria-live="polite">
                      <div className="deliberation-ring" aria-hidden="true" />
                      <p className="deliberation-stage-label">
                        {invStage === 'receiving'    && 'الحجرة تستمع…'}
                        {invStage === 'collecting'   && 'الأدلة تتكشّف…'}
                        {invStage === 'classifying'  && 'الحجرة تزن…'}
                        {invStage === 'deliberating' && 'الحجرة تفكر معك…'}
                        {invStage === 'idle'         && 'التفكير جارٍ'}
                      </p>
                    </div>
                  )}
                  {phase === 'stillness' && (
                    <div className="moment-of-truth" aria-hidden="true">
                      <div className="truth-rule" />
                      <span className="truth-word">لحظة…</span>
                      <div className="truth-rule" />
                    </div>
                  )}
                  {isHearing && result && (
                    <div className="writing-verdict-area custom-scroll">
                      <HearingBlock
                        result={result}
                        domain={activeDomain}
                        citizenStance={citizenStance}
                        onStance={handleCitizenStance}
                        onProceed={handleProceedToVerdict}
                        courtQuestions={courtQuestionsState}
                        showCourtQuestions={showCourtQuestions}
                        onEvidenceSelect={handleEvidenceSelect}
                      />
                    </div>
                  )}
                  {hasVerdict && (
                    <div className="writing-verdict-area custom-scroll">
                      <VerdictBlock {...verdictProps} />
                    </div>
                  )}
                </div>
              </div>
              {sharedGateway}
            </div>
          )}

          {/* ══ SILENT MODE ═════════════════════════════════════════ */}
          {tongue === 'silent' && (
            <div className="silent-chamber">
              <div className="silent-frieze">
                <span className="frieze-rule" aria-hidden="true" />
                <span className="frieze-glyph" aria-hidden="true">◇</span>
                <span className="frieze-title">الحجرة الصامتة</span>
                <span className="frieze-glyph" aria-hidden="true">◇</span>
                <span className="frieze-rule" aria-hidden="true" />
              </div>

              {!isExamining && !hasVerdict && (
                <div className="silent-main">
                  {/* Phase 1: Domain Selection */}
                  {!silentDomain && (
                    <div className="silent-domain-field">
                      <p className="silent-prompt">اختر مجال الاستقصاء</p>
                      <div className="silent-domains">
                        {KNOWLEDGE_DOMAINS.map((domain) => (
                          <button
                            key={domain.id}
                            className="silent-domain-zone"
                            onClick={() => handleSilentDomain(domain.id)}
                            aria-label={domain.fullAr}
                          >
                            <span className="sdz-glyph" aria-hidden="true">◈</span>
                            <span className="sdz-name">{domain.nameAr}</span>
                            <span className="sdz-full">{domain.fullAr}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Phase 2: Concept Selection */}
                  {silentDomain && (
                    <div className="silent-concept-field">
                      <div className="concept-field-header">
                        <button
                          className="concept-back-btn"
                          onClick={() => { setSilentDomain(null); setSilentConcepts([]); }}
                          aria-label="العودة لاختيار المجال"
                        >
                          ⮜
                        </button>
                        <span className="concept-domain-label">
                          {KNOWLEDGE_DOMAINS.find((d) => d.id === silentDomain)?.fullAr}
                        </span>
                      </div>
                      <p className="silent-prompt">
                        {silentConcepts.length === 0
                          ? 'اختر مفهومين أو أكثر للبدء'
                          : silentConcepts.length === 1
                          ? 'مفهوم واحد — اختر آخر…'
                          : 'الحجرة ستبدأ الاستقصاء…'}
                      </p>
                      <div className="silent-concepts">
                        {SILENT_CONCEPTS[silentDomain].map((concept) => (
                          <button
                            key={concept}
                            className={`silent-concept-token ${silentConcepts.includes(concept) ? 'sct-selected' : ''}`}
                            onClick={() => handleSilentConcept(concept)}
                            aria-pressed={silentConcepts.includes(concept)}
                          >
                            {concept}
                          </button>
                        ))}
                      </div>
                      {silentConcepts.length > 0 && (
                        <div className="silent-assembled-query">
                          <span className="saq-label" aria-hidden="true">◇</span>
                          <span className="saq-text">
                            {assembleSilentQuery(silentDomain, silentConcepts)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Examining */}
              {isExamining && (
                <div className="silent-examining" aria-live="polite">
                  <div className="silent-orb" aria-hidden="true">
                    <div className="silent-orb-inner" />
                    <div className="silent-orb-ring" />
                  </div>
                  <p className="silent-stage-text">
                    {invStage === 'receiving'    ? 'تستمع…'
                    : invStage === 'collecting'  ? 'تتكشّف…'
                    : invStage === 'classifying' ? 'تزن…'
                    : 'تفكّر…'}
                  </p>
                </div>
              )}

              {/* Stillness */}
              {phase === 'stillness' && (
                <div className="moment-of-truth" aria-hidden="true">
                  <div className="truth-rule" />
                  <span className="truth-word">لحظة…</span>
                  <div className="truth-rule" />
                </div>
              )}

              {/* Hearing */}
              {isHearing && result?.success && (
                <div className="silent-verdict custom-scroll">
                  <HearingBlock
                    result={result}
                    domain={activeDomain}
                    citizenStance={citizenStance}
                    onStance={handleCitizenStance}
                    onProceed={handleProceedToVerdict}
                    courtQuestions={courtQuestionsState}
                    showCourtQuestions={showCourtQuestions}
                    onEvidenceSelect={handleEvidenceSelect}
                  />
                </div>
              )}

              {/* Verdict */}
              {hasVerdict && result?.success && (
                <div className="silent-verdict custom-scroll">
                  {result.evidence.length > 0 && (() => {
                    const b = bucketEvidence(result);
                    const cards = [...b.supported, ...b.narratives, ...b.disputed].slice(0, 8);
                    return cards.length > 0 ? (
                      <div className="silent-evidence-board">
                        {cards.map((ev) => {
                          const layer = resolveKnowledgeLayer(ev.confidenceScore, ev.confidenceLevel, activeDomain);
                          return (
                            <button
                              key={ev.id}
                              className={`silent-ev-card sev-${layer.tier}`}
                              onClick={() => handleEvidenceSelect(ev)}
                            >
                              <span className="sev-tier">{layer.labelAr}</span>
                              <p className="sev-text">{ev.extractedText.slice(0, 80)}</p>
                              <span className="sev-score">{Math.round(ev.confidenceScore * 100)}%</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : null;
                  })()}
                  <VerdictBlock {...verdictProps} />
                </div>
              )}

              {sharedGateway}
            </div>
          )}
        </>
      )}
    </main>
  );
}
