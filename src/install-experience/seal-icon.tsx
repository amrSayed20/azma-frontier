import { ImageResponse } from 'next/og';

/**
 * AZMA OS — THE IMPERIAL INSTALL EXPERIENCE
 * The Seal Icon
 *
 * A real, on-brand icon generated from the same gold seal glyph used
 * across this platform's own constitutional documents — not a stock
 * icon, not an invented placeholder from nowhere. Rendered dynamically
 * via Next.js's built-in ImageResponse, so no static image asset needs
 * to exist on disk. If a dedicated design asset is ever produced, it
 * should supersede this.
 */
export function renderSealIcon(size: number): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000000',
        }}
      >
        <div
          style={{
            width: `${size * 0.86}px`,
            height: `${size * 0.86}px`,
            borderRadius: '50%',
            border: `${Math.max(2, size * 0.03)}px solid #d4af37`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#d4af37',
            fontSize: `${size * 0.42}px`,
            fontFamily: 'serif',
          }}
        >
          徵
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
