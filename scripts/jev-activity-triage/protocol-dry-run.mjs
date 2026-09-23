#!/usr/bin/env node
/**
 * Protocol dry-run over invented fixtures only.
 * Proves sampling/split/replacement/rubric/metrics/confirmatory/limits
 * on synthetic + protocol cases. No real comments, no provider calls.
 * Prints aggregate counts only. Exit non-zero on any violation.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { buildQualityManifest } from '../../shared/jev-activity-triage/contract.mjs';
import {
  CONFIRMATORY,
  LIMITS,
  assignGroupsToSplits,
  assignRowGroups,
  assertSplitIsolation,
  buildProtocolManifest,
  computeMetrics,
  evaluateConfirmatoryCandidate,
  keyedCandidateOrder,
  maxReplacements,
  planReplacement,
  resolveRubricLabel,
  shouldInvalidateDataset,
} from '../../shared/jev-activity-triage/protocol.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

function loadJsonl(rel) {
  const raw = readFileSync(join(ROOT, rel), 'utf8');
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function main() {
  const synthetic = loadJsonl(join('fixtures', 'jev-activity-triage', 'synthetic.jsonl'));
  const protocolCases = loadJsonl(join('fixtures', 'jev-activity-triage', 'protocol-cases.jsonl'));
  const failures = [];
  const counts = {
    synthetic_total: synthetic.length,
    protocol_total: protocolCases.length,
    rubric_checked: 0,
    metrics_checked: 0,
    confirmatory_checked: 0,
    split_rows: 0,
    replacements_ok: 0,
    violations: 0,
  };

  // --- limits vs contract ---
  const quality = buildQualityManifest();
  if (quality.worker_concurrency !== LIMITS.concurrency) failures.push('limits:concurrency');
  if (quality.eligible_comment_limit !== LIMITS.eligible_comment_limit) failures.push('limits:comment_limit');
  if (quality.eligible_window_days !== LIMITS.eligible_window_days) failures.push('limits:window_days');
  if (CONFIRMATORY.max_preregistered_candidates !== 2) failures.push('limits:max_candidates');
  if (CONFIRMATORY.retries !== 0) failures.push('limits:retries');
  if (buildProtocolManifest().language_allowlist.join(',') !== 'en') failures.push('limits:language');

  // --- splits on synthetic fixtures (group = category) ---
  const rows = synthetic.map((row) => ({
    id: row.id,
    product: `prod-${row.category}`,
    thread: `thr-${row.id}`,
    template: `tpl-${row.category}`,
    near_dup: `nd-${row.id}`,
  }));
  const rowGroup = assignRowGroups(rows);
  const uniqueGroups = [...new Set(Object.values(rowGroup))];
  const groupSplit = assignGroupsToSplits(uniqueGroups, { seed: 'protocol-dry-run-v1' });
  const rowSplit = {};
  for (const row of rows) rowSplit[row.id] = groupSplit[rowGroup[row.id]];
  counts.split_rows = rows.length;
  const isolated = assertSplitIsolation(rowSplit, rowGroup);
  if (!isolated.ok) failures.push(`split:${isolated.reason}`);

  // --- deterministic candidate order + replacement simulation ---
  const planned = rows.map((row) => ({
    id: row.id,
    group_id: rowGroup[row.id],
    split: rowSplit[row.id],
  }));
  for (const split of ['calibration', 'natural_holdout']) {
    const order = keyedCandidateOrder(planned, { seed: 'protocol-dry-run-v1', split });
    const used = new Set(order.slice(0, 1).map((c) => c.id));
    const targetSize = Math.max(order.length, 10);
    const next = order[1] ?? null;
    const result = planReplacement({
      targetSize,
      replacedSoFar: 0,
      nextCandidate: next,
      requiredSplit: split,
      usedIds: used,
      groupSplit,
    });
    if (result.ok) counts.replacements_ok += 1;
    else if (result.code !== 'exhausted_pool') failures.push(`replacement:${split}:${result.code}`);
    // boundary: >10% must invalidate
    if (!shouldInvalidateDataset({ targetSize: 10, replacements: 1 })) {
      // 1/10 is exactly 10% → allowed
    }
    if (!shouldInvalidateDataset({ targetSize: 10, replacements: 2 })) {
      failures.push('replacement:cap_not_enforced');
    }
    if (shouldInvalidateDataset({ targetSize: 10, replacements: 0 })) {
      failures.push('replacement:zero_replacements_invalid');
    }
    if (maxReplacements(10) !== 1) failures.push('replacement:cap_math');
  }

  // --- rubric ---
  for (const vector of protocolCases.filter((c) => c.type === 'rubric')) {
    counts.rubric_checked += 1;
    const result = resolveRubricLabel({
      present: vector.present,
      explicitPrimary: vector.explicit_primary ?? null,
      missingContext: vector.missing_context === true,
      noIntentFits: vector.no_intent_fits === true,
    });
    if (vector.expect_error) {
      if (result.ok || result.reason !== vector.expect_error) {
        failures.push(`rubric:${vector.id}`);
      }
    } else if (!result.ok || result.label !== vector.expect_label) {
      failures.push(`rubric:${vector.id}`);
    }
  }

  // --- metrics ---
  for (const vector of protocolCases.filter((c) => c.type === 'metrics')) {
    counts.metrics_checked += 1;
    const metrics = computeMetrics(vector.pairs);
    const exp = vector.expect ?? {};
    if (exp.n !== undefined && metrics.n !== exp.n) failures.push(`metrics:${vector.id}:n`);
    if (exp.exact_matches !== undefined && metrics.confusion.exact_matches !== exp.exact_matches) {
      failures.push(`metrics:${vector.id}:exact`);
    }
    if (exp.micro) {
      if (metrics.micro.tp !== exp.micro.tp) failures.push(`metrics:${vector.id}:tp`);
      if (metrics.micro.fp !== exp.micro.fp) failures.push(`metrics:${vector.id}:fp`);
      if (metrics.micro.fn !== exp.micro.fn) failures.push(`metrics:${vector.id}:fn`);
      if (exp.micro.precision === null && metrics.micro.precision !== null) {
        failures.push(`metrics:${vector.id}:precision`);
      }
      if (exp.micro.recall === null && metrics.micro.recall !== null) {
        failures.push(`metrics:${vector.id}:recall`);
      }
      if (typeof exp.micro.precision === 'number' && Math.abs(metrics.micro.precision - exp.micro.precision) > 1e-12) {
        failures.push(`metrics:${vector.id}:precision`);
      }
      if (typeof exp.micro.recall === 'number' && Math.abs(metrics.micro.recall - exp.micro.recall) > 1e-12) {
        failures.push(`metrics:${vector.id}:recall`);
      }
    }
  }

  // --- confirmatory ---
  for (const vector of protocolCases.filter((c) => c.type === 'confirmatory')) {
    counts.confirmatory_checked += 1;
    const result = evaluateConfirmatoryCandidate({
      totalCases: vector.totalCases,
      providerFailureCount: vector.providerFailureCount,
      sendAttempts: vector.sendAttempts,
      retries: vector.retries,
      candidateIndex: vector.candidateIndex,
    });
    if (result.ok !== vector.expect_ok) failures.push(`confirmatory:${vector.id}`);
    if (vector.expect_code && result.code !== vector.expect_code) {
      failures.push(`confirmatory:${vector.id}:code`);
    }
  }

  counts.violations = failures.length;
  const lines = [
    `protocol=${buildProtocolManifest().protocol_version}`,
    `synthetic_total=${counts.synthetic_total}`,
    `protocol_total=${counts.protocol_total}`,
    `rubric_checked=${counts.rubric_checked}`,
    `metrics_checked=${counts.metrics_checked}`,
    `confirmatory_checked=${counts.confirmatory_checked}`,
    `split_rows=${counts.split_rows}`,
    `replacements_ok=${counts.replacements_ok}`,
    `violations=${counts.violations}`,
  ];
  if (failures.length > 0) lines.push(`failed_checks=${failures.join(',')}`);
  process.stdout.write(lines.join('\n') + '\n');
  process.exit(failures.length > 0 ? 1 : 0);
}

main();
