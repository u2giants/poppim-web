/**
 * Safe provider response reader.
 * Transport gates run before JSON parse; schema validation runs after.
 * Never returns or stores raw provider error bodies/headers/debug strings.
 */

import {
  ERROR_CODES,
  MAX_RESPONSE_BYTES,
  toErrorCode,
  validateJevDecision,
} from './contract.mjs';

function normalizeHeaders(headers) {
  const out = Object.create(null);
  if (!headers) return out;
  if (typeof headers.forEach === 'function' && typeof headers.get === 'function') {
    headers.forEach((value, key) => {
      out[String(key).toLowerCase()] = String(value);
    });
    return out;
  }
  if (Array.isArray(headers)) {
    for (const pair of headers) {
      if (!pair || pair.length < 2) continue;
      out[String(pair[0]).toLowerCase()] = String(pair[1]);
    }
    return out;
  }
  if (typeof headers === 'object') {
    for (const key of Object.keys(headers)) {
      out[key.toLowerCase()] = String(headers[key]);
    }
  }
  return out;
}

function contentTypeOk(value) {
  if (typeof value !== 'string' || value.length === 0) return false;
  const parts = value.split(';').map((p) => p.trim());
  if (parts[0].toLowerCase() !== 'application/json') return false;
  for (const param of parts.slice(1)) {
    const eq = param.indexOf('=');
    if (eq < 0) continue;
    const name = param.slice(0, eq).trim().toLowerCase();
    const val = param.slice(eq + 1).trim().replace(/^"|"$/g, '').toLowerCase();
    if (name === 'charset' && val !== 'utf-8' && val !== 'utf8') return false;
  }
  return true;
}

function contentEncodingOk(value) {
  if (value === undefined || value === null || value === '') return true;
  const encodings = String(value)
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (encodings.length === 0) return true;
  return encodings.every((e) => e === 'identity');
}

/**
 * Strict JSON parse that rejects duplicate object keys.
 * @param {string} text
 */
export function parseJsonRejectDuplicateKeys(text) {
  let i = 0;
  const n = text.length;

  function skipWs() {
    while (i < n) {
      const c = text.charCodeAt(i);
      if (c === 0x20 || c === 0x09 || c === 0x0a || c === 0x0d) i++;
      else break;
    }
  }

  function parseString() {
    if (text[i] !== '"') throw new SyntaxError('expected string');
    const start = i;
    i++;
    while (i < n) {
      if (text[i] === '\\') {
        i += 2;
        continue;
      }
      if (text[i] === '"') {
        i++;
        return JSON.parse(text.slice(start, i));
      }
      i++;
    }
    throw new SyntaxError('unterminated string');
  }

  function parseNumber() {
    const start = i;
    if (text[i] === '-') i++;
    while (i < n && text[i] >= '0' && text[i] <= '9') i++;
    if (text[i] === '.') {
      i++;
      while (i < n && text[i] >= '0' && text[i] <= '9') i++;
    }
    if (text[i] === 'e' || text[i] === 'E') {
      i++;
      if (text[i] === '+' || text[i] === '-') i++;
      while (i < n && text[i] >= '0' && text[i] <= '9') i++;
    }
    if (i === start) throw new SyntaxError('bad number');
    const v = Number(text.slice(start, i));
    if (!Number.isFinite(v)) throw new SyntaxError('non-finite number');
    return v;
  }

  function parseLiteral() {
    if (text.startsWith('true', i)) {
      i += 4;
      return true;
    }
    if (text.startsWith('false', i)) {
      i += 5;
      return false;
    }
    if (text.startsWith('null', i)) {
      i += 4;
      return null;
    }
    throw new SyntaxError('unexpected token');
  }

  function parseObject() {
    const obj = {};
    const seen = new Set();
    i++;
    skipWs();
    if (text[i] === '}') {
      i++;
      return obj;
    }
    for (;;) {
      skipWs();
      const key = parseString();
      if (seen.has(key)) throw new SyntaxError('duplicate key');
      seen.add(key);
      skipWs();
      if (text[i] !== ':') throw new SyntaxError('expected colon');
      i++;
      obj[key] = parseValue();
      skipWs();
      if (text[i] === ',') {
        i++;
        continue;
      }
      if (text[i] === '}') {
        i++;
        return obj;
      }
      throw new SyntaxError('expected comma or brace');
    }
  }

  function parseArray() {
    const arr = [];
    i++;
    skipWs();
    if (text[i] === ']') {
      i++;
      return arr;
    }
    for (;;) {
      arr.push(parseValue());
      skipWs();
      if (text[i] === ',') {
        i++;
        continue;
      }
      if (text[i] === ']') {
        i++;
        return arr;
      }
      throw new SyntaxError('expected comma or bracket');
    }
  }

  function parseValue() {
    skipWs();
    if (i >= n) throw new SyntaxError('unexpected end');
    const c = text[i];
    if (c === '{') return parseObject();
    if (c === '[') return parseArray();
    if (c === '"') return parseString();
    if (c === '-' || (c >= '0' && c <= '9')) return parseNumber();
    return parseLiteral();
  }

  const value = parseValue();
  skipWs();
  if (i !== n) throw new SyntaxError('trailing data');
  return value;
}

function toBodyBytes(bodyBytes) {
  if (bodyBytes == null) return new Uint8Array(0);
  if (bodyBytes instanceof Uint8Array) return bodyBytes;
  if (Buffer.isBuffer(bodyBytes)) return bodyBytes;
  if (typeof bodyBytes === 'string') return Buffer.from(bodyBytes, 'utf8');
  return null;
}

function httpCodeForStatus(status) {
  if (status === 429) return ERROR_CODES.http_429;
  if (status >= 400 && status < 500) return ERROR_CODES.http_4xx;
  if (status >= 500 && status < 600) return ERROR_CODES.http_5xx;
  return ERROR_CODES.ambiguous;
}

/**
 * Read and validate a provider response.
 * Requires 2xx, application/json (+utf-8), identity encoding, ≤16KiB,
 * strict JSON (no duplicate keys), then validateJevDecision.
 *
 * @param {number} status
 * @param {Record<string,string> | Headers | Array<[string,string]>} headers
 * @param {Uint8Array | Buffer | string} bodyBytes
 * @param {{ pinnedModel: string }} opts
 * @returns {{ ok: true, value: object, status: number } | { ok: false, code: string, status: number }}
 */
export function readProviderResponse(status, headers, bodyBytes, opts) {
  const statusOut = Number.isInteger(status) ? status : 0;

  if (!Number.isInteger(status) || status < 200 || status > 299) {
    // Never surface body/headers for failures.
    return { ok: false, code: toErrorCode(httpCodeForStatus(statusOut)), status: statusOut };
  }

  const h = normalizeHeaders(headers);
  const encoding = h['content-encoding'];
  if (!contentEncodingOk(encoding)) {
    return { ok: false, code: ERROR_CODES.content_encoding, status: statusOut };
  }

  const ctype = h['content-type'];
  if (!contentTypeOk(ctype)) {
    return { ok: false, code: ERROR_CODES.content_type, status: statusOut };
  }

  const declared = h['content-length'];
  if (declared !== undefined && declared !== '') {
    const declaredLen = Number(declared);
    if (Number.isFinite(declaredLen) && declaredLen > MAX_RESPONSE_BYTES) {
      return { ok: false, code: ERROR_CODES.body_too_large, status: statusOut };
    }
  }

  const bytes = toBodyBytes(bodyBytes);
  if (!bytes) {
    return { ok: false, code: ERROR_CODES.ambiguous, status: statusOut };
  }
  if (bytes.byteLength > MAX_RESPONSE_BYTES) {
    return { ok: false, code: ERROR_CODES.body_too_large, status: statusOut };
  }

  let text;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return { ok: false, code: ERROR_CODES.schema, status: statusOut };
  }

  let payload;
  try {
    payload = parseJsonRejectDuplicateKeys(text);
  } catch {
    return { ok: false, code: ERROR_CODES.schema, status: statusOut };
  }

  const validated = validateJevDecision(payload, opts);
  if (!validated.ok) {
    return { ok: false, code: toErrorCode(validated.error), status: statusOut };
  }
  return { ok: true, value: validated.value, status: statusOut };
}
