'use client';

import React from 'react';
import type { DemandDestination } from '@/src/chambers/hujjah-al-damighah/sovereign-language-bridge';

interface Props {
  onContinue:        () => void;
  onExpand:          () => void;
  onChallenge:       () => void;
  onAppeal:          () => void;
  onTransferQiyamah: () => void;
  onSaveVault:       () => void;
  savedToVault:      boolean;
  /** Compose a Creation Demand for one Chamber, then cross carrying it. */
  onDemand:          (destination: DemandDestination) => void;
  /** Which demand is being composed right now, if any. */
  composingDemand:   DemandDestination | null;
  /** Why a demand could not be composed — the Chamber's real reason. */
  demandNotice:      string | null;
}

/**
 * Leaving with a demand, not only with a question.
 *
 * Until now a Creator finished an investigation and crossed carrying their own
 * question: the Chamber had no capability that turned a finding into a
 * statement of what should be made. These three doors are that capability's
 * face — one per destination, because a scene, a production arc and an
 * objective are different things and a single generic brief serves none.
 *
 * Composition happens before the crossing. If it fails, the Creator stays here
 * with their investigation intact and is told why: a door that loses the work
 * behind it is not a door.
 */
const DEMANDS: { destination: DemandDestination; label: string }[] = [
  { destination: 'qiyamah-chamber',  label: 'مطالبة للقيامة' },
  { destination: 'ras-amr',          label: 'مطالبة لرأس الأمر' },
  { destination: 'makman-al-ghayah', label: 'مطالبة لمكمن الغاية' },
];

export function InvestigationFile({
  onContinue, onExpand, onChallenge, onAppeal, onTransferQiyamah, onSaveVault, savedToVault,
  onDemand, composingDemand, demandNotice,
}: Props) {
  return (
    <div className="investigation-file">
      <div className="inv-file-crown">
        <span className="inv-file-tag">خيارات البحث</span>
        <span className="inv-file-dot">●</span>
        <span className="inv-file-status">حي</span>
      </div>

      <div className="inv-file-actions">
        <button className="inv-action inv-continue" onClick={onContinue}>
          متابعة التحقيق
        </button>
        <button className="inv-action inv-expand" onClick={onExpand}>
          توسيع الأدلة
        </button>
        <button className="inv-action inv-challenge" onClick={onChallenge}>
          زاوية مختلفة
        </button>
        <button className="inv-action inv-appeal" onClick={onAppeal}>
          بحث معمّق
        </button>
        <button
          className={`inv-action inv-vault ${savedToVault ? 'inv-saved' : ''}`}
          onClick={onSaveVault}
          disabled={savedToVault}
        >
          {savedToVault ? '✓ محفوظ في الخزانة' : 'حفظ في الخزانة'}
        </button>
        <button className="inv-action inv-qiyamah" onClick={onTransferQiyamah}>
          انتقال إلى القيامة
        </button>
      </div>

      <div className="inv-demand-block">
        <span className="inv-demand-tag">اخرج بمطالبةٍ جاهزة للإنشاء</span>
        {/* The Founder entered the chamber and asked how a Creation Demand is
            obtained. The three doors worked and said nothing about themselves —
            a capability without a written covenant. This is that covenant. */}
        <p className="inv-demand-explainer">
          هذه الحجرة تُحقّق ولا تُنشئ. المطالبة هي قولُ <strong>ما ينبغي أن يُصنَع</strong>،
          مبنيًّا على أدلّة تحقيقك وحدها — ثم تعبر بها إلى الحجرة التي تصنع.
          تُحفظ في خزانتك حاملةً معرّف هذا التحقيق، فتُردّ دائماً إلى ما يُبرّرها.
          ولكلّ حجرةٍ مطالبتها، لأنّ المشهد والقوسَ والهدفَ أشياءٌ مختلفة.
        </p>
        <div className="inv-demand-actions">
          {DEMANDS.map(({ destination, label }) => (
            <button
              key={destination}
              className="inv-action inv-demand"
              data-destination={destination}
              onClick={() => onDemand(destination)}
              disabled={composingDemand !== null}
            >
              {composingDemand === destination ? 'تُصاغ المطالبة…' : `⟡ ${label}`}
            </button>
          ))}
        </div>
        {demandNotice && <p className="inv-demand-notice">{demandNotice}</p>}
      </div>
    </div>
  );
}
