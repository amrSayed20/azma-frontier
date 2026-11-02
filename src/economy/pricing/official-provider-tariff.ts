/**
 * AZMA OS — تعريفةُ المزوِّدِ المنشورةُ رسميًّا: ما يُعلِنُه، لا ما قِسناه.
 *
 * ─── WHY THIS IS A THIRD KIND OF FACT, NOT A FOURTH AUTHORITY ───────────────
 *
 *   The Empire already holds two cost facts and they are both about the past:
 *
 *     `qiyamah-cost-truth.ts`      what we PAID, read from a production
 *     `provider-cost-catalog.ts`   what the gate's engine was told to assume
 *
 *   Neither can answer «what will the NEXT one cost, in a configuration we
 *   have never run?» — and that question decides money, because a provider
 *   whose price moves with resolution charges differently for two acts that
 *   look identical to us.
 *
 *   MEASURED 2026-11-03, from the provider's own published table: the Empire
 *   sends `resolution: '2k'` for the «إعلاني» style, and nano-banana-2 at 2K
 *   costs **150 credits**, not the 100 we had measured at 1K. Nothing in the
 *   repository knew that, because nothing had ever run a 2K image.
 *
 *   So this module records the PUBLISHED tariff, with its source and the date
 *   it was read. It never replaces a measurement — where we have measured a
 *   configuration, the measurement is the truth and this is its corroboration.
 *   Where we have not, this is what the next act will cost, published by the
 *   party that will charge us.
 *
 * ─── AND IT IS A COST, NEVER A PRICE ───────────────────────────────────────
 *
 *   No Creator is ever shown a figure from this file. It feeds exactly one
 *   thing: the Founder's own rule — «سعر المبدع بالوحدات = التكلفة الأصلية
 *   الفعلية للمزوّد بالوحدات × 1.70» — which `sovereign-price-authority.ts`
 *   applies. A number here that reached a browser would be a cost leak.
 */

/** Where every figure below was read, so a reader can check it themselves. */
export const TARIFF_SOURCE = {
  models: 'https://docs.magichour.ai/api-reference/models',
  imageModel: 'https://magichour.ai/api/nano-banana-2',
  resolutionLimits: 'https://docs.magichour.ai/billing/resolution-limits',
  readOn: '2026-11-03',
  readBy: 'Chief Engineer, under the closure order of 2026-11-03, section II.b',
} as const;

/**
 * A published cost, in the provider's own credits, for ONE unit of its own
 * unit — and for one named configuration of it.
 *
 * `dimension` is what the provider's price actually varies by. For an image
 * that is its resolution; for a video, the resolution of each second. Where a
 * provider's price does not vary, it is `null` and there is one row.
 */
export interface TariffEntry {
  readonly endpoint: string;
  readonly model: string | null;
  /** The configuration this figure belongs to, or null when the price is flat. */
  readonly dimension: string | null;
  readonly credits: number;
  /** What ONE of these credits buys. The unit is part of the price. */
  readonly unit: 'image' | 'second' | 'frame' | 'operation' | 'character';
  /** Which published page carries it. */
  readonly source: keyof typeof TARIFF_SOURCE;
}

/**
 * ─── THE PUBLISHED TABLE, FOR THE OPERATIONS THIS EMPIRE ACTUALLY PERFORMS ──
 *
 *   Only the endpoints and models the repository really calls. A tariff row
 *   for an endpoint we do not call would be a number nobody can be held to.
 */
export const OFFICIAL_TARIFF: readonly TariffEntry[] = [
  // ── Images: nano-banana-2, the Empire's one image model ─────────────────
  //
  //   Published as 100/150/200 credits per image at 1K/2K/4K. The 1K figure
  //   is the one we had already MEASURED on a real production, which is why
  //   the rest of the row is trustworthy: the published table agreed with our
  //   own invoice where the two could be compared.
  { endpoint: '/v1/ai-image-generator', model: 'nano-banana-2', dimension: '640px', credits: 100, unit: 'image', source: 'models' },
  { endpoint: '/v1/ai-image-generator', model: 'nano-banana-2', dimension: '1k', credits: 100, unit: 'image', source: 'imageModel' },
  { endpoint: '/v1/ai-image-generator', model: 'nano-banana-2', dimension: '2k', credits: 150, unit: 'image', source: 'imageModel' },
  { endpoint: '/v1/ai-image-generator', model: 'nano-banana-2', dimension: '4k', credits: 200, unit: 'image', source: 'imageModel' },

  // The editor is priced at its model's own rate, says the published table.
  // We send no `resolution`, and the provider's default for an image endpoint
  // is its lowest — so the editor cannot cost more than the 1K figure today.
  { endpoint: '/v1/ai-image-editor', model: 'nano-banana-2', dimension: 'provider-default', credits: 100, unit: 'image', source: 'models' },

  // ── Video ───────────────────────────────────────────────────────────────
  //
  //   `resolution` omitted on our calls defaults to 720p on a paid tier
  //   (480p on free) — published on the resolution-limits page. That is the
  //   configuration both of our video roads actually run in, and 96/s for
  //   veo3.1 at 720p is exactly what we had measured.
  { endpoint: '/v1/image-to-video', model: 'veo3.1', dimension: '720p', credits: 96, unit: 'second', source: 'models' },
  { endpoint: '/v1/image-to-video', model: 'veo3.1', dimension: '1080p', credits: 120, unit: 'second', source: 'models' },
  { endpoint: '/v1/text-to-video', model: 'minimax-h3', dimension: '480p', credits: 24, unit: 'second', source: 'models' },
  { endpoint: '/v1/text-to-video', model: 'minimax-h3', dimension: '720p', credits: 48, unit: 'second', source: 'models' },
  { endpoint: '/v1/text-to-video', model: 'minimax-h3', dimension: '1080p', credits: 72, unit: 'second', source: 'models' },

  // ── Image tools ─────────────────────────────────────────────────────────
  { endpoint: '/v1/ai-image-upscaler', model: null, dimension: 'preserve-2x', credits: 25, unit: 'image', source: 'models' },
  { endpoint: '/v1/ai-image-upscaler', model: null, dimension: 'preserve-4x', credits: 100, unit: 'image', source: 'models' },
  { endpoint: '/v1/image-background-remover', model: null, dimension: null, credits: 5, unit: 'image', source: 'models' },

  // ── Video tools ─────────────────────────────────────────────────────────
  //
  //   Lip sync is published per FRAME, and face-swap video as 24 credits per
  //   second at 24 fps — which is the same frame rate, stated the other way.
  //   Keeping each in the provider's own unit is the whole point: a figure
  //   converted to a unit the provider does not use stops being checkable.
  { endpoint: '/v1/lip-sync', model: null, dimension: 'standard', credits: 1, unit: 'frame', source: 'models' },
  { endpoint: '/v1/lip-sync', model: null, dimension: 'pro', credits: 2, unit: 'frame', source: 'models' },
  { endpoint: '/v1/face-swap', model: null, dimension: '24fps', credits: 1, unit: 'frame', source: 'models' },
  { endpoint: '/v1/ai-talking-photo', model: null, dimension: 'realistic', credits: 48, unit: 'second', source: 'models' },
  { endpoint: '/v1/ai-talking-photo', model: null, dimension: 'prompted', credits: 20, unit: 'second', source: 'models' },
];

/**
 * The published cost of one configuration, or null when the table does not
 * carry it.
 *
 * Null is an absence and never a zero: a caller that cannot learn a cost must
 * refuse the act, exactly as it would for a price it cannot read.
 */
export function officialCost(
  endpoint: string,
  model: string | null,
  dimension: string | null,
): TariffEntry | null {
  return OFFICIAL_TARIFF.find(
    (row) => row.endpoint === endpoint && row.model === model && row.dimension === dimension,
  ) ?? null;
}

/**
 * ─── THE ONE CONFIGURATION THAT PRICING MUST READ ───────────────────────────
 *
 *   An image's cost moves with its resolution and nothing else, so the price
 *   authority needs exactly this much: credits per image, by resolution.
 *
 *   Returns null for a resolution the published table does not carry, which
 *   is how an unpublished configuration stays unpriced instead of guessed.
 */
export function imageCreditsAtResolution(resolution: string): number | null {
  return officialCost('/v1/ai-image-generator', 'nano-banana-2', resolution)?.credits ?? null;
}
