/**
 * AZMA OS — a node built-in that does not exist in a browser.
 *
 * ─── WHY THIS FILE EXISTS, AND WHY IT IS NOT A WORKAROUND ───────────────────
 *
 *   GramJS ships one build for both runtimes and chooses its transport at
 *   RUNTIME — `telegramBaseClient.js` reads
 *
 *       networkSocket: isNode ? PromisedNetSockets : PromisedWebSockets
 *
 *   so in a Creator's browser it speaks MTProto over WebSocket, exactly as
 *   Telegram's own web clients do. But the IMPORT of `net` is static, so a
 *   bundler must resolve it before anything runs, and a browser has no `net`.
 *
 *   The module is therefore loaded and never dereferenced. This empty object
 *   is the honest shape of that fact: not a stub that pretends to be a TCP
 *   socket — `__exportStar` copies its keys, and there are none to copy —
 *   but a statement that nothing here is reachable from a browser.
 *
 *   It is aliased ONLY under Turbopack's `browser` condition. Server code
 *   that genuinely needs `net`, `fs` or `os` is untouched and still gets the
 *   real thing.
 *
 *   If a future dependency does dereference one of these in the browser, it
 *   fails loudly on `undefined` — which is correct. A shim that invented
 *   plausible behaviour would fail silently instead, somewhere else, later.
 */

module.exports = {};
