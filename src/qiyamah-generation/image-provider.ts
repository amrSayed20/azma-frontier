/**
 * AZMA OS — QIYAMAH: THE FIRST GENERATION PATH
 * The Launch Provider Wrapper
 *
 * The ONE point of contact with the certified Launch Provider (OpenAI's
 * image generation API). Deliberately isolated behind this single
 * function — swapping providers later means changing this file alone,
 * per the Chief Engineer Operating Charter's AI-provider-neutrality
 * principle. Does not revive or call anything in the legacy
 * src/chambers/qiyamah/ or src/orchestrator/fleet-materialization/
 * trees.
 */

import OpenAI from 'openai';

export interface ProviderImageResult {
  readonly bytes: Buffer;
  readonly mimeType: string;
}

let cachedClient: OpenAI | null = null;

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured — the Launch Provider cannot be reached.');
  }
  if (!cachedClient) {
    cachedClient = new OpenAI({ apiKey });
  }
  return cachedClient;
}

function buildPrompt(prompt: string, style: string | null): string {
  return style ? `${prompt} — style: ${style}` : prompt;
}

/** Resets the cached client — used only by tests to force re-reading process.env. */
export function resetProviderClientForTests(): void {
  cachedClient = null;
}

export async function generateImageViaProvider(prompt: string, style: string | null): Promise<ProviderImageResult> {
  const client = getClient();

  const response = await client.images.generate({
    model: 'gpt-image-1',
    prompt: buildPrompt(prompt, style),
    size: '1024x1024',
    n: 1,
  });

  const item = response.data?.[0];
  if (!item) {
    throw new Error('The Launch Provider returned no image data.');
  }

  if (item.b64_json) {
    return { bytes: Buffer.from(item.b64_json, 'base64'), mimeType: 'image/png' };
  }

  if (item.url) {
    const fetched = await fetch(item.url);
    if (!fetched.ok) {
      throw new Error('Failed to retrieve the generated image from the Launch Provider.');
    }
    return { bytes: Buffer.from(await fetched.arrayBuffer()), mimeType: 'image/png' };
  }

  throw new Error('The Launch Provider response contained neither b64_json nor url.');
}
