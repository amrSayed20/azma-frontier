'use client';

/**
 * AZMA OS — RAS AL AMR: THE TEMPLATE SHELF, INSIDE THE SCENE LIST.
 *
 * «أنشئ لوحة معاينة حقيقية داخل قائمة المشاهد» — the Founder, 2026-11-09.
 *
 * Not a page, not a screen, not a card with a name on it. A shelf that opens
 * where the Creator is already working, shows each template's REAL positions
 * filled with their OWN Vault assets, and writes the shape into the project
 * they have open — leaving them exactly where they were, with more scenes.
 *
 * ─── THE THREE HONESTIES ────────────────────────────────────────────────────
 *
 *   · A clip is PLAYED, never shown as a still — a frozen frame of a clip is
 *     a lie about what it is.
 *   · An empty position SAYS it is empty. Nothing is invented for it.
 *   · The timing shown is the template's own: each position's seconds and the
 *     join between them, not a decoration.
 */
import React, { useMemo, useState } from 'react';
import type { VaultAsset } from '@/src/vault/sovereign-vault-types';
import { CapabilityTarget } from '@/src/core/sovereign-orchestrator/qiyamah-intent-types';
import { fillTemplateSlots, filledSlotCount } from '@/src/chambers/ras-al-amr/template-fill';
import {
  adoptionSceneCount, adoptionCuedCount, type AdoptableTemplate,
} from '@/src/chambers/ras-al-amr/template-adoption';

export interface TemplateShelfProps {
  readonly templates: readonly AdoptableTemplate[];
  /** Newest first — a Creator sees what they were just looking at. */
  readonly vault: readonly VaultAsset[];
  /** Writes the template's scenes into the project that is open. */
  readonly onAdopt: (template: AdoptableTemplate) => void;
  /** True while a picture is being made: adopting mid-production is refused. */
  readonly busy: boolean;
}

function totalSeconds(t: AdoptableTemplate): number {
  return t.slotDurations.reduce((a, b) => a + b, 0);
}

export default function TemplateShelf({ templates, vault, onAdopt, busy }: TemplateShelfProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = useMemo(
    () => templates.find((t) => t.id === openId) ?? null,
    [templates, openId],
  );
  const slots = useMemo(
    () => (open ? fillTemplateSlots(open.slotDurations.length, vault) : []),
    [open, vault],
  );

  if (templates.length === 0) return null;

  return (
    <section className="sb-shelf" aria-label="القوالب">
      <header className="sb-shelf-head">
        <h3 className="sb-shelf-title">ابدأ من قالب</h3>
        <p className="sb-shelf-lede">
          القالب يُحدِّد عددَ المشاهد ومُدَّتها وكيف تتّصل. اختَرْ واحدًا لتراه بأصولك قبل أن تعتمده.
        </p>
      </header>

      <ul className="sb-shelf-list">
        {templates.map((t) => (
          <li key={t.id}>
            <button
              className={`sb-shelf-item${openId === t.id ? ' is-open' : ''}`}
              onClick={() => setOpenId(openId === t.id ? null : t.id)}
              aria-expanded={openId === t.id}
            >
              <span className="sb-shelf-name">{t.name}</span>
              <span className="sb-shelf-meta">
                {`${adoptionSceneCount(t).toLocaleString('ar-EG')} مشاهد · ${totalSeconds(t).toLocaleString('ar-EG')} ث`}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {open && (
        <div className="sb-shelf-preview">
          <p className="sb-shelf-fill">
            {filledSlotCount(slots) === 0
              ? 'مواضعُ هذا القالب فارغة — خزانتُك لا تحمل صورةً بعد.'
              : `${filledSlotCount(slots).toLocaleString('ar-EG')} من ${slots.length.toLocaleString('ar-EG')} مواضعَ من خزانتك أنت.`}
          </p>

          <ol className="sb-shelf-slots">
            {slots.map((slot, i) => {
              const seconds = open.slotDurations[i] ?? 0;
              const joins = i > 0 ? (open.transitionPreference === 'crossfade' ? 'تلاشٍ' : 'قطع') : 'بداية';
              const isMotion = slot.asset?.capabilityTarget === CapabilityTarget.MOTION;
              return (
                <li key={slot.index} className={slot.isPlaceholder ? 'is-empty' : ''}>
                  <div className="sb-shelf-frame">
                    {slot.asset && isMotion && (
                      <video
                        className="sb-shelf-media"
                        src={slot.asset.secureStorageUri}
                        muted
                        loop
                        playsInline
                        autoPlay
                        aria-label={open.slotRoles?.[i] ?? `موضع ${i + 1}`}
                      />
                    )}
                    {slot.asset && !isMotion && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        className="sb-shelf-media"
                        src={slot.asset.secureStorageUri}
                        alt={`${open.slotRoles?.[i] ?? `موضع ${i + 1}`} — من خزانتك`}
                      />
                    )}
                    {!slot.asset && <span className="sb-shelf-empty">موضعٌ فارغ</span>}
                  </div>
                  <span className="sb-shelf-role">{open.slotRoles?.[i] ?? `موضع ${i + 1}`}</span>
                  <span className="sb-shelf-time">{`${seconds.toLocaleString('ar-EG')} ث · ${joins}`}</span>
                </li>
              );
            })}
          </ol>

          <p className="sb-shelf-note">
            {adoptionCuedCount(open) > 0
              ? `${adoptionCuedCount(open).toLocaleString('ar-EG')} من المشاهد تبدأ بوصفٍ جاهزٍ تُعدّله كما تشاء.`
              : 'ستكتُب وصفَ كلِّ مشهدٍ بنفسك بعد الاعتماد.'}
          </p>

          <div className="sb-shelf-actions">
            {/* Adoption adds scenes to the project that is OPEN. It never
                leaves the workshop and never replaces existing work — one
                step back removes exactly what it added. */}
            <button
              className="sb-btn sb-btn-primary"
              disabled={busy}
              onClick={() => { onAdopt(open); setOpenId(null); }}
            >
              {`اعتمِدْ هذا القالب — يُضيف ${adoptionSceneCount(open).toLocaleString('ar-EG')} مشاهد`}
            </button>
            <button className="sb-btn sb-btn-ghost" onClick={() => setOpenId(null)}>أغلِق</button>
          </div>
        </div>
      )}
    </section>
  );
}
