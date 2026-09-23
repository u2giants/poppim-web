import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  BLOCKED_CODES,
  buildQualityManifest,
  CONTRACT_VERSION,
  DISCLOSURE_VERSION,
  ENABLED_ACTION_CLASSES,
  ERROR_CODES,
  ERROR_CODE_VALUES,
  isActionableKind,
  KIND_LABELS,
  validateJevDecision,
} from '../../shared/jev-activity-triage/contract.mjs';

const golden = JSON.parse(
  readFileSync(new URL('../../shared/jev-activity-triage/golden-vectors.json', import.meta.url), 'utf8'),
);

const PINNED = golden.pinned_model;

function verifyValidateVector(vector) {
  const result = validateJevDecision(vector.payload, { pinnedModel: vector.pinnedModel });
  if (vector.expect.ok) {
    if (!result.ok) return { ok: false, reason: `expected ok, got ${result.error}` };
    if (result.value.kind !== vector.expect.kind) return { ok: false, reason: 'kind mismatch' };
    if (isActionableKind(result.value.kind) !== vector.expect.actionable) {
      return { ok: false, reason: 'actionable mismatch' };
    }
    return { ok: true };
  }
  if (result.ok) return { ok: false, reason: 'expected failure, got ok' };
  if (result.error !== vector.expect.error) {
    return { ok: false, reason: `error mismatch: ${result.error}` };
  }
  return { ok: true };
}

test('kind labels and enabled action classes are frozen closed sets', () => {
  assert.deepEqual(
    [...KIND_LABELS],
    ['routine_update', 'blocker_dependency', 'decision', 'follow_up_reminder', 'unclear'],
  );
  assert.deepEqual(
    [...ENABLED_ACTION_CLASSES],
    ['blocker_dependency', 'decision', 'follow_up_reminder'],
  );
  assert.equal(CONTRACT_VERSION, golden.contract_version);
  assert.equal(DISCLOSURE_VERSION, golden.disclosure_version);
});

test('isActionableKind only accepts enabled action classes', () => {
  for (const vector of golden.is_actionable) {
    assert.equal(isActionableKind(vector.kind), vector.expect, vector.name);
  }
});

test('ERROR_CODES enum is complete and closed', () => {
  const expected = [
    'timeout',
    'network',
    'http_4xx',
    'http_429',
    'http_5xx',
    'content_type',
    'content_encoding',
    'body_too_large',
    'schema',
    'model_mismatch',
    'usage_invalid',
    'ambiguous',
  ];
  assert.deepEqual([...ERROR_CODE_VALUES].sort(), [...expected].sort());
  for (const code of expected) {
    assert.equal(ERROR_CODES[code], code);
  }
  assert.equal(BLOCKED_CODES.blocked_sensitive_input, 'blocked_sensitive_input');
  assert.equal(BLOCKED_CODES.blocked_unsupported_language, 'blocked_unsupported_language');
});

test('golden validate vectors match', () => {
  assert.ok(golden.validate.length >= 6);
  for (const vector of golden.validate) {
    const verdict = verifyValidateVector(vector);
    assert.equal(verdict.ok, true, `${vector.name}: ${verdict.reason ?? ''}`);
  }
});

test('broken validate vector is discovered', () => {
  const base = golden.validate.find((v) => v.name === 'valid_routine');
  const broken = structuredClone(base);
  broken.expect = { ok: false, error: 'model_mismatch' };
  const verdict = verifyValidateVector(broken);
  assert.equal(verdict.ok, false);
});

test('validateJevDecision rejects unknown keys and labels', () => {
  const base = {
    kind: 'decision',
    probabilities: {
      routine_update: 0.05,
      blocker_dependency: 0.05,
      decision: 0.8,
      follow_up_reminder: 0.05,
      unclear: 0.05,
    },
    confidence: 0.9,
    model: PINNED,
  };
  assert.equal(validateJevDecision({ ...base, extra: 1 }, { pinnedModel: PINNED }).error, 'schema');
  assert.equal(
    validateJevDecision({ ...base, kind: 'not_a_kind' }, { pinnedModel: PINNED }).error,
    'schema',
  );
  assert.equal(
    validateJevDecision(
      { ...base, probabilities: { ...base.probabilities, nope: 0 } },
      { pinnedModel: PINNED },
    ).error,
    'schema',
  );
});

test('validateJevDecision enforces probability sum tolerance', () => {
  const payload = {
    kind: 'routine_update',
    probabilities: {
      routine_update: 0.5,
      blocker_dependency: 0.5,
      decision: 0.5,
      follow_up_reminder: 0.5,
      unclear: 0.5,
    },
    confidence: 0.5,
    model: PINNED,
  };
  assert.equal(validateJevDecision(payload, { pinnedModel: PINNED }).error, 'schema');

  // Within 1e-6 of 1.0 must pass.
  const nearly = {
    ...payload,
    probabilities: {
      routine_update: 0.2 + 5e-7,
      blocker_dependency: 0.2,
      decision: 0.2,
      follow_up_reminder: 0.2,
      unclear: 0.2,
    },
  };
  assert.equal(validateJevDecision(nearly, { pinnedModel: PINNED }).ok, true);

  // Outside tolerance must fail.
  const over = {
    ...payload,
    probabilities: {
      routine_update: 0.2 + 1e-5,
      blocker_dependency: 0.2,
      decision: 0.2,
      follow_up_reminder: 0.2,
      unclear: 0.2,
    },
  };
  assert.equal(validateJevDecision(over, { pinnedModel: PINNED }).error, 'schema');
});

test('validateJevDecision rejects out-of-range confidence and non-finite values', () => {
  const base = {
    kind: 'unclear',
    probabilities: {
      routine_update: 0.2,
      blocker_dependency: 0.2,
      decision: 0.2,
      follow_up_reminder: 0.2,
      unclear: 0.2,
    },
    confidence: 0.5,
    model: PINNED,
  };
  assert.equal(validateJevDecision({ ...base, confidence: -0.1 }, { pinnedModel: PINNED }).error, 'schema');
  assert.equal(validateJevDecision({ ...base, confidence: 1.01 }, { pinnedModel: PINNED }).error, 'schema');
  assert.equal(
    validateJevDecision(
      { ...base, probabilities: { ...base.probabilities, unclear: Number.NaN } },
      { pinnedModel: PINNED },
    ).error,
    'schema',
  );
});

test('validateJevDecision enforces pinned model and consistent integer usage', () => {
  const base = {
    kind: 'follow_up_reminder',
    probabilities: {
      routine_update: 0.05,
      blocker_dependency: 0.05,
      decision: 0.05,
      follow_up_reminder: 0.8,
      unclear: 0.05,
    },
    confidence: 0.8,
    model: PINNED,
  };
  assert.equal(
    validateJevDecision({ ...base, model: 'other-model' }, { pinnedModel: PINNED }).error,
    'model_mismatch',
  );
  assert.equal(
    validateJevDecision(
      { ...base, usage: { input_tokens: 1.5, output_tokens: 1, total_tokens: 2.5 } },
      { pinnedModel: PINNED },
    ).error,
    'usage_invalid',
  );
  assert.equal(
    validateJevDecision(
      { ...base, usage: { input_tokens: 3, output_tokens: 4, total_tokens: 7, extra: 1 } },
      { pinnedModel: PINNED },
    ).error,
    'usage_invalid',
  );
  assert.equal(
    validateJevDecision(
      { ...base, usage: { input_tokens: 3000, output_tokens: 1, total_tokens: 3001 } },
      { pinnedModel: PINNED },
    ).error,
    'usage_invalid',
  );
  const ok = validateJevDecision(
    {
      ...base,
      usage: { input_tokens: 3, output_tokens: 4, total_tokens: 7 },
      latency_ms: 15,
    },
    { pinnedModel: PINNED },
  );
  assert.equal(ok.ok, true);
  assert.deepEqual(ok.value.usage, { input_tokens: 3, output_tokens: 4, total_tokens: 7 });
});

test('buildQualityManifest omits US-dollar fields (owner waived)', () => {
  const manifest = buildQualityManifest();
  const serialized = JSON.stringify(manifest);
  assert.doesNotMatch(serialized, /US\$|usd_|cost_|price_usd|\$\d/i);
  assert.equal(manifest.dictionary_mode, 'synthetic_preview');
  assert.equal(manifest.provider_model, golden.quality_manifest.provider_model);
  assert.deepEqual(manifest.enabled_action_classes, [...ENABLED_ACTION_CLASSES]);
});

test('buildQualityManifest golden snapshot matches', () => {
  assert.deepEqual(buildQualityManifest(), golden.quality_manifest);
});
