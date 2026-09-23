/**
 * Deterministic minimization/redaction before any TypeSafe submission.
 * Pure function: same input + dictionary → same output.
 */

const EMAIL_RE = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
const EMAIL_PCT_RE = /[\w.+-]+%40[\w-]+(?:\.[\w-]+)+/gi;
const URL_RE = /\bhttps?:\/\/[^\s<>"')]*[^\s<>"'.,;:!?)\]]/gi;
const UUID_RE = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;
const PHONE_RE = /\b(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/g;
const PHONE_INTL_RE = /\+\d{1,3}(?:[-.\s]?\d{2,4}){2,4}\b/g;
const PATH_RE =
  /(?:[A-Za-z]:\\|\\\\)[^\s<>"')]*[^\s<>"'.,;:!?)\]]|\/(?:home|Users|var|tmp|mnt|Volumes)\/[^\s<>"')]*[^\s<>"'.,;:!?)\]]|(?:s3|gs|az):\/\/[^\s<>"')]*[^\s<>"'.,;:!?)\]]/g;
const ACCOUNT_ID_RE = /\b(?:ORD|PO|INV|SKU|ACCT|CUST)[-_][A-Z0-9]+(?:[-_][A-Z0-9]+)*\b/g;
const LONG_TOKEN_RE = /\b[A-Za-z0-9_\-]{40,}\b/g;
const HEX_TOKEN_RE = /\b[0-9a-f]{32,}\b/gi;
const SECRETISH_RE =
  /\b(?:Bearer\s+[A-Za-z0-9._\-]{8,}|api[_-]?key\s*[:=]\s*\S+|password\s*[:=]\s*\S+|BEGIN [A-Z ]*PRIVATE KEY\b|(?:postgres|postgresql|mysql|mongodb|redis|amqp|smtp):\/\/[^\s<>"']+)/gi;

function looksHighEntropy(token) {
  if (typeof token !== 'string' || token.length < 40) return false;
  let classes = 0;
  if (/[a-z]/.test(token)) classes += 1;
  if (/[A-Z]/.test(token)) classes += 1;
  if (/[0-9]/.test(token)) classes += 1;
  if (/[_\-]/.test(token)) classes += 1;
  return classes >= 3;
}

/**
 * Local block list: never send these to the provider.
 * Blocks credential patterns, PEM blocks, connection strings, hex API tokens,
 * and high-entropy long tokens. Low-entropy long runs are placeholder-redacted.
 * @returns {'blocked_sensitive_input' | null}
 */
export function detectBlockedSecret(input) {
  if (typeof input !== 'string') return 'blocked_sensitive_input';
  for (const re of [SECRETISH_RE, HEX_TOKEN_RE]) {
    re.lastIndex = 0;
    if (re.test(input)) {
      re.lastIndex = 0;
      return 'blocked_sensitive_input';
    }
    re.lastIndex = 0;
  }
  LONG_TOKEN_RE.lastIndex = 0;
  let match = LONG_TOKEN_RE.exec(input);
  while (match) {
    if (looksHighEntropy(match[0])) {
      LONG_TOKEN_RE.lastIndex = 0;
      return 'blocked_sensitive_input';
    }
    match = LONG_TOKEN_RE.exec(input);
  }
  LONG_TOKEN_RE.lastIndex = 0;
  return null;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Collapse runs of horizontal whitespace, normalize newlines, trim. */
export function normalizeWhitespace(text) {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t\f\v]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * @param {string} rawBody
 * @param {{ dictionary?: string[], maxLength?: number }} [opts]
 * @returns {{ ok: true, text: string } | { ok: false, code: 'blocked_sensitive_input' | 'input_too_short' | 'input_too_long' }}
 */
export function redactForTypeSafe(rawBody, opts = {}) {
  const dictionary = opts.dictionary ?? [];
  const maxLength = opts.maxLength ?? 4000;
  if (typeof rawBody !== 'string') return { ok: false, code: 'input_too_short' };

  const blocked = detectBlockedSecret(rawBody);
  if (blocked) return { ok: false, code: blocked };

  let text = normalizeWhitespace(rawBody);
  if (text.length < 1) return { ok: false, code: 'input_too_short' };

  // Longest dictionary terms first so multi-word names win.
  const terms = [...dictionary].filter(Boolean).sort((a, b) => b.length - a.length);
  for (const term of terms) {
    text = text.replace(new RegExp(escapeRegExp(term), 'gi'), '{{business_name}}');
  }

  text = text
    .replace(SECRETISH_RE, '{{secret}}')
    .replace(EMAIL_PCT_RE, '{{email}}')
    .replace(EMAIL_RE, '{{email}}')
    .replace(URL_RE, '{{url}}')
    .replace(UUID_RE, '{{uuid}}')
    .replace(PHONE_INTL_RE, '{{phone}}')
    .replace(PHONE_RE, '{{phone}}')
    .replace(PATH_RE, '{{path}}')
    .replace(ACCOUNT_ID_RE, '{{account_id}}')
    .replace(HEX_TOKEN_RE, '{{token}}')
    .replace(LONG_TOKEN_RE, '{{token}}');

  text = normalizeWhitespace(text);
  if (text.length < 1) return { ok: false, code: 'input_too_short' };
  if (text.length > maxLength) return { ok: false, code: 'input_too_long' };
  return { ok: true, text };
}

/**
 * Offline English gate (first release). High-confidence English only.
 * Unsupported/mixed/uncertain/too-short text is terminal
 * `blocked_unsupported_language` and is never relabeled `unclear`.
 * @returns {'english_eligible' | 'blocked_unsupported_language'}
 */
export function languageGate(text) {
  const normalized = normalizeWhitespace(text);
  if (normalized.length < 8) return 'blocked_unsupported_language';
  const letters = normalized.replace(/[^A-Za-z]/g, '');
  if (letters.length < 5) return 'blocked_unsupported_language';
  const nonSpace = normalized.replace(/\s/g, '').length || 1;
  const asciiLetterRatio = letters.length / nonSpace;
  if (asciiLetterRatio < 0.5) return 'blocked_unsupported_language';
  const common =
    /\b(the|and|is|to|for|we|you|please|need|should|with|that|this|have|from|can|will|not|but|our|your|they|be|are|was|were|has|had|do|does|did|a|an|of|on|in|at|by|as|if|or|so|up|out|about|into|over|after|before|just|also|only|more|most|other|some|such|than|then|too|very|can|now|new|one|two|first|last|next|week|day|time|team|update|blocker|decision|reminder|review|product|project|sample|order)\b/i;
  if (!common.test(normalized)) return 'blocked_unsupported_language';
  return 'english_eligible';
}
