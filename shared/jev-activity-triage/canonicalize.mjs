/**
 * Canonical JSON, digests, and HMAC-bound identifiers.
 * Never hash raw comment text directly (short comments are dictionary-recoverable).
 */

import { createHash, createHmac } from 'node:crypto';

/**
 * Deterministic JSON: object keys sorted, arrays preserved, finite numbers only.
 * @param {unknown} value
 * @returns {string}
 */
export function canonicalJson(value) {
  return JSON.stringify(canonicalizeValue(value));
}

function canonicalizeValue(value) {
  if (value === null) return null;
  const t = typeof value;
  if (t === 'string' || t === 'boolean') return value;
  if (t === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('canonicalJson: non-finite number');
    return value;
  }
  if (Array.isArray(value)) return value.map((item) => canonicalizeValue(item));
  if (t === 'object') {
    const out = {};
    for (const key of Object.keys(value).sort()) {
      if (value[key] === undefined) continue;
      out[key] = canonicalizeValue(value[key]);
    }
    return out;
  }
  throw new TypeError(`canonicalJson: unsupported type ${t}`);
}

/** @param {string | Uint8Array} data */
export function sha256Hex(data) {
  return createHash('sha256').update(data).digest('hex');
}

function lengthPrefixed(fields) {
  const parts = [];
  for (const field of fields) {
    const bytes = Buffer.isBuffer(field) ? field : Buffer.from(String(field), 'utf8');
    const header = Buffer.alloc(4);
    header.writeUInt32BE(bytes.length, 0);
    parts.push(header, bytes);
  }
  return Buffer.concat(parts);
}

function requireKey(key) {
  if (key == null) throw new TypeError('HMAC key required');
  if (typeof key === 'string') {
    if (key.length < 16) throw new TypeError('HMAC key too short');
    return key;
  }
  if (key instanceof Uint8Array || Buffer.isBuffer(key)) {
    if (key.length < 16) throw new TypeError('HMAC key too short');
    return key;
  }
  throw new TypeError('HMAC key must be string or bytes');
}

/**
 * HMAC-SHA-256 over length-prefixed (keyVersion, contractVersion, text).
 * Never a raw SHA of the text.
 * @param {{ key: string | Uint8Array, keyVersion: string, contractVersion: string, text: string }} args
 * @returns {{ hex: string, keyVersion: string }}
 */
export function inputDigest({ key, keyVersion, contractVersion, text }) {
  if (typeof keyVersion !== 'string' || keyVersion.length < 1) {
    throw new TypeError('keyVersion required');
  }
  if (typeof contractVersion !== 'string' || contractVersion.length < 1) {
    throw new TypeError('contractVersion required');
  }
  if (typeof text !== 'string') throw new TypeError('text required');
  const mac = createHmac('sha256', requireKey(key));
  mac.update(lengthPrefixed([keyVersion, contractVersion, text]));
  return { hex: mac.digest('hex'), keyVersion };
}

/**
 * Unlinkable evaluation case id: base64url(HMAC-SHA-256(key, datasetVersion || commentId)).
 * The case-id ↔ comment-id mapping lives only in the private store.
 * @param {{ key: string | Uint8Array, datasetVersion: string, commentId: string }} args
 * @returns {string}
 */
export function evaluationCaseId({ key, datasetVersion, commentId }) {
  if (typeof datasetVersion !== 'string' || datasetVersion.length < 1) {
    throw new TypeError('datasetVersion required');
  }
  if (typeof commentId !== 'string' || commentId.length < 1) {
    throw new TypeError('commentId required');
  }
  const mac = createHmac('sha256', requireKey(key));
  mac.update(lengthPrefixed([datasetVersion, commentId]));
  return mac.digest('base64url');
}

/**
 * JEV_RELEASE_DIGEST = SHA-256 over the environment-neutral quality manifest canonical JSON.
 * @param {object} manifest
 * @returns {string}
 */
export function qualityReleaseDigest(manifest) {
  return sha256Hex(canonicalJson(manifest));
}
