#!/usr/bin/env node
/**
 * Write docs/verification/jev-activity-triage/quality-manifest.json
 * and print JEV_RELEASE_DIGEST.
 */

import { fileURLToPath } from 'node:url';

import { writeQualityManifest } from '../../shared/jev-activity-triage/qualityManifest.mjs';

const outPath = fileURLToPath(
  new URL('../../docs/verification/jev-activity-triage/quality-manifest.json', import.meta.url),
);

const { digest } = writeQualityManifest(outPath);
console.log(`JEV_RELEASE_DIGEST=${digest}`);
