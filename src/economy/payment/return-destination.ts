/**
 * AZMA OS — Where a Creator is allowed to land after paying.
 *
 * ─── WHAT WAS MEASURED ──────────────────────────────────────────────────────
 *
 *   `POST /api/billing/checkout` took both return destinations straight from
 *   the request body with no check at all:
 *
 *       const successUrl = typeof rawSuccessUrl === 'string'
 *         ? rawSuccessUrl
 *         : `${origin}/sovereign-vault-palace`;
 *
 *   So a crafted checkout could send the Creator, immediately after a real
 *   payment, to a page the attacker controls — arriving from the payment
 *   gateway itself, which is exactly the moment a person is least suspicious
 *   and most willing to re-enter a card or a password. Found while auditing the
 *   identity gate; it is not an identity defect, it is a payment-path one.
 *
 * ─── THE RULE ───────────────────────────────────────────────────────────────
 *
 *   A return destination is a PATH INSIDE THIS EMPIRE. Not a URL that happens
 *   to start with our origin — a path. The caller says where in AZMA to land;
 *   the origin is decided here, from the request the server actually received.
 *
 *   That is deliberately stricter than "validate the URL". URL validation is a
 *   game of encodings — `//evil.com`, `https:/\evil.com`, `%2F%2Fevil.com`,
 *   userinfo tricks like `https://azmaos.com@evil.com` — and the defender has
 *   to win every round. Refusing to accept absolute URLs at all means there is
 *   no round to lose: anything that is not a plain internal path is replaced
 *   with a safe default rather than argued with.
 *
 *   An unacceptable value is never an error the Creator sees. They asked to
 *   buy credit; they are sent somewhere sane and the attempt is recorded.
 */

/** Where a Creator lands when nothing valid was asked for. */
export const DEFAULT_RETURN_PATH = '/sovereign-vault-palace';

/**
 * NUL through unit-separator, plus DEL. Written with explicit escapes: a
 * literal control character inside a regex is invisible in every editor and
 * survives no copy, paste or review.
 */
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/;

/** Whether the first path segment carries a colon — see the call site. */
function firstSegmentHasColon(path: string): boolean {
  const withoutLeadingSlash = path.replace(/^\/+/, '');
  const firstSegment = withoutLeadingSlash.split(/[/?#]/, 1)[0];
  return firstSegment.includes(':');
}

/**
 * Reduce whatever the client sent to a safe internal path.
 *
 * Returns null when the input cannot be trusted, so the caller decides what to
 * substitute — and so a test can tell "rejected" from "happened to be the
 * default".
 */
export function internalReturnPath(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;

  const value = raw.trim();
  if (value.length === 0 || value.length > 512) return null;

  // Must be an absolute path within this Empire, and nothing else.
  if (!value.startsWith('/')) return null;

  // `//host` and `/\host` are protocol-relative: the browser reads them as a
  // different site entirely, while they read like paths to a human and to a
  // naive startsWith('/') check. This is the single most common bypass of the
  // rule above, which is why it is the first thing rejected after it.
  if (value.startsWith('//') || value.startsWith('/\\')) return null;

  // A backslash anywhere is refused rather than normalised: browsers differ on
  // whether they treat it as a separator, and a rule that depends on which
  // browser is reading it is not a rule.
  if (value.includes('\\')) return null;

  // Control characters, including the CR/LF and NUL used to split or truncate
  // a header, and the tabs/newlines browsers silently strip from URLs before
  // parsing them — which is how `/\tjavascript:...` survives a naive filter.
  if (CONTROL_CHARS.test(value)) return null;

  // A scheme cannot appear in a path. This catches `javascript:` and `data:`
  // reached through any path-shaped prefix, and it catches percent-encoded
  // colons too, since the check runs on the decoded form below as well.
  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    // Malformed percent-encoding. A destination that cannot be read is a
    // destination that cannot be approved.
    return null;
  }
  const decodedTrimmed = decoded.trim();
  if (
    decodedTrimmed.startsWith('//')
    || decodedTrimmed.startsWith('/\\')
    || decodedTrimmed.includes('\\')
    || CONTROL_CHARS.test(decoded)
    // Any scheme-looking prefix in the decoded form.
    || /^[a-z][a-z0-9+.-]*:/i.test(decodedTrimmed)
    // A colon inside the FIRST path segment. `/javascript:alert(1)` is, strictly,
    // a harmless path — a browser resolves it against our own origin. It is
    // refused anyway: URL parsers disagree about colons in a first segment, and
    // no legitimate address in this Empire contains one, so the whole class goes
    // rather than being reasoned about case by case.
    || firstSegmentHasColon(decodedTrimmed)
    || firstSegmentHasColon(value)
  ) {
    return null;
  }

  return value;
}

/**
 * The absolute URL to hand the payment gateway.
 *
 * `origin` comes from the server's own view of the request, never from the
 * body — so even an approved path cannot be pointed at another host.
 */
export function returnUrl(origin: string, raw: unknown): string {
  return `${origin}${internalReturnPath(raw) ?? DEFAULT_RETURN_PATH}`;
}
