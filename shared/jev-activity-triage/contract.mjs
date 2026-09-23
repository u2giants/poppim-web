/**
 * Jev activity-triage shared contract (pure).
 * Evaluation and production must import these exact bytes.
 */

export const ENVELOPE_VERSION = 1;
export const CONTRACT_VERSION = 'poppim-jev-activity-triage-v1';
export const DISCLOSURE_VERSION = 'poppim-jev-disclosure-v1';

/** Immutable first-release action classes (order is part of the manifest). */
export const ENABLED_ACTION_CLASSES = Object.freeze([
  'blocker_dependency',
  'decision',
  'follow_up_reminder',
]);

/** Closed five-way kind labels. */
export const KIND_LABELS = Object.freeze([
  'routine_update',
  'blocker_dependency',
  'decision',
  'follow_up_reminder',
  'unclear',
]);

/** Locally generated error enum. Never mirrors provider error bodies. */
export const ERROR_CODES = Object.freeze({
  timeout: 'timeout',
  network: 'network',
  http_4xx: 'http_4xx',
  http_429: 'http_429',
  http_5xx: 'http_5xx',
  content_type: 'content_type',
  content_encoding: 'content_encoding',
  body_too_large: 'body_too_large',
  schema: 'schema',
  model_mismatch: 'model_mismatch',
  usage_invalid: 'usage_invalid',
  ambiguous: 'ambiguous',
});

export const ERROR_CODE_VALUES = Object.freeze(Object.values(ERROR_CODES));

/** Terminal local outcomes that never reach the provider. */
export const BLOCKED_CODES = Object.freeze({
  blocked_sensitive_input: 'blocked_sensitive_input',
  blocked_unsupported_language: 'blocked_unsupported_language',
});

export const PROBABILITY_SUM_TOLERANCE = 1e-6;
export const MAX_INPUT_CHARS = 4000;
export const MIN_INPUT_CHARS = 1;
export const MAX_RESPONSE_BYTES = 16 * 1024;
export const MAX_INPUT_TOKENS = 2048;

const KIND_SET = new Set(KIND_LABELS);
const ERROR_SET = new Set(ERROR_CODE_VALUES);

function isFinite01(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Validate a typed Jev decision payload (after safe response parse).
 * Rejects unknown keys/labels, non-finite values, probability-sum drift,
 * model mismatch, and inconsistent usage. Max response bytes are enforced
 * by the caller (see safeResponse.mjs).
 * @param {unknown} payload
 * @param {{ pinnedModel: string }} opts
 * @returns {{ ok: true, value: object } | { ok: false, error: string }}
 */
export function validateJevDecision(payload, opts) {
  if (!opts || typeof opts.pinnedModel !== 'string' || opts.pinnedModel.length < 1) {
    return { ok: false, error: ERROR_CODES.ambiguous };
  }
  if (!isPlainObject(payload)) return { ok: false, error: ERROR_CODES.schema };

  const required = ['kind', 'probabilities', 'confidence', 'model'];
  for (const key of required) {
    if (!(key in payload)) return { ok: false, error: ERROR_CODES.schema };
  }
  for (const key of Object.keys(payload)) {
    if (!required.includes(key) && key !== 'usage' && key !== 'latency_ms') {
      return { ok: false, error: ERROR_CODES.schema };
    }
  }

  const { kind, probabilities, confidence, model, usage, latency_ms: latencyMs } = payload;
  if (typeof kind !== 'string' || !KIND_SET.has(kind)) return { ok: false, error: ERROR_CODES.schema };
  if (model !== opts.pinnedModel) return { ok: false, error: ERROR_CODES.model_mismatch };
  if (!isFinite01(confidence)) return { ok: false, error: ERROR_CODES.schema };
  if (!isPlainObject(probabilities)) return { ok: false, error: ERROR_CODES.schema };

  let sum = 0;
  for (const label of KIND_LABELS) {
    if (!(label in probabilities)) return { ok: false, error: ERROR_CODES.schema };
    const p = probabilities[label];
    if (!isFinite01(p)) return { ok: false, error: ERROR_CODES.schema };
    sum += p;
  }
  for (const key of Object.keys(probabilities)) {
    if (!KIND_SET.has(key)) return { ok: false, error: ERROR_CODES.schema };
  }
  if (Math.abs(sum - 1) > PROBABILITY_SUM_TOLERANCE) return { ok: false, error: ERROR_CODES.schema };

  let usageOut;
  if (usage !== undefined) {
    if (!isPlainObject(usage)) return { ok: false, error: ERROR_CODES.usage_invalid };
    const usageKeys = Object.keys(usage);
    for (const key of usageKeys) {
      if (!['input_tokens', 'output_tokens', 'total_tokens'].includes(key)) {
        return { ok: false, error: ERROR_CODES.usage_invalid };
      }
    }
    const { input_tokens: inputTokens, output_tokens: outputTokens, total_tokens: totalTokens } = usage;
    for (const n of [inputTokens, outputTokens, totalTokens]) {
      if (!Number.isInteger(n) || n < 0) return { ok: false, error: ERROR_CODES.usage_invalid };
    }
    if (inputTokens + outputTokens !== totalTokens) return { ok: false, error: ERROR_CODES.usage_invalid };
    if (inputTokens > MAX_INPUT_TOKENS) return { ok: false, error: ERROR_CODES.usage_invalid };
    usageOut = { input_tokens: inputTokens, output_tokens: outputTokens, total_tokens: totalTokens };
  }
  if (latencyMs !== undefined) {
    if (typeof latencyMs !== 'number' || !Number.isFinite(latencyMs) || latencyMs < 0) {
      return { ok: false, error: ERROR_CODES.schema };
    }
  }

  return {
    ok: true,
    value: {
      kind,
      probabilities: Object.fromEntries(KIND_LABELS.map((l) => [l, probabilities[l]])),
      confidence,
      model,
      usage: usageOut,
      latency_ms: latencyMs,
    },
  };
}

/**
 * Map transport/HTTP/validator state to a locally generated error enum.
 * Never pass through provider error bodies.
 */
export function toErrorCode(state) {
  if (ERROR_SET.has(state)) return state;
  return ERROR_CODES.ambiguous;
}

/** True when a kind should show an action suggestion card. */
export function isActionableKind(kind) {
  return ENABLED_ACTION_CLASSES.includes(kind);
}

/**
 * Build the environment-neutral quality manifest object (canonical JSON is hashed separately).
 * US-dollar ceilings are intentionally absent (owner waived TypeSafe deletion letter / $ ceilings
 * for the synthetic harness; production release manifests must still record owner-fixed ceilings
 * before any real provider send).
 */
export function buildQualityManifest(overrides = {}) {
  const manifest = {
    contract_version: CONTRACT_VERSION,
    disclosure_version: DISCLOSURE_VERSION,
    enabled_action_classes: [...ENABLED_ACTION_CLASSES],
    kind_labels: [...KIND_LABELS],
    language_allowlist: ['en'],
    min_input_chars: MIN_INPUT_CHARS,
    max_input_chars: MAX_INPUT_CHARS,
    max_input_tokens: MAX_INPUT_TOKENS,
    max_response_bytes: MAX_RESPONSE_BYTES,
    probability_sum_tolerance: PROBABILITY_SUM_TOLERANCE,
    confidence_display_threshold: 0.7,
    action_display_threshold: 0.7,
    provider_model: 'jev-1',
    provider_timeout_ms: 10000,
    provider_retry: 'none_confirmatory',
    worker_concurrency: 2,
    rate_limit_profile_per_24h: { requests: 50, tokens: 50000 },
    rate_limit_env_per_24h: { requests: 250, tokens: 250000 },
    eligible_comment_limit: 1000,
    eligible_window_days: 30,
    dictionary_mode: 'synthetic_preview',
    dictionary_version_uuid: '00000000-0000-4000-8000-000000000000',
    ...overrides,
  };
  return manifest;
}
