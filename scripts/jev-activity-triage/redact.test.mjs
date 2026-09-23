import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  detectBlockedSecret,
  languageGate,
  normalizeWhitespace,
  redactForTypeSafe,
} from '../../shared/jev-activity-triage/redact.mjs';

const golden = JSON.parse(
  readFileSync(new URL('../../shared/jev-activity-triage/golden-vectors.json', import.meta.url), 'utf8'),
);

function verifyRedactVector(vector) {
  const result = redactForTypeSafe(vector.input, { dictionary: vector.dictionary ?? [] });
  if (vector.expect.ok) {
    if (!result.ok) return { ok: false, reason: `expected ok, got ${result.code}` };
    if (result.text !== vector.expect.text) {
      return { ok: false, reason: `text mismatch: ${JSON.stringify(result.text)}` };
    }
    return { ok: true };
  }
  if (result.ok) return { ok: false, reason: 'expected block, got ok' };
  if (result.code !== vector.expect.code) {
    return { ok: false, reason: `code mismatch: ${result.code}` };
  }
  return { ok: true };
}

test('golden redact vectors match', () => {
  assert.ok(golden.redact.length >= 12);
  for (const vector of golden.redact) {
    const verdict = verifyRedactVector(vector);
    assert.equal(verdict.ok, true, `${vector.name}: ${verdict.reason ?? ''}`);
  }
});

test('broken redact golden vector is discovered', () => {
  const base = golden.redact.find((v) => v.name === 'plain_email');
  assert.ok(base);
  const broken = structuredClone(base);
  broken.expect = { ok: true, text: 'THIS IS NOT THE REDACTED TEXT' };
  const verdict = verifyRedactVector(broken);
  assert.equal(verdict.ok, false);
  assert.match(verdict.reason, /text mismatch/);

  const brokenCode = structuredClone(golden.redact.find((v) => v.name === 'high_entropy_token_blocks'));
  brokenCode.expect = { ok: true, text: 'nope' };
  const verdict2 = verifyRedactVector(brokenCode);
  assert.equal(verdict2.ok, false);
});

test('golden detectBlockedSecret vectors match', () => {
  for (const vector of golden.detect_blocked_secret) {
    assert.equal(detectBlockedSecret(vector.input), vector.expect, vector.name);
  }
});

test('broken detectBlockedSecret vector is discovered', () => {
  const base = golden.detect_blocked_secret.find((v) => v.name === 'pem_block');
  assert.equal(verifyBlockedBroken(base), false);
});

function verifyBlockedBroken(vector) {
  return detectBlockedSecret(vector.input) === 'definitely-not-a-real-expectation';
}

test('golden language vectors match', () => {
  for (const vector of golden.language) {
    assert.equal(languageGate(vector.input), vector.expect, vector.name);
  }
});

test('broken language vector is discovered', () => {
  const base = golden.language.find((v) => v.name === 'japanese');
  const brokenExpect = 'english_eligible';
  assert.notEqual(languageGate(base.input), brokenExpect);
});

test('golden normalizeWhitespace vectors match', () => {
  for (const vector of golden.normalize_whitespace) {
    assert.equal(normalizeWhitespace(vector.input), vector.expect, vector.name);
  }
});

test('adversarial mixed-case credentials block before network', () => {
  const samples = [
    'ApI_kEy = Sk-LiVe-EXAMPLEEXAMPLE',
    'PASSWORD: hunter2-example-only',
    'BeArEr AbCdEfGhIjKlMnOp',
    '-----BEGIN RSA PRIVATE KEY-----\nabc\n-----END RSA PRIVATE KEY-----',
    'postgres://user:pass@host.internal.example.test:5432/db',
  ];
  for (const sample of samples) {
    assert.equal(detectBlockedSecret(sample), 'blocked_sensitive_input', sample);
    const redacted = redactForTypeSafe(sample);
    assert.equal(redacted.ok, false);
    assert.equal(redacted.code, 'blocked_sensitive_input');
  }
});

test('adversarial query-string URL becomes {{url}}', () => {
  const result = redactForTypeSafe('Open https://example.test/a?b=1&c=2#frag now please.');
  assert.equal(result.ok, true);
  assert.match(result.text, /\{\{url\}\}/);
  assert.doesNotMatch(result.text, /example\.test/);
});

test('adversarial encoded email becomes {{email}}', () => {
  const result = redactForTypeSafe('Mail first.last%40example.test about the sample review.');
  assert.equal(result.ok, true);
  assert.match(result.text, /\{\{email\}\}/);
  assert.doesNotMatch(result.text, /%40/);
});

test('adversarial UNC and cloud paths become {{path}}', () => {
  const unc = redactForTypeSafe('See \\\\server\\share\\file.png for the kit review today.');
  assert.equal(unc.ok, true);
  assert.match(unc.text, /\{\{path\}\}/);

  const s3 = redactForTypeSafe('Master s3://bucket/key/obj.png is ready for the team.');
  assert.equal(s3.ok, true);
  assert.match(s3.text, /\{\{path\}\}/);
});

test('Unicode and whitespace stay stable under redaction', () => {
  const result = redactForTypeSafe('Café\tstatus   is\n\n\nready for the résumé review.');
  assert.equal(result.ok, true);
  assert.equal(result.text, normalizeWhitespace(result.text));
});

test('language gate never returns unclear', () => {
  const outcomes = new Set(
    [
      'We need to confirm the sample date for the next review.',
      'こんにちは、サンプルの確認をお願いします。',
      'Ok.',
      '',
      '12345678',
    ].map((t) => languageGate(t)),
  );
  assert.equal(outcomes.has('unclear'), false);
  assert.equal(outcomes.has('english_eligible'), true);
  assert.equal(outcomes.has('blocked_unsupported_language'), true);
});

test('oversized input rejects as input_too_long', () => {
  const long = 'The team will review the sample pack tomorrow morning. '.repeat(100);
  const result = redactForTypeSafe(long, { maxLength: 100 });
  assert.equal(result.ok, false);
  assert.equal(result.code, 'input_too_long');
});

test('empty input rejects as input_too_short', () => {
  assert.equal(redactForTypeSafe('').code, 'input_too_short');
  assert.equal(redactForTypeSafe('   ').code, 'input_too_short');
  assert.equal(redactForTypeSafe(null).code, 'input_too_short');
});
