import assert from 'node:assert/strict';
import { copyFileSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  buildQualityManifestWithFiles,
  computeFileHashes,
  defaultSharedDir,
  HASHED_FILES,
  qualityManifestFromFile,
  writeQualityManifest,
} from '../../shared/jev-activity-triage/qualityManifest.mjs';

const sharedDir = defaultSharedDir();

function walkKeys(value, out = []) {
  if (value === null || typeof value !== 'object') return out;
  if (Array.isArray(value)) {
    for (const item of value) walkKeys(item, out);
    return out;
  }
  for (const [key, child] of Object.entries(value)) {
    out.push(key);
    walkKeys(child, out);
  }
  return out;
}

function tempSharedCopy() {
  const dir = mkdtempSync(join(tmpdir(), 'jev-qm-'));
  for (const name of HASHED_FILES) {
    copyFileSync(join(sharedDir, name), join(dir, name));
  }
  return dir;
}

test('writeQualityManifest digest is stable across writes', () => {
  const dir = mkdtempSync(join(tmpdir(), 'jev-qm-'));
  const a = writeQualityManifest(join(dir, 'a.json'), {}, sharedDir);
  const b = writeQualityManifest(join(dir, 'b.json'), {}, sharedDir);
  assert.equal(a.digest, b.digest);
  assert.deepEqual(a.manifest, b.manifest);

  const loaded = qualityManifestFromFile(join(dir, 'a.json'));
  assert.equal(loaded.ok, true);
  assert.equal(loaded.recomputed, a.digest);
});

test('file-hash binding changes when a module byte changes', () => {
  const dir = tempSharedCopy();
  const before = writeQualityManifest(join(dir, 'before.json'), {}, dir);
  const hashesBefore = computeFileHashes(dir);

  const target = join(dir, 'contract.mjs');
  writeFileSync(target, `${readFileSync(target, 'utf8')}\n// touched\n`);
  const after = writeQualityManifest(join(dir, 'after.json'), {}, dir);
  const hashesAfter = computeFileHashes(dir);

  assert.notEqual(hashesBefore['contract.mjs'], hashesAfter['contract.mjs']);
  assert.notEqual(before.digest, after.digest);
  assert.equal(
    hashesBefore['canonicalize.mjs'],
    hashesAfter['canonicalize.mjs'],
    'unrelated module hash stays stable',
  );
});

test('quality manifest has no US-dollar keys', () => {
  const manifest = buildQualityManifestWithFiles({}, sharedDir);
  for (const key of walkKeys(manifest)) {
    assert.doesNotMatch(key, /usd|cost|price|\$/i, `forbidden key: ${key}`);
  }
  assert.equal(manifest.dictionary_mode, 'synthetic_preview');
  assert.equal(manifest.provider_model, 'jev-1');
  assert.equal(manifest.worker_concurrency, 2);
  assert.equal(manifest.eligible_comment_limit, 1000);
  assert.equal(manifest.eligible_window_days, 30);
  assert.deepEqual(manifest.language_allowlist, ['en']);
  assert.deepEqual(manifest.file_hashes, computeFileHashes(sharedDir));
});
