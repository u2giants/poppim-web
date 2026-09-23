import assert from 'node:assert/strict';
import { createHmac, createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  canonicalJson,
  evaluationCaseId,
  inputDigest,
  qualityReleaseDigest,
  sha256Hex,
} from '../../shared/jev-activity-triage/canonicalize.mjs';
import { buildQualityManifest, CONTRACT_VERSION } from '../../shared/jev-activity-triage/contract.mjs';

const golden = JSON.parse(
  readFileSync(new URL('../../shared/jev-activity-triage/golden-vectors.json', import.meta.url), 'utf8'),
);

function verifyCanonicalVector(vector) {
  let canonical;
  try {
    canonical = canonicalJson(vector.input);
  } catch (err) {
    return { ok: false, reason: String(err.message || err) };
  }
  if (canonical !== vector.expectCanonical) {
    return { ok: false, reason: `canonical mismatch: ${canonical}` };
  }
  const hex = sha256Hex(canonical);
  if (hex !== vector.expectSha256) {
    return { ok: false, reason: `sha mismatch: ${hex}` };
  }
  return { ok: true };
}

function verifyInputDigestVector(vector) {
  const result = inputDigest({
    key: vector.key,
    keyVersion: vector.keyVersion,
    contractVersion: vector.contractVersion,
    text: vector.text,
  });
  if (result.hex !== vector.expectHex) {
    return { ok: false, reason: `digest mismatch: ${result.hex}` };
  }
  if (result.keyVersion !== vector.keyVersion) {
    return { ok: false, reason: 'keyVersion mismatch' };
  }
  return { ok: true };
}

function verifyCaseIdVector(vector) {
  const id = evaluationCaseId({
    key: vector.key,
    datasetVersion: vector.datasetVersion,
    commentId: vector.commentId,
  });
  if (id !== vector.expectId) return { ok: false, reason: `id mismatch: ${id}` };
  return { ok: true };
}

test('golden canonicalize vectors match', () => {
  assert.ok(golden.canonicalize.length >= 3);
  for (const vector of golden.canonicalize) {
    const verdict = verifyCanonicalVector(vector);
    assert.equal(verdict.ok, true, `${vector.name}: ${verdict.reason ?? ''}`);
  }
});

test('broken canonicalize vector is discovered', () => {
  const base = golden.canonicalize[0];
  const broken = structuredClone(base);
  broken.expectCanonical = '{"a":999}';
  const verdict = verifyCanonicalVector(broken);
  assert.equal(verdict.ok, false);
  assert.match(verdict.reason, /canonical mismatch/);
});

test('canonicalJson sorts keys recursively and preserves array order', () => {
  assert.equal(canonicalJson({ b: 1, a: { d: 2, c: 3 } }), '{"a":{"c":3,"d":2},"b":1}');
  assert.equal(canonicalJson([3, 1, 2]), '[3,1,2]');
});

test('canonicalJson rejects non-finite numbers', () => {
  assert.throws(() => canonicalJson({ n: Number.NaN }), /non-finite/);
  assert.throws(() => canonicalJson({ n: Number.POSITIVE_INFINITY }), /non-finite/);
});

test('golden inputDigest vectors match and are not raw SHA', () => {
  for (const vector of golden.input_digest) {
    const verdict = verifyInputDigestVector(vector);
    assert.equal(verdict.ok, true, `${vector.name}: ${verdict.reason ?? ''}`);
  }
  const sample = golden.input_digest[0];
  const rawSha = createHash('sha256').update(sample.text, 'utf8').digest('hex');
  assert.notEqual(sample.expectHex, rawSha);
});

test('broken inputDigest vector is discovered', () => {
  const base = golden.input_digest[0];
  const broken = structuredClone(base);
  broken.expectHex = '0'.repeat(64);
  const verdict = verifyInputDigestVector(broken);
  assert.equal(verdict.ok, false);
  assert.match(verdict.reason, /digest mismatch/);
});

test('inputDigest is key- and keyVersion-bound', () => {
  const base = {
    key: golden.test_hmac_key,
    keyVersion: 'k1',
    contractVersion: CONTRACT_VERSION,
    text: 'Please confirm the sample date for the team.',
  };
  const a = inputDigest(base).hex;
  const b = inputDigest({ ...base, keyVersion: 'k2' }).hex;
  const c = inputDigest({ ...base, key: 'golden-vector-hmac-key-1111111111' }).hex;
  assert.notEqual(a, b);
  assert.notEqual(a, c);
});

test('inputDigest matches independent HMAC length-prefixed construction', () => {
  const key = golden.test_hmac_key;
  const keyVersion = 'k9';
  const text = 'length-prefixed check text';
  const fields = [keyVersion, CONTRACT_VERSION, text];
  const parts = [];
  for (const field of fields) {
    const bytes = Buffer.from(field, 'utf8');
    const header = Buffer.alloc(4);
    header.writeUInt32BE(bytes.length, 0);
    parts.push(header, bytes);
  }
  const expected = createHmac('sha256', key).update(Buffer.concat(parts)).digest('hex');
  assert.equal(
    inputDigest({ key, keyVersion, contractVersion: CONTRACT_VERSION, text }).hex,
    expected,
  );
});

test('golden evaluationCaseId vectors match base64url HMAC', () => {
  for (const vector of golden.evaluation_case_id) {
    const verdict = verifyCaseIdVector(vector);
    assert.equal(verdict.ok, true, `${vector.name}: ${verdict.reason ?? ''}`);
    assert.match(vector.expectId, /^[A-Za-z0-9_-]+$/);
  }
});

test('broken evaluationCaseId vector is discovered', () => {
  const base = golden.evaluation_case_id[0];
  const broken = structuredClone(base);
  broken.expectId = 'not-a-real-case-id';
  const verdict = verifyCaseIdVector(broken);
  assert.equal(verdict.ok, false);
});

test('evaluationCaseId is unlinkable across dataset versions', () => {
  const key = golden.test_case_key;
  const a = evaluationCaseId({ key, datasetVersion: 'ds-1', commentId: 'c-1' });
  const b = evaluationCaseId({ key, datasetVersion: 'ds-2', commentId: 'c-1' });
  const c = evaluationCaseId({ key, datasetVersion: 'ds-1', commentId: 'c-2' });
  assert.notEqual(a, b);
  assert.notEqual(a, c);
});

test('qualityReleaseDigest pins the golden manifest digest', () => {
  assert.equal(qualityReleaseDigest(golden.quality_manifest), golden.quality_release_digest);
  const rebuilt = buildQualityManifest();
  assert.equal(qualityReleaseDigest(rebuilt), golden.quality_release_digest);
});

test('qualityReleaseDigest changes when manifest fields change', () => {
  const a = qualityReleaseDigest(buildQualityManifest());
  const b = qualityReleaseDigest(buildQualityManifest({ provider_model: 'jev-2' }));
  assert.notEqual(a, b);
});
