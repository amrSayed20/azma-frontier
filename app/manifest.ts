import type { MetadataRoute } from 'next';

/**
 * AZMA OS — THE IMPERIAL INSTALL EXPERIENCE
 * The Next.js native manifest route (generates /manifest.webmanifest).
 * Icons are served by real, dynamically-rendered routes (see
 * app/icons/) — not static assets that don't exist, and not an invented
 * placeholder file.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AZMA OS',
    short_name: 'AZMA OS',
    description: 'The Living Empire — sovereign generation with Qiyamah.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#0a0a0a',
    icons: [
      { src: '/icons/icon-192', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512', sizes: '512x512', type: 'image/png' },
    ],
  };
}
