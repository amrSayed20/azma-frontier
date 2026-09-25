/**
 * AZMA OS – Hujjah Al-Damighah
 * The Imperial Court of Knowledge.
 * Resurrection of the Soul — AZMA Tongue Constitutional Decree.
 */

'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useConstitutionalNavigation } from '@/src/constitutional-navigation';
import './hujjah-al-damighah.css';
import { runInvestigation, depositEvidenceToVault, depositInvestigationToVault, composeCreationDemandToVault, composeStoryboardDemand, type InvestigationDTO, type EvidenceItemDTO } from './actions';
import type { DemandDestination } from '@/src/chambers/hujjah-al-damighah/sovereign-language-bridge';
import { useVoiceMode } from '@/src/components/living-companion/useVoiceMode';
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
  sourceLineOf,
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
import { ChamberDemonstration } from '@/src/chamber-demonstration';

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
    'حجرة المعرفة جاهزة. ما الموضوع الذي تريد استكشافه؟',
    'حجرة المعرفة تستيقظ. ما الذي يشغل ذهنك؟',
    'ابدأ استكشافك. الحجرة تنتظر سؤالك.',
    'حجرة المعرفة جاهزة — اسألني عن العلم، التاريخ، الطب، الثقافة، أو أي مجال يشغلك.',
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

// ── Chamber Voice — constitutional narrator, not assistant ──────────
// Each message names the constitutional act the Empire is performing,
// never the technical system (no provider, no Ministry, no API).
/** Where each demand is carried. The Chamber it was written for. */
const DESTINATION_ROUTE: Record<DemandDestination, string> = {
  'qiyamah-chamber':  '/qiyamah-chamber',
  'ras-amr':          '/ras-amr',
  'makman-al-ghayah': '/makman-al-ghayah',
};

const COMPANION_MSGS: Record<string, string> = {
  receiving:    'الإمبراطورية تستقبل طلبك وتفهم مقصدك…',
  collecting:   'الحجرة تحقق في عمق المعرفة…',
  classifying:  'الأدلة تُوزن وتُصنَّف…',
  deliberating: 'الإمبراطورية تبلور ما تعلمته…',
  silence:      'لحظة صمت.',
  complete:     'التحقيق اكتمل.',
  departure:    'تفكيرك الآن مختلف. هذا هو المقصود.',
  gatewayOpen:  'بوابة الدليل مفتوحة.',
  vaultSaved:   'محفوظ في الخزانة.',
  // A refusal can be retried; a false success cannot. This is said only when
  // nothing was kept, and it never claims otherwise.
  vaultFailed:  'لم يُحفظ. أعد المحاولة.',
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
        <span className="cp-title">وجهات نظر مختلفة</span>
        <span className="cp-rule" aria-hidden="true" />
      </div>
      <div className="cp-layout">
        <div className="cp-side cp-supporting">
          <div className="cp-side-label">المنظور الأول</div>
          {topS.map((ev) => {
            const layer = resolveKnowledgeLayer(ev, domain);
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
          <div className="cp-side-label">المنظور الآخر</div>
          {topD.map((ev) => {
            const layer = resolveKnowledgeLayer(ev, domain);
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
            const layer = resolveKnowledgeLayer(ev, domain);
            return (
              <button key={ev.id} className="hearing-ev-btn hev-support" onClick={() => onEvidenceSelect(ev)}>
                <span className="hev-tier">{layer.labelAr}</span>
                <p className="hev-text">{ev.extractedText.slice(0, 100)}…</p>
                {ev.attributionAr && <span className="hev-source">{sourceLineOf(ev)}</span>}
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
            const layer = resolveKnowledgeLayer(ev, domain);
            return (
              <button key={ev.id} className="hearing-ev-btn hev-oppose" onClick={() => onEvidenceSelect(ev)}>
                <span className="hev-tier">{layer.labelAr}</span>
                <p className="hev-text">{ev.extractedText.slice(0, 100)}…</p>
                {ev.attributionAr && <span className="hev-source">{sourceLineOf(ev)}</span>}
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
  const layer = resolveKnowledgeLayer(top, domain);
  return (
    <div className="minority-view">
      <div className="mv-header">
        <span className="mv-glyph" aria-hidden="true">◑</span>
        <span className="mv-title">زاوية أخرى تستحق الاهتمام</span>
      </div>
      <button className="mv-ev-btn" onClick={() => onSelect(top)}>
        <span className={`mv-tier ctier-${getConstitutionalTier(layer.tier)}`}>{layer.labelAr}</span>
        <p className="mv-text">{top.extractedText.slice(0, 120)}…</p>
      </button>
      <p className="mv-note">الحجرة لا تخفي وجهات النظر المختلفة.</p>
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
          const layer = resolveKnowledgeLayer(ev, domain);
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
              <span className="entry-score" title="مطابقة النص للسؤال — لا حكم على حجّيته">مطابقة {Math.round(ev.confidenceScore * 100)}%</span>
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
  onDemand:          (destination: DemandDestination) => void;
  composingDemand:   DemandDestination | null;
  demandNotice:      string | null;
  onSceneStructure:  () => void;
  composingScenes:   boolean;
}

function VerdictBlock({
  hasVerdict, result, query, activeDomain, outputFormat, onFormatChange,
  showProbing, phase, probingQuestion, showCuriosity, curiosityQuestion,
  citizenStance,
  evidenceGroups, onGroupEvidence,
  onEvidenceSelect, onContinue, onExpand, onChallenge, onAppeal, onTransferQiyamah, onSaveVault, savedToVault,
  onDemand, composingDemand, demandNotice, onSceneStructure, composingScenes,
}: VerdictBlockProps) {
  if (!hasVerdict || !result) return null;
  const b = result.success ? bucketEvidence(result) : null;
  const isUncertain = result.success && result.averageEvidenceScore < 0.42;
  const evCount = result.success ? Math.min(result.evidence.length, 6) : 0;
  return (
    <div className={`verdict-sanctum ev-count-${evCount}`}>
      {!result.success && (
        <div className="verdict-error" role="alert">
          <p>{result.error ?? 'المستودعات المعرفية لا تستجيب.'}</p>
        </div>
      )}
      {isUncertain && (
        <div className="verdict-uncertainty" role="status">
          <span className="vu-sigil" aria-hidden="true">◌</span>
          <p className="vu-text">الأدلة الحالية لا تكفي لنتيجة قاطعة — هذه المسألة لا تزال قيد الفحص</p>
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
                <span className="taxonomy-title">نتائج البحث — انقر للمزيد من التفاصيل</span>
                <span className="taxonomy-rule" />
              </div>
              <EvidenceCategory titleAr="أدلة وبيانات"        type="supported"  items={b.supported}  domain={activeDomain} onSelect={onEvidenceSelect} />
              <EvidenceCategory titleAr="روايات وسياقات"       type="narratives" items={b.narratives} domain={activeDomain} onSelect={onEvidenceSelect} />
              <EvidenceCategory titleAr="مواد تحتاج مراجعة"   type="disputed"   items={b.disputed}   domain={activeDomain} onSelect={onEvidenceSelect} />
              <EvidenceCategory titleAr="بيانات أولية"         type="unverified" items={b.unverified} domain={activeDomain} onSelect={onEvidenceSelect} />
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
            onDemand={onDemand}
            composingDemand={composingDemand}
            demandNotice={demandNotice}
            onSceneStructure={onSceneStructure}
            composingScenes={composingScenes}
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
  const { goTo } = useConstitutionalNavigation();

  // ── Chamber Init ─────────────────────────────────────────────────
  const [chamberInit, setChamberInit] = useState<ChamberInit>('awakening');
  const [tongue, setTongue]           = useState<AzmaTongue | null>(() => getStoredTongue());

  // ── Citizen Memory ────────────────────────────────────────────────
  const [citizenMemory, setCitizenMemory] = useState<CitizenMemory>(() => readMemory());

  // ── Investigation State ──────────────────────────────────────────
  const [phase, setPhase]             = useState<Phase>('idle');
  const [invStage, setInvStage]       = useState<InvStage>('idle');
  const [query, setQuery]             = useState('');
  /**
   * ─── HEARING, AND THE REVIEW BEFORE SENDING ───────────────────────────
   *
   *   MEASURED 2026-09-24: this chamber contained no microphone and no
   *   SpeechRecognition of any kind. «محادثة» and «سكوت» were names for
   *   visual modes, not for sound — so the Founder's difficulty speaking to
   *   the chamber was not misuse; the instrument did not exist.
   *
   *   The Empire already owns one, in useVoiceMode, and it is extended here
   *   rather than written again. What it hears lands in the question field
   *   and is shown BEFORE anything is sent: recognition mishears, and a
   *   chamber that investigates a misheard question wastes the Creator's
   *   minute and its own evidence. Nothing is submitted that was not read.
   */
  // `isHearing` already means a court hearing in this chamber. The microphone
  // is a different thing entirely and takes a different name.
  /**
   * ─── WHAT THE CREATOR BROUGHT IN WITH THEM ────────────────────────────
   *
   *   MEASURED 2026-09-25 at the Founder's report: crossing from the Vault
   *   carrying a kept investigation, the envelope was read, deleted on the
   *   spot, and spent on a companion line — «كنز القصر ينتظر». The material
   *   itself never appeared anywhere on the page. The same disease the
   *   Hujjah→Qiyamah crossing had: the envelope is consumed and the work
   *   evaporates at the door.
   *
   *   It is held now, shown, and answered with what can be done to it —
   *   because a Creator who walks in holding something must be met by a
   *   Chamber that can see it.
   */
  const [arrived, setArrived] = useState<{ titleAr: string; preview: string } | null>(null);
  const [isMicOpen, setIsMicOpen]     = useState(false);
  const [heardNotice, setHeardNotice] = useState<string | null>(null);
  // No default domain. The five are equal — «كلهم مجالات متساوية الأهمية ولا
  // يوجد مجال منهم أهم من الآخر» — and each has its own research path and its
  // own kinds of evidence. A silent fallback to «ديني» meant a doctor's first
  // question was put to the collections of the Sunnah, and that is the chamber
  // choosing on the Creator's behalf. Null until they say.
  const [activeDomain, setActiveDomain] = useState<DomainId | null>(
    () => getPreferredDomain(readMemory()) ?? null,
  );

  // The domain a result was actually searched in. A verdict describes the
  // search that produced it, not whichever card happens to be lit now.
  const [resultDomain, setResultDomain] = useState<DomainId | null>(null);
  /**
   * The domain the screen is currently describing.
   *
   * Everything that renders evidence sits downstream of a completed search, so
   * the domain that search ran in is the truthful answer; the chosen card
   * covers the moment before one has run. There is no third case, because a
   * search cannot start without a domain.
   */
  const shownDomainOf = (searched: DomainId | null, chosen: DomainId | null): DomainId =>
    searched ?? chosen ?? 'culture';

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
  /**
   * The sovereign identity of this investigation once it is kept in the
   * Vault — the assetId the deposit returned. Null until deposited. It is
   * what crosses into Qiyamah: an identity the receiving Chamber resolves
   * through the Vault's own ownership boundary, never the material itself.
   */
  const vaultAssetIdRef         = useRef<string | null>(null);
  const lastDepositFailureRef   = useRef<string | null>(null);

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
  /** Which Creation Demand is being composed, and why one could not be. */
  const [composingDemand, setComposingDemand]   = useState<DemandDestination | null>(null);
  /** The ordered scenes this Chamber wrote, and whether it is writing them. */
  const [composingScenes, setComposingScenes]   = useState(false);
  const [demandNotice,    setDemandNotice]      = useState<string | null>(null);

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
      () => showCompanion('حجرة المعرفة جاهزة. الاستكشاف لا يُستعجل.'),
      idleDelayRef.current,
    );
  }, [showCompanion]);

  // ── Chamber Awakening Effect ──────────────────────────────────────
  useEffect(() => {
    // Imperial Continuity: consume the InteractionSession the Foyer wrote
    // before departing. If it resolved (RESOLVED), the first companion
    // message acknowledges the journey instead of the default greeting.
    const foyerRaw = typeof window !== 'undefined'
      ? sessionStorage.getItem('azma.kernel.session') : null;
    if (foyerRaw) sessionStorage.removeItem('azma.kernel.session');
    const foyerResolved = foyerRaw
      ? (() => { try { const s = JSON.parse(foyerRaw) as { status?: string }; return s?.status === 'RESOLVED'; } catch { return false; } })()
      : false;

    // IMPERIAL JOURNEY CONTINUITY — Package D:
    // Consume treasure context written by the Vault Palace when directing
    // the Creator to Hujjah via a treasure-path navigation.
    const treasureRaw = typeof window !== 'undefined'
      ? sessionStorage.getItem('azma.transfer.treasure') : null;
    if (treasureRaw) {
      sessionStorage.removeItem('azma.transfer.treasure');
      sessionStorage.removeItem('azma.transfer.origin');
    }

    // The envelope is journey state — read once, removed once. What it named
    // is kept, so the Chamber can show the Creator their own work rather than
    // a sentence about it. Parsed here (pure), applied with the rest of the
    // opening below — never as a synchronous setState inside an effect.
    let arrivedFromVault: { titleAr: string; preview: string } | null = null;
    if (treasureRaw) {
      try {
        const payload = JSON.parse(treasureRaw) as { titleAr?: string; preview?: string };
        const titleAr = typeof payload.titleAr === 'string' ? payload.titleAr.trim() : '';
        if (titleAr.length > 0) {
          arrivedFromVault = {
            titleAr,
            preview: typeof payload.preview === 'string' ? payload.preview.trim() : '',
          };
        }
      } catch { /* a malformed envelope names nothing; the Chamber stays as it was */ }
    }

    const stored   = getStoredTongue();
    const mem      = readMemory();
    const quiet    = isQuietMode(mem);
    const greeting = getReturnGreeting(mem, CHAMBER_INITIATIONS[stored ?? 'conversation']);
    // Rhythm-adapted greeting delay: hesitant citizens get more space before companion appears
    const greetDelay = getRhythmProfile(mem) === 'hesitant' ? 700
                     : getRhythmProfile(mem) === 'confident' ? 200
                     : 400;
    const t = setTimeout(() => {
      if (arrivedFromVault) setArrived(arrivedFromVault);
      if (stored) {
        setTongue(stored);
        setChamberInit('active');
        if (!quiet) {
          const firstMsg = treasureRaw
            ? 'كنز القصر ينتظر — الحجة الدامغة تكشف ما بداخله'
            : foyerResolved
              ? 'الإمبراطورية أعدّت هذه الجلسة — حجرة المعرفة تنتظر سؤالك'
              : greeting;
          setTimeout(() => showCompanion(firstMsg), greetDelay);
        }
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

  // BF cache recovery: if Chrome restores this page from bfcache while
  // isExiting=true (chamber-sealing opacity 0), the Creator sees a permanent
  // black screen. Reset exit state on restoration so the chamber is visible.
  useEffect(() => {
    function handlePageShow(e: PageTransitionEvent) {
      if (e.persisted) setIsExiting(false);
    }
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
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
    setResultDomain(domain);
    const trimmed = q.trim();
    if (!trimmed || phaseRef.current === 'examining' || phaseRef.current === 'stillness') return;

    // Reset hearing + session-level trackers
    if (hearingTimerRef.current) { clearTimeout(hearingTimerRef.current); hearingTimerRef.current = null; }
    setCitizenStance(null);
    setCourtQuestionsState([]);
    setShowCourtQuestions(false);
    sessionExpandedRef.current    = false;
    sessionVaultedRef.current     = false;
    vaultAssetIdRef.current       = null;
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

    // Skip hearing phase — show results directly
    setPhase('hearing');
    phaseRef.current = 'hearing';
    showCompanion('حجرة المعرفة تبلور النتائج…');
    void proceedToVerdict(dto, trimmed, domain);
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

  /** The Creator has not yet said which kind of question this is. */
  function askForDomain() {
    showCompanion('اختر مجال بحثك أولاً — لكل مجال مسارُه وأدلتُه.');
    setTimeout(() => {
      document.querySelector('.archive-domain, .margin-domain-btn')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!activeDomain) { askForDomain(); return; }
    await handleSubmitQuery(query, activeDomain);
  }

  // ── Voice Transcript ──────────────────────────────────────────────
  const handleVoiceTranscript = useCallback((text: string) => {
    setQuery(text);
    if (!activeDomain) { askForDomain(); return; }
    setTimeout(() => { void handleSubmitQuery(text, activeDomain); }, 50);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDomain]);

  // ── Conversation Query Change — hesitation observation ────────────
  /** What the chamber heard goes into the field the Creator can still edit. */
  const receiveTranscript = (text: string) => {
    const heard = text.trim();
    setIsMicOpen(false);
    if (heard.length === 0) {
      setHeardNotice('لم أسمع شيئاً — حاول مرّةً أخرى.');
      return;
    }
    setQuery(heard);
    setHeardNotice('هذا ما سمعته — راجعه ثمّ ابدأ التحقيق.');
  };

  const voice = useVoiceMode(true, receiveTranscript, 'ar-SA');

  const handleHear = () => {
    setHeardNotice(null);
    if (!voice.isSupported) {
      setHeardNotice('متصفّحك لا يدعم الاستماع. اكتب سؤالك.');
      return;
    }
    setIsMicOpen(true);
    voice.startListening();
  };

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
      if (!activeDomain) { askForDomain(); return; }
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

  /**
   * Keep a piece of evidence — in the Vault, not in the tab.
   *
   * This wrote to sessionStorage inside a try/catch that swallowed the error,
   * then said «محفوظ في الخزانة» unconditionally. The evidence died when the
   * tab closed and the Creator was told otherwise twice over. It now goes
   * through the Vault boundary every other chamber deposits through, and the
   * Creator is told what actually happened — including when it did not.
   */
  async function handleSaveEvidenceToVault(ev: EvidenceItemDTO) {
    const outcome = await depositEvidenceToVault(ev.extractedText, ev.attributionAr, query);
    showCompanion(outcome.ok ? COMPANION_MSGS.vaultSaved : (outcome.reasonAr ?? COMPANION_MSGS.vaultFailed));
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
    if (!activeDomain) { askForDomain(); return; }
    setTimeout(() => { void handleSubmitQuery(expandQuery, activeDomain); }, 80);
  }

  /**
   * Keep the whole investigation.
   *
   * The sessionStorage write below is a HANDOFF, not a save — Vault Palace and
   * Qiyamah read that key once on arrival and delete it — and it was the only
   * thing this did while telling the Creator it was «محفوظ في الخزانة». The
   * handoff stays, because the next chamber genuinely needs it. What is new is
   * that the file is now actually kept, and the Creator is told the truth
   * either way.
   */
  async function handleSaveVault() {
    if (!result) return;
    sessionVaultedRef.current = true;
    const assetId = await ensureKeptInVault();
    setSavedToVault(assetId !== null);
    showCompanion(assetId !== null ? COMPANION_MSGS.vaultSaved : (lastDepositFailureRef.current ?? COMPANION_MSGS.vaultFailed));
  }

  /**
   * Keep the investigation in the Vault ONCE and answer with its identity.
   *
   * Both the «حفظ في الخزانة» button and the crossing into Qiyamah come here,
   * so a Creator who saves and then crosses does not deposit twice, and a
   * Creator who crosses without saving still leaves sovereign material behind
   * them — the only kind the next Chamber can resolve. The envelope written
   * to sessionStorage carries the identity and a summary for the Vault's
   * arrival ceremony; it carries no evidence, because evidence lives in the
   * asset, under the Creator's ownership, where a refresh cannot lose it.
   */
  async function ensureKeptInVault(): Promise<string | null> {
    if (!result) return null;
    if (vaultAssetIdRef.current) return vaultAssetIdRef.current;

    const outcome = await depositInvestigationToVault(query, result.synthesizedAnswer, result.evidence);
    if (!outcome.ok || !outcome.assetId) {
      lastDepositFailureRef.current = outcome.reasonAr ?? null;
      return null;
    }
    vaultAssetIdRef.current = outcome.assetId;
    try {
      sessionStorage.setItem('azma.transfer.investigation', JSON.stringify({
        assetId: outcome.assetId,
        questionAr: query.trim(),
        evidenceCount: result.evidence.length,
        averageScore: result.averageEvidenceScore,
        timestamp: Date.now(),
        sessionNumber: sessionCount,
      }));
    } catch { /* the asset is kept either way; only the arrival ceremony is lost */ }
    return outcome.assetId;
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
    setTimeout(() => { void proceedToVerdict(result, query.trim(), shownDomain); }, 900);
  }

  function handleProceedToVerdict() {
    if (!result) return;
    void proceedToVerdict(result, query.trim(), shownDomain);
  }

  // ── Appeal — Article VIII ─────────────────────────────────────────
  function handleAppeal() {
    if (!result || !query.trim()) return;
    const appealQ = `بحث معمّق في: ${query.trim()}`;
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
    if (!activeDomain) { askForDomain(); return; }
    setTimeout(() => { void handleSubmitQuery(appealQ, activeDomain); }, 300);
  }

  function handleChallengeVerdict() {
    if (!result || !query.trim()) return;
    const challengeQ = `زاوية مختلفة في: ${query.trim()}`;
    setQuery(challengeQ);
    setResult(null);
    setSavedToVault(false);
    setShowProbing(false);
    setShowCuriosity(false);
    setEvidenceGroups({});
    setPhase('idle');
    phaseRef.current = 'idle';
    showCompanion('الحجرة تعيد الفحص من زاوية مختلفة…');
    if (!activeDomain) { askForDomain(); return; }
    setTimeout(() => { void handleSubmitQuery(challengeQ, activeDomain); }, 300);
  }

  /**
   * Leave carrying a demand, not only a question.
   *
   * The demand is composed and kept BEFORE the crossing, exactly as the
   * investigation is: material that evaporates at the door is not material.
   * Only its identity travels, and the destination travels with it so the
   * receiving Chamber knows the demand was addressed to it.
   *
   * If composition fails the Creator stays here with their result intact and
   * is told why. Nothing invented is ever crossed with.
   */
  async function handleCreationDemand(destination: DemandDestination) {
    if (!result || composingDemand) return;
    setComposingDemand(destination);
    setDemandNotice(null);
    try {
      // The investigation is kept first, so the demand can name the evidence
      // that justifies it — provenance, not a loose sentence.
      const investigationAssetId = await ensureKeptInVault();
      const outcome = await composeCreationDemandToVault(
        destination,
        query.trim(),
        result.synthesizedAnswer,
        result.evidence,
        investigationAssetId,
      );
      if (!outcome.ok || !outcome.assetId) {
        setDemandNotice(outcome.reasonAr ?? 'تعذّرت صياغة المطالبة.');
        return;
      }
      setSavedToVault(investigationAssetId !== null);
      try {
        sessionStorage.setItem('azma.transfer.demand', JSON.stringify({
          assetId: outcome.assetId,
          destination,
        }));
      } catch { /* the demand is kept either way; only the crossing's shortcut is lost */ }
      await handleCinematicExit(DESTINATION_ROUTE[destination]);
    } finally {
      setComposingDemand(null);
    }
  }

  /**
   * Write the scenes, then cross to the Chamber that produces them.
   *
   * The Founder's ruling: الحُجّة الدامغة writes the decomposition, رأس الأمر
   * produces and assembles it. So the scenes are composed and kept BEFORE the
   * crossing — a structure that evaporates at the door is not a structure —
   * and only the storyboard's identity travels.
   */
  async function handleSceneStructure() {
    if (!result || composingScenes) return;
    setComposingScenes(true);
    setDemandNotice(null);
    try {
      const investigationAssetId = await ensureKeptInVault();
      const outcome = await composeStoryboardDemand(
        query.trim(),
        result.synthesizedAnswer,
        result.evidence,
        investigationAssetId,
      );
      if (!outcome.ok || !outcome.storyboardId) {
        setDemandNotice(outcome.reasonAr ?? 'تعذّر تفكيك الموضوع إلى مشاهد.');
        return;
      }
      setSavedToVault(investigationAssetId !== null);
      try {
        sessionStorage.setItem('azma.transfer.storyboard', JSON.stringify({
          storyboardId: outcome.storyboardId,
          sceneCount: outcome.scenes?.length ?? 0,
          questionAr: query.trim(),
        }));
      } catch { /* the scenes are kept either way; only the crossing's shortcut is lost */ }
      await handleCinematicExit('/ras-amr');
    } finally {
      setComposingScenes(false);
    }
  }

  async function handleCinematicExit(destination: string) {
    // Crossing into Qiyamah with an investigation: the material must be
    // sovereign BEFORE the crossing. Until 2026-09-22 this wrote the evidence
    // itself into sessionStorage, and Qiyamah read it, deleted it, and showed
    // a companion message — the material evaporated at the door. Now the
    // investigation is kept in the Vault (once) and only its identity
    // travels. If it cannot be kept, the Creator stays here with their
    // result intact and is told why: a crossing that loses the work is not
    // a crossing.
    if (destination === '/qiyamah-chamber' && result) {
      const assetId = await ensureKeptInVault();
      if (assetId === null) {
        showCompanion(lastDepositFailureRef.current ?? COMPANION_MSGS.vaultFailed);
        return;
      }
      setSavedToVault(true);
      try { sessionStorage.setItem('azma.transfer.origin', 'hujjah-al-damighah'); } catch { /* ignore */ }
    }
    // IMPERIAL JOURNEY CONTINUITY — Package D: when returning to the Foyer,
    // write return context so the Foyer can acknowledge the Creator's return.
    if (destination === '/imperial-foyer') {
      try { sessionStorage.setItem('azma.return.session', JSON.stringify({ origin: 'hujjah-al-damighah', constitutionalAct: 'investigation' })); } catch { /* ignore */ }
    }
    showCompanion(COMPANION_MSGS.departure);
    setIsExiting(true);
    setTimeout(() => goTo(destination), 720);
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
  const shownDomain = shownDomainOf(resultDomain, activeDomain);
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
    activeDomain: shownDomain,
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
    onTransferQiyamah: () => { void handleCinematicExit('/qiyamah-chamber'); },
    onDemand:          (d: DemandDestination) => { void handleCreationDemand(d); },
    onSceneStructure:  () => { void handleSceneStructure(); },
    composingScenes,
    composingDemand,
    demandNotice,
    onSaveVault:       handleSaveVault,
    savedToVault,
  };

  // ── Shared gateway (all modes) ────────────────────────────────────
  const sharedGateway = (
    <EvidenceGateway
      evidence={selectedEvidence}
      domain={shownDomain}
      query={query}
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

      <ChamberDemonstration
        chamberId="hujjah-al-damighah"
        outcomeAr="جوابٌ مُسنَدٌ بأدلّته مرتّبةً بحُجّيتها — ومطالبةٌ إنشائيّةٌ تعبر بها إلى حجرةٍ تصنع."
        stepsAr={[
            'اختر كيف تُحادث الحجرة، ثمّ اختر مجال سؤالك — فلكلّ مجالٍ أدلّته.',
            'اسأل بالكتابة أو بصوتك، وراجع ما سُمع قبل الإرسال.',
            'ابدأ التحقيق، واقرأ الجواب بالصياغة التي تناسبك.',
            'اخرج بمطالبةٍ إنشائيّة، أو احفظ التحقيق في خزانتك.',
        ]}
      />
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
            <div className="awakening-seal">✦</div>
            <p className="awakening-breath">حجرة المعرفة تستيقظ</p>
          </div>
        </div>
      )}

      {/* ── AZMA Tongue Selector ─────────────────────────────────── */}
      {chamberInit === 'tongue-sel' && (
        <div className="tongue-selector" role="dialog" aria-label="اختر أسلوب التواصل مع الحجرة">
          <div className="tongue-selector-inner">
            <div className="tongue-header">
              <span className="tongue-crown-glyph" aria-hidden="true">✦</span>
              <h2 className="tongue-title">كيف تريد أن نتواصل؟</h2>
              <p className="tongue-subtitle">الحجرة تتكيف معك — لا معك تتكيف معها</p>
              <p className="tongue-mandate">اطرح سؤالاً في أي مجال — علمي، تاريخي، طبي، ثقافي — وستجري الحجرة تحقيقاً حقيقياً مدعوماً بأدلة</p>
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
              context="hujjah-al-damighah"
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
              <button className="sovereign-exit-btn" onClick={() => handleCinematicExit('/imperial-foyer')}>
                ⮜ قلب الإمبراطورية
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
                <div className="archive-domains-prompt">
                  {activeDomain
                    ? 'مجال بحثك — لكلٍّ مسارُه وأدلتُه'
                    : 'اختر مجال بحثك — خمسة مجالات متساوية، ولكلٍّ مسارُه وأدلتُه'}
                </div>
                <div className={`archive-domains ${activeDomain ? '' : 'archive-domains-awaiting'}`}>
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
                      const layer = resolveKnowledgeLayer(ev, shownDomain);
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
                          <span className="archive-record-score" title="مطابقة النص للسؤال — لا حكم على حجّيته">مطابقة {Math.round(ev.confidenceScore * 100)}%</span>
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
                  <span className="frieze-glyph" aria-hidden="true">✦</span>
                  <span className="frieze-title">حجرة المعرفة السيادية</span>
                  <span className="frieze-glyph" aria-hidden="true">✦</span>
                  <span className="frieze-rule" aria-hidden="true" />
                </div>

                {/* Dialogue Podium — no chatbot patterns */}
                {/* What the Creator carried in from their Vault: shown, then
                    answered with what the Chamber can actually do to it. Each
                    control writes into the question field — the Creator stays
                    the one who decides, and nothing is investigated until they
                    press «ابدأ التحقيق». */}
                {arrived && (
                  <div className="arrived-work" data-testid="hujjah-arrived">
                    <div className="arrived-head">
                      <span className="arrived-tag">جئتَ من خزانتك بهذا</span>
                      <button
                        type="button"
                        className="arrived-dismiss"
                        onClick={() => setArrived(null)}
                        aria-label="أغلق"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="arrived-title">{arrived.titleAr}</p>
                    {arrived.preview && <p className="arrived-preview">{arrived.preview}</p>}
                    <span className="arrived-ask">ماذا تريد أن تفعل به؟</span>
                    <div className="arrived-actions">
                      <button
                        type="button"
                        className="arrived-btn"
                        onClick={() => { handleConversationQueryChange(arrived.titleAr); setArrived(null); }}
                      >
                        استكمل التحقيق فيه
                      </button>
                      <button
                        type="button"
                        className="arrived-btn"
                        onClick={() => { handleConversationQueryChange(`${arrived.titleAr} — من زاويةٍ أخرى`); setArrived(null); }}
                      >
                        أعد صياغته
                      </button>
                      <button
                        type="button"
                        className="arrived-btn"
                        onClick={() => { handleConversationQueryChange(`${arrived.titleAr} — ما الذي فاتني فيه؟`); setArrived(null); }}
                      >
                        وسّع أدلّته
                      </button>
                      <button
                        type="button"
                        className="arrived-btn arrived-btn-quiet"
                        onClick={() => setArrived(null)}
                      >
                        اتركه واسأل سؤالاً جديداً
                      </button>
                    </div>
                  </div>
                )}

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
                      placeholder="اسألني عن أي موضوع — علمي، تاريخي، طبي، ثقافي، فلسفي…"
                      aria-label="حوار المحكمة"
                      rows={2}
                    />
                    <div className="dialogue-meta">
                      {isExamining ? (
                        <>
                          <span className="dialogue-stage-hint">
                            {invStage === 'receiving'    ? 'استقبال…'
                            : invStage === 'collecting'  ? 'تحقيق…'
                            : invStage === 'classifying' ? 'أدلة…'
                            : 'معرفة…'}
                          </span>
                          <span className="dialogue-examining-pulse" aria-hidden="true" />
                        </>
                      ) : (
                        // MEASURED by the Founder, entering the chamber 2026-09-24:
                        // there was no submit control at all — only this hint, which
                        // also carried the Latin word «Shift» onto an Arabic screen.
                        // A Creator who did not know that Enter submits stood in front
                        // of a field that looked broken. The chamber now says what it
                        // will do, and what it will cost in time.
                        <span className="dialogue-key-hint">
                          التحقيق يمرّ بأربع مراحل · يستغرق عادةً أقلّ من دقيقة
                        </span>
                      )}
                    </div>

                    {heardNotice && (
                      <p className="dialogue-heard-notice" aria-live="polite">{heardNotice}</p>
                    )}

                    <div className="dialogue-commit">
                      <button
                        type="button"
                        className={`dialogue-mic-btn ${isMicOpen ? 'mic-open' : ''}`}
                        onClick={handleHear}
                        disabled={isExamining || isMicOpen}
                        aria-label="اسأل بصوتك — يُعرض ما سُمع قبل الإرسال"
                        data-testid="hujjah-mic"
                      >
                        <span aria-hidden="true">◉</span>
                        {isMicOpen ? 'أسمعك…' : 'اسأل بصوتك'}
                      </button>
                      {query.trim().length > 0 && !isExamining && (
                        <button
                          type="button"
                          className="dialogue-clear-btn"
                          onClick={() => { handleConversationQueryChange(''); setHeardNotice(null); }}
                        >
                          امسح
                        </button>
                      )}
                      <button
                        type="submit"
                        className="dialogue-begin-btn"
                        disabled={isExamining || query.trim().length === 0}
                        data-testid="hujjah-begin"
                      >
                        {isExamining ? 'التحقيق جارٍ…' : 'ابدأ التحقيق ⟵'}
                      </button>
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
                      <div className="csf-sigil" aria-hidden="true">✦</div>
                      <p className="csf-utterance">{chamberGreeting}</p>
                    </div>
                  )}

                  {phase === 'examining' && (
                    <div className="court-deliberating" aria-live="polite" aria-atomic="true">
                      <div className="deliberation-ring" aria-hidden="true" />
                      <p className="deliberation-stage-label">
                        {invStage === 'receiving'    && 'الإمبراطورية تستقبل طلبك وتفهم مقصدك…'}
                        {invStage === 'collecting'   && 'الحجرة تحقق في عمق المعرفة…'}
                        {invStage === 'classifying'  && 'الأدلة تُوزن وتُصنَّف…'}
                        {invStage === 'deliberating' && 'الإمبراطورية تبلور ما تعلمته…'}
                        {invStage === 'idle'         && 'الحجرة تعمل…'}
                      </p>
                      <p className="deliberation-inscription">حجرة المعرفة تعمل…</p>
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
                  <div className="margin-domains-prompt">
                    {activeDomain ? 'مجال بحثك' : 'اختر مجال بحثك'}
                  </div>
                  <div className={`margin-domains ${activeDomain ? '' : 'margin-domains-awaiting'}`}>
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
                        <div className="margin-ev-label">أدلة البحث</div>
                        {top.map((ev) => {
                          const layer = resolveKnowledgeLayer(ev, shownDomain);
                          return (
                            <button
                              key={ev.id}
                              className="margin-ev-item"
                              onClick={() => handleEvidenceSelect(ev)}
                            >
                              <span className={`mev-tier tier-${layer.tier}`}>{layer.labelAr}</span>
                              <span className="mev-text">{ev.extractedText.slice(0, 60)}…</span>
                              {ev.attributionAr && <span className="mev-source">{sourceLineOf(ev)}</span>}
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
                          ✦ استكشاف
                        </button>
                      )}
                      {isExamining && (
                        <span className="writing-examining" aria-live="polite">
                          <span className="seal-spinner" aria-hidden="true" />
                          الحجرة تعمل…
                        </span>
                      )}
                    </div>
                  </form>
                  {phase === 'examining' && (
                    <div className="writing-deliberating" aria-live="polite">
                      <div className="deliberation-ring" aria-hidden="true" />
                      <p className="deliberation-stage-label">
                        {invStage === 'receiving'    && 'الإمبراطورية تستقبل طلبك وتفهم مقصدك…'}
                        {invStage === 'collecting'   && 'الحجرة تحقق في عمق المعرفة…'}
                        {invStage === 'classifying'  && 'الأدلة تُوزن وتُصنَّف…'}
                        {invStage === 'deliberating' && 'الإمبراطورية تبلور ما تعلمته…'}
                        {invStage === 'idle'         && 'الحجرة تعمل…'}
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
                    {invStage === 'receiving'    ? 'استقبال…'
                    : invStage === 'collecting'  ? 'تحقيق…'
                    : invStage === 'classifying' ? 'أدلة…'
                    : 'معرفة…'}
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

              {/* Verdict */}
              {hasVerdict && result?.success && (
                <div className="silent-verdict custom-scroll">
                  {result.evidence.length > 0 && (() => {
                    const b = bucketEvidence(result);
                    const cards = [...b.supported, ...b.narratives, ...b.disputed].slice(0, 8);
                    return cards.length > 0 ? (
                      <div className="silent-evidence-board">
                        {cards.map((ev) => {
                          const layer = resolveKnowledgeLayer(ev, shownDomain);
                          return (
                            <button
                              key={ev.id}
                              className={`silent-ev-card sev-${layer.tier}`}
                              onClick={() => handleEvidenceSelect(ev)}
                            >
                              <span className="sev-tier">{layer.labelAr}</span>
                              <p className="sev-text">{ev.extractedText.slice(0, 80)}</p>
                              {ev.attributionAr && <span className="sev-source">{sourceLineOf(ev)}</span>}
                              <span className="sev-score" title="مطابقة النص للسؤال — لا حكم على حجّيته">مطابقة {Math.round(ev.confidenceScore * 100)}%</span>
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
