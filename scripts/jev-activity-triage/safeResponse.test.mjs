import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ERROR_CODES, MAX_RESPONSE_BYTES } from '../../shared/jev-activity-triage/contract.mjs';
import {
  parseJsonRejectDuplicateKeys,
  readProviderResponse,
} from '../../shared/jev-activity-triage/safeResponse.mjs';

const PINNED = 'jev-1';

function decisionBody(overrides = {}) {
  return JSON.stringify({
    kind: 'routine_update',
    probabilities: {
      routine_update: 0.7,
      blocker_dependency: 0.1,
      decision: 0.1,
      follow_up_reminder: 0.05,
      unclear: 0.05,
    },
    confidence: 0.8,
    model: PINNED,
    ...overrides,
  });
}

function jsonHeaders(extra = {}) {
  return { 'content-type': 'application/json; charset=utf-8', ...extra };
}

function bytesOf(text) {
  return Buffer.from(text, 'utf8');
}

test('accepts a valid 2xx JSON decision', () => {
  const result = readProviderResponse(200, jsonHeaders(), bytesOf(decisionBody()), {
    pinnedModel: PINNED,
  });
  assert.equal(result.ok, true);
  assert.equal(result.value.kind, 'routine_update');
  assert.equal(result.status, 200);
});

test('accepts content-type application/json without charset', () => {
  const result = readProviderResponse(
    201,
    { 'content-type': 'application/json' },
    bytesOf(decisionBody()),
    { pinnedModel: PINNED },
  );
  assert.equal(result.ok, true);
});

test('rejects non-2xx without returning provider body', () => {
  const leaked = 'SECRET_PROVIDER_ERROR_DO_NOT_LEAK';
  for (const [status, code] of [
    [400, ERROR_CODES.http_4xx],
    [401, ERROR_CODES.http_4xx],
    [429, ERROR_CODES.http_429],
    [500, ERROR_CODES.http_5xx],
    [503, ERROR_CODES.http_5xx],
  ]) {
    const result = readProviderResponse(status, jsonHeaders(), bytesOf(leaked), {
      pinnedModel: PINNED,
    });
    assert.equal(result.ok, false);
    assert.equal(result.code, code);
    assert.equal(JSON.stringify(result).includes(leaked), false);
  }
});

test('rejects missing or wrong content-type', () => {
  const body = bytesOf(decisionBody());
  assert.equal(
    readProviderResponse(200, {}, body, { pinnedModel: PINNED }).code,
    ERROR_CODES.content_type,
  );
  assert.equal(
    readProviderResponse(200, { 'content-type': 'text/plain' }, body, { pinnedModel: PINNED }).code,
    ERROR_CODES.content_type,
  );
  assert.equal(
    readProviderResponse(
      200,
      { 'content-type': 'application/json; charset=iso-8859-1' },
      body,
      { pinnedModel: PINNED },
    ).code,
    ERROR_CODES.content_type,
  );
});

test('rejects compressed content-encoding', () => {
  const body = bytesOf(decisionBody());
  for (const encoding of ['gzip', 'br', 'deflate', 'gzip, identity']) {
    const result = readProviderResponse(
      200,
      jsonHeaders({ 'content-encoding': encoding }),
      body,
      { pinnedModel: PINNED },
    );
    assert.equal(result.code, ERROR_CODES.content_encoding, encoding);
  }
});

test('accepts identity / absent content-encoding', () => {
  const body = bytesOf(decisionBody());
  assert.equal(
    readProviderResponse(200, jsonHeaders({ 'content-encoding': 'identity' }), body, {
      pinnedModel: PINNED,
    }).ok,
    true,
  );
  assert.equal(readProviderResponse(200, jsonHeaders(), body, { pinnedModel: PINNED }).ok, true);
});

test('enforces 16KiB ceiling on declared and actual size', () => {
  const over = Buffer.alloc(MAX_RESPONSE_BYTES + 1, 0x20);
  assert.equal(
    readProviderResponse(200, jsonHeaders(), over, { pinnedModel: PINNED }).code,
    ERROR_CODES.body_too_large,
  );
  assert.equal(
    readProviderResponse(
      200,
      jsonHeaders({ 'content-length': String(MAX_RESPONSE_BYTES + 1) }),
      bytesOf(decisionBody()),
      { pinnedModel: PINNED },
    ).code,
    ERROR_CODES.body_too_large,
  );
  const atLimit = Buffer.from(decisionBody(), 'utf8');
  assert.ok(atLimit.byteLength <= MAX_RESPONSE_BYTES);
  assert.equal(
    readProviderResponse(200, jsonHeaders(), atLimit, { pinnedModel: PINNED }).ok,
    true,
  );
});

test('rejects malformed JSON and duplicate keys as schema errors', () => {
  assert.equal(
    readProviderResponse(200, jsonHeaders(), bytesOf('{not json'), { pinnedModel: PINNED }).code,
    ERROR_CODES.schema,
  );
  assert.equal(
    readProviderResponse(
      200,
      jsonHeaders(),
      bytesOf('{"kind":"decision","kind":"decision","probabilities":{},"confidence":1,"model":"jev-1"}'),
      { pinnedModel: PINNED },
    ).code,
    ERROR_CODES.schema,
  );
});

test('parseJsonRejectDuplicateKeys catches nested duplicates', () => {
  assert.throws(() => parseJsonRejectDuplicateKeys('{"a":1,"a":2}'), /duplicate key/);
  assert.throws(() => parseJsonRejectDuplicateKeys('{"n":{"x":1,"x":2}}'), /duplicate key/);
  assert.deepEqual(parseJsonRejectDuplicateKeys('{"a":1,"b":{"c":2}}'), { a: 1, b: { c: 2 } });
});

test('rejects schema/model/usage failures with allowlisted codes only', () => {
  const unknownKey = decisionBody({ raw_provider_debug: 'x' });
  assert.equal(
    readProviderResponse(200, jsonHeaders(), bytesOf(unknownKey), { pinnedModel: PINNED }).code,
    ERROR_CODES.schema,
  );

  const badModel = JSON.stringify({ ...JSON.parse(decisionBody()), model: 'jev-9' });
  assert.equal(
    readProviderResponse(200, jsonHeaders(), bytesOf(badModel), { pinnedModel: PINNED }).code,
    ERROR_CODES.model_mismatch,
  );

  const badUsage = decisionBody({
    usage: { input_tokens: 1, output_tokens: 1, total_tokens: 5 },
  });
  assert.equal(
    readProviderResponse(200, jsonHeaders(), bytesOf(badUsage), { pinnedModel: PINNED }).code,
    ERROR_CODES.usage_invalid,
  );
});

test('never echoes provider error text in failure results', () => {
  const marker = 'PROVIDER_INTERNAL_STACKTRACE_SHOULD_NOT_APPEAR';
  const cases = [
    [500, jsonHeaders(), bytesOf(`{"error":"${marker}"}`)],
    [200, { 'content-type': 'text/html' }, bytesOf(`<html>${marker}</html>`)],
    [200, jsonHeaders({ 'content-encoding': 'gzip' }), bytesOf(marker)],
    [200, jsonHeaders(), bytesOf(`{"oops":"${marker}"}`)],
  ];
  for (const [status, headers, body] of cases) {
    const result = readProviderResponse(status, headers, body, { pinnedModel: PINNED });
    assert.equal(result.ok, false);
    const dump = `${result.code}${result.status}${JSON.stringify(result)}`;
    assert.equal(dump.includes(marker), false);
  }
});

test('maps unknown statuses to ambiguous', () => {
  const result = readProviderResponse(199, jsonHeaders(), bytesOf(decisionBody()), {
    pinnedModel: PINNED,
  });
  assert.equal(result.ok, false);
  assert.equal(result.code, ERROR_CODES.ambiguous);
});
