/**
 * Quality-manifest write/read helpers.
 * File hashes are computed at write time over shared/jev-activity-triage bytes.
 * No US-dollar fields. Digest is qualityReleaseDigest over the manifest body.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { qualityReleaseDigest, sha256Hex } from './canonicalize.mjs';
import { buildQualityManifest } from './contract.mjs';

/** Modules + golden vectors bound into the written manifest. */
export const HASHED_FILES = Object.freeze([
  'canonicalize.mjs',
  'contract.mjs',
  'golden-vectors.json',
  'protocol.mjs',
  'redact.mjs',
  'safeResponse.mjs',
]);

export function defaultSharedDir(metaUrl = import.meta.url) {
  return dirname(fileURLToPath(metaUrl));
}

/**
 * SHA-256 of each bound file under rootDir (hex).
 * @param {string} [rootDir]
 */
export function computeFileHashes(rootDir = defaultSharedDir()) {
  const file_hashes = {};
  for (const name of HASHED_FILES) {
    file_hashes[name] = sha256Hex(readFileSync(join(rootDir, name)));
  }
  return file_hashes;
}

/**
 * Manifest body including write-time file hashes (no digest field).
 * @param {object} [overrides]
 * @param {string} [rootDir]
 */
export function buildQualityManifestWithFiles(overrides = {}, rootDir) {
  return {
    ...buildQualityManifest(overrides),
    file_hashes: computeFileHashes(rootDir),
  };
}

/**
 * Write quality-manifest.json and return the release digest.
 * @param {string} path
 * @param {object} [overrides]
 * @param {string} [rootDir]
 */
export function writeQualityManifest(path, overrides = {}, rootDir) {
  const manifest = buildQualityManifestWithFiles(overrides, rootDir);
  const digest = qualityReleaseDigest(manifest);
  writeFileSync(path, `${JSON.stringify({ ...manifest, quality_release_digest: digest }, null, 2)}\n`);
  return { manifest, digest, path };
}

/**
 * Load a written quality manifest and recompute its release digest.
 * @param {string} path
 */
export function qualityManifestFromFile(path) {
  const raw = JSON.parse(readFileSync(path, 'utf8'));
  const { quality_release_digest: stored, ...manifest } = raw;
  const recomputed = qualityReleaseDigest(manifest);
  return {
    ok: stored === recomputed,
    manifest,
    quality_release_digest: stored,
    recomputed,
    path,
  };
}
