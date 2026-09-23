import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  ACTIONABLE_CLASSES,
  assignGroupsToSplits,
  assignRowGroups,
  assertSplitIsolation,
  buildExactLabelConfusion,
  buildProtocolManifest,
  classCounts,
  CONFIRMATORY,
  computeMetrics,
  evaluateConfirmatoryCandidate,
  groupId,
  keyedCandidateOrder,
  LIMITS,
  maxReplacements,
  microPR,
  NO_ACTION_PREDICTIONS,
  PER_CLASS_MIN_N,
  perClassPR,
  planReplacement,
  precisionOf,
  recallOf,
  REPLACEMENT_CAP_RATIO,
  resolveRubricLabel,
  RUBRIC_PRECEDENCE,
  shouldInvalidateDataset,
  toPredictionLabel,
} from '../../shared/jev-activity-triage/protocol.mjs';
import { buildQualityManifest } from '../../shared/jev-activity-triage/contract.mjs';

const cases = readFileSync(
  new URL('../../fixtures/jev-activity-triage/protocol-cases.jsonl', import.meta.url),
  'utf8',
)
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => JSON.parse(line));

const rubricCases = cases.filter((c) => c.type === 'rubric');
const metricsCases = cases.filter((c) => c.type === 'metrics');
const confirmatoryCases = cases.filter((c) => c.type === 'confirmatory');

function brokenRubricCase(base) {
  return { ...base, expect_label: 'wrong', expect_error: undefined };
}

// ---------------------------------------------------------------------------
// Frozen constants
// ---------------------------------------------------------------------------

test('protocol constants are frozen closed sets', () => {
  assert.deepEqual([...RUBRIC_PRECEDENCE], [
    'decision',
    'blocker_dependency',
    'follow_up_reminder',
    'routine_update',
  ]);
  assert.deepEqual([...ACTIONABLE_CLASSES], ['blocker_dependency', 'decision', 'follow_up_reminder']);
  assert.equal(CONFIRMATORY.max_preregistered_candidates, 2);
  assert.equal(CONFIRMATORY.retries, 0);
  assert.equal(CONFIRMATORY.sends_per_case, 1);
  assert.equal(CONFIRMATORY.provider_failure_fail_rate, 0.02);
  assert.equal(REPLACEMENT_CAP_RATIO, 0.1);
  assert.equal(PER_CLASS_MIN_N, 60);
  assert.equal(LIMITS.concurrency, 2);
  assert.deepEqual({ ...LIMITS.env_per_24h }, { requests: 250, tokens: 250000 });
  assert.deepEqual({ ...LIMITS.profile_per_24h }, { requests: 50, tokens: 50000 });
  assert.equal(LIMITS.eligible_comment_limit, 1000);
  assert.equal(LIMITS.eligible_window_days, 30);
  assert.ok(NO_ACTION_PREDICTIONS.includes('provider_failure'));
  assert.ok(NO_ACTION_PREDICTIONS.includes('suppressed'));
});

test('limits match the contract quality manifest (no dollar ceilings)', () => {
  const quality = buildQualityManifest();
  assert.equal(quality.worker_concurrency, LIMITS.concurrency);
  assert.deepEqual(quality.rate_limit_env_per_24h, { ...LIMITS.env_per_24h });
  assert.deepEqual(quality.rate_limit_profile_per_24h, { ...LIMITS.profile_per_24h });
  assert.equal(quality.eligible_comment_limit, LIMITS.eligible_comment_limit);
  assert.equal(quality.eligible_window_days, LIMITS.eligible_window_days);
  assert.equal(quality.provider_retry, 'none_confirmatory');
  assert.equal('usd_ceiling' in quality, false);
  const manifest = buildProtocolManifest();
  assert.equal(manifest.protocol_version, 'poppim-jev-eval-protocol-v1');
  assert.deepEqual(manifest.language_allowlist, ['en']);
});

// ---------------------------------------------------------------------------
// Split isolation
// ---------------------------------------------------------------------------

test('product/thread/template/near-dup groups stay wholly in one split', () => {
  const rows = [
    { id: 'r1', product: 'P1', thread: 'T1', template: 'TPL1', near_dup: 'ND1' },
    { id: 'r2', product: 'P1', thread: 'T2', template: 'TPL2', near_dup: 'ND2' },
    { id: 'r3', product: 'P2', thread: 'T3', template: 'TPL1', near_dup: 'ND3' },
    { id: 'r4', product: 'P3', thread: 'T4', template: 'TPL3', near_dup: 'ND1' },
    { id: 'r5', product: 'P4', thread: 'T5', template: 'TPL4', near_dup: 'ND4' },
  ];
  // r1,r2 share product P1; r1,r3 share template; r1,r4 share near_dup => one mega-group
  const groups = assignRowGroups(rows);
  assert.equal(groups.r1, groups.r2);
  assert.equal(groups.r1, groups.r3);
  assert.equal(groups.r1, groups.r4);
  assert.notEqual(groups.r1, groups.r5);

  const uniqueGroups = [...new Set(Object.values(groups))];
  const splitByGroup = assignGroupsToSplits(uniqueGroups, { seed: 'split-seed-a' });
  const rowSplit = {};
  for (const row of rows) rowSplit[row.id] = splitByGroup[groups[row.id]];
  const isolated = assertSplitIsolation(rowSplit, groups);
  assert.equal(isolated.ok, true);
});

test('group collision is detected when one group spans both splits', () => {
  const rowGroup = { a: 'g1', b: 'g1', c: 'g2' };
  const rowSplit = { a: 'calibration', b: 'natural_holdout', c: 'calibration' };
  const result = assertSplitIsolation(rowSplit, rowGroup);
  assert.equal(result.ok, false);
  assert.match(result.reason, /group_collision:g1/);
});

test('assignGroupsToSplits is deterministic under replay and varies by seed domain', () => {
  const groups = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6'];
  const a1 = assignGroupsToSplits(groups, { seed: 'replay-seed' });
  const a2 = assignGroupsToSplits(groups, { seed: 'replay-seed' });
  assert.deepEqual(a1, a2);
  for (const g of groups) {
    assert.ok(['calibration', 'natural_holdout'].includes(a1[g]));
  }
  const both = groups.every((g) => a1[g] === 'calibration') || groups.every((g) => a1[g] === 'natural_holdout');
  assert.equal(both, false, 'multi-group pools must use both splits');
});

test('groupId and keyedCandidateOrder are stable', () => {
  const id = groupId({ product: 'P1', thread: 'T9' });
  assert.equal(id, groupId({ thread: 'T9', product: 'P1' }));
  const casesForOrder = [
    { id: 'c1', group_id: 'g1', split: 'calibration' },
    { id: 'c2', group_id: 'g2', split: 'calibration' },
    { id: 'c3', group_id: 'g3', split: 'natural_holdout' },
  ];
  const o1 = keyedCandidateOrder(casesForOrder, { seed: 'ord', split: 'calibration' });
  const o2 = keyedCandidateOrder(casesForOrder, { seed: 'ord', split: 'calibration' });
  assert.deepEqual(o1, o2);
  assert.equal(o1.length, 2);
  assert.ok(o1.every((c) => c.id !== 'c3'));
});

// ---------------------------------------------------------------------------
// Replacement boundaries: 0 / 10% / >10%
// ---------------------------------------------------------------------------

test('replacement allows zero and exactly 10% but not more than 10%', () => {
  // target 10 → cap 1 (exactly 10%)
  assert.equal(maxReplacements(10), 1);
  assert.equal(maxReplacements(20), 2);
  assert.equal(maxReplacements(0), 0);

  const used = new Set(['u1']);
  const groupSplit = { gA: 'calibration' };
  const next = { id: 'n1', group_id: 'gA', split: 'calibration' };

  // 0 replacements so far: first replacement OK
  const first = planReplacement({
    targetSize: 10,
    replacedSoFar: 0,
    nextCandidate: next,
    requiredSplit: 'calibration',
    usedIds: used,
    groupSplit,
  });
  assert.equal(first.ok, true);
  assert.equal(first.replaced, 1);

  // exactly at 10% (1/10): still allowed to *be* that replacement (that was `first`)
  // a second replacement (2/10 = 20%) exceeds the cap and invalidates
  const second = planReplacement({
    targetSize: 10,
    replacedSoFar: 1,
    nextCandidate: { id: 'n2', group_id: 'gA', split: 'calibration' },
    requiredSplit: 'calibration',
    usedIds: used,
    groupSplit,
  });
  assert.equal(second.ok, false);
  assert.equal(second.invalidate_dataset, true);
  assert.equal(second.code, 'invalidate_replacement_cap');

  // already over cap
  const over = planReplacement({
    targetSize: 10,
    replacedSoFar: 2,
    nextCandidate: next,
    requiredSplit: 'calibration',
    usedIds: used,
    groupSplit,
  });
  assert.equal(over.ok, false);
  assert.equal(over.invalidate_dataset, true);

  // shouldInvalidateDataset boundaries
  assert.equal(shouldInvalidateDataset({ targetSize: 10, replacements: 0 }), false);
  assert.equal(shouldInvalidateDataset({ targetSize: 10, replacements: 1 }), false);
  assert.equal(shouldInvalidateDataset({ targetSize: 10, replacements: 2 }), true);
  assert.equal(shouldInvalidateDataset({ targetSize: 10, replacements: 0, postABChange: true }), true);
  assert.equal(shouldInvalidateDataset({ targetSize: 20, replacements: 2 }), false);
  assert.equal(shouldInvalidateDataset({ targetSize: 20, replacements: 3 }), true);
});

test('replacement rejects wrong-split candidates (never move groups across splits)', () => {
  const result = planReplacement({
    targetSize: 10,
    replacedSoFar: 0,
    nextCandidate: { id: 'x1', group_id: 'gH', split: 'natural_holdout' },
    requiredSplit: 'calibration',
    usedIds: new Set(),
    groupSplit: { gH: 'natural_holdout' },
  });
  assert.equal(result.ok, false);
  assert.equal(result.code, 'group_collision_wrong_split');
  assert.equal(result.invalidate_dataset, false);

  const viaMap = planReplacement({
    targetSize: 10,
    replacedSoFar: 0,
    nextCandidate: { id: 'x2', group_id: 'gH', split: 'calibration' },
    requiredSplit: 'calibration',
    usedIds: new Set(),
    groupSplit: { gH: 'natural_holdout' },
  });
  assert.equal(viaMap.ok, false);
  assert.equal(viaMap.code, 'group_collision_wrong_split');
});

test('replacement rejects used ids and exhausted pools', () => {
  const usedResult = planReplacement({
    targetSize: 10,
    replacedSoFar: 0,
    nextCandidate: { id: 'u1', group_id: 'gA', split: 'calibration' },
    requiredSplit: 'calibration',
    usedIds: ['u1'],
    groupSplit: { gA: 'calibration' },
  });
  assert.equal(usedResult.ok, false);
  assert.equal(usedResult.code, 'already_used');

  const empty = planReplacement({
    targetSize: 10,
    replacedSoFar: 0,
    nextCandidate: null,
    requiredSplit: 'calibration',
    usedIds: [],
    groupSplit: {},
  });
  assert.equal(empty.ok, false);
  assert.equal(empty.code, 'exhausted_pool');
  assert.equal(empty.invalidate_dataset, false);
});

test('post-A/B change invalidates the entire dataset', () => {
  const result = planReplacement({
    targetSize: 10,
    replacedSoFar: 0,
    nextCandidate: { id: 'n1', group_id: 'gA', split: 'calibration' },
    requiredSplit: 'calibration',
    usedIds: new Set(),
    groupSplit: { gA: 'calibration' },
    postABChange: true,
  });
  assert.equal(result.ok, false);
  assert.equal(result.code, 'invalidate_post_ab_change');
  assert.equal(result.invalidate_dataset, true);
  assert.equal(shouldInvalidateDataset({ targetSize: 100, replacements: 0, postABChange: true }), true);
});

// ---------------------------------------------------------------------------
// Rubric precedence (invented multi-intent cases)
// ---------------------------------------------------------------------------

test('rubric fixture vectors match frozen precedence', () => {
  assert.ok(rubricCases.length >= 10);
  for (const vector of rubricCases) {
    const result = resolveRubricLabel({
      present: vector.present,
      explicitPrimary: vector.explicit_primary ?? null,
      missingContext: vector.missing_context === true,
      noIntentFits: vector.no_intent_fits === true,
    });
    if (vector.expect_error) {
      assert.equal(result.ok, false, vector.id);
      assert.equal(result.reason, vector.expect_error, vector.id);
    } else {
      assert.equal(result.ok, true, vector.id);
      assert.equal(result.label, vector.expect_label, `${vector.id}: ${JSON.stringify(result)}`);
    }
  }
});

test('broken rubric vector is discovered', () => {
  const base = rubricCases.find((c) => c.expect_label === 'decision' && !c.expect_error);
  const broken = brokenRubricCase(base);
  const result = resolveRubricLabel({
    present: broken.present,
    explicitPrimary: broken.explicit_primary ?? null,
    missingContext: false,
  });
  if (result.ok) {
    assert.notEqual(result.label, broken.expect_label);
  } else {
    assert.equal(result.ok, false);
  }
  // Multi-intent without primary must not collapse to decision via precedence alone.
  const multi = resolveRubricLabel({ present: ['decision', 'blocker_dependency'], explicitPrimary: null });
  assert.equal(multi.label, 'unclear');
});

// ---------------------------------------------------------------------------
// Confusion-matrix goldens and metric equations
// ---------------------------------------------------------------------------

test('metrics fixture vectors match frozen equations', () => {
  assert.ok(metricsCases.length >= 3);
  for (const vector of metricsCases) {
    const metrics = computeMetrics(vector.pairs);
    assert.equal(metrics.n, vector.expect.n ?? vector.pairs.length, vector.id);
    if (vector.expect.exact_matches !== undefined) {
      assert.equal(metrics.confusion.exact_matches, vector.expect.exact_matches, vector.id);
    }
    if (vector.expect.micro) {
      assert.equal(metrics.micro.tp, vector.expect.micro.tp, vector.id);
      assert.equal(metrics.micro.fp, vector.expect.micro.fp, vector.id);
      assert.equal(metrics.micro.fn, vector.expect.micro.fn, vector.id);
      if (vector.expect.micro.precision === null) assert.equal(metrics.micro.precision, null, vector.id);
      else assert.ok(Math.abs(metrics.micro.precision - vector.expect.micro.precision) < 1e-12, vector.id);
      if (vector.expect.micro.recall === null) assert.equal(metrics.micro.recall, null, vector.id);
      else assert.ok(Math.abs(metrics.micro.recall - vector.expect.micro.recall) < 1e-12, vector.id);
    }
    if (vector.expect.class_counts) {
      for (const [cls, expected] of Object.entries(vector.expect.class_counts)) {
        const counts = classCounts(vector.pairs, cls);
        assert.equal(counts.tp, expected.tp, `${vector.id} ${cls} tp`);
        assert.equal(counts.fp, expected.fp, `${vector.id} ${cls} fp`);
        assert.equal(counts.fn, expected.fn, `${vector.id} ${cls} fn`);
        assert.equal(counts.truth_n, expected.truth_n, `${vector.id} ${cls} truth_n`);
        assert.equal(counts.pred_n, expected.pred_n, `${vector.id} ${cls} pred_n`);
      }
    }
    if (vector.expect.per_class_reportable === false) {
      for (const cls of ACTIONABLE_CLASSES) {
        assert.equal(metrics.per_class[cls].reportable, false, vector.id);
        assert.equal(metrics.per_class[cls].precision, null, vector.id);
      }
    }
    if (vector.expect.provider_failures !== undefined) {
      assert.equal(metrics.provider_failures, vector.expect.provider_failures, vector.id);
    }
    if (vector.expect.blocked !== undefined) {
      assert.equal(metrics.blocked, vector.expect.blocked, vector.id);
    }
    if (vector.expect.suppressed !== undefined) {
      assert.equal(metrics.suppressed, vector.expect.suppressed, vector.id);
    }
  }
});

test('confusion-matrix golden cells (met-001)', () => {
  const vector = metricsCases.find((c) => c.id === 'met-001');
  const confusion = buildExactLabelConfusion(vector.pairs);
  assert.equal(confusion.matrix.decision.decision, 1);
  assert.equal(confusion.matrix.decision.routine_update, 1);
  assert.equal(confusion.matrix.routine_update.decision, 1);
  assert.equal(confusion.matrix.routine_update.routine_update, 1);
  assert.equal(confusion.matrix.routine_update.suppressed, 1);
  assert.equal(confusion.matrix.unclear.unclear, 1);
  assert.equal(confusion.matrix.blocker_dependency.provider_failure, 1);
  assert.equal(confusion.matrix.blocker_dependency.blocked_sensitive_input, 1);
  assert.equal(confusion.matrix.blocker_dependency.blocker_dependency, 1);
  assert.equal(confusion.matrix.follow_up_reminder.follow_up_reminder, 1);
  assert.equal(confusion.matrix.follow_up_reminder.decision, 1);
  assert.equal(confusion.exact_matches, 5);

  // Broken confusion expectation is discovered
  assert.notEqual(confusion.matrix.decision.decision, 0);
});

test('micro precision/recall equations and empty-denominator null', () => {
  assert.equal(precisionOf(3, 2), 0.6);
  assert.equal(precisionOf(0, 0), null);
  assert.equal(recallOf(3, 4), 3 / 7);
  assert.equal(recallOf(0, 0), null);

  const pairs = metricsCases.find((c) => c.id === 'met-001').pairs;
  const micro = microPR(pairs);
  assert.equal(micro.precision, 3 / 5);
  assert.equal(micro.recall, 3 / 7);
  // blocked/provider_failure/suppressed are FN vs actionable truth
  const cBlocker = classCounts(pairs, 'blocker_dependency');
  assert.equal(cBlocker.fn, 2);
  const cFollow = classCounts(pairs, 'follow_up_reminder');
  assert.equal(cFollow.fn, 1);
});

test('per-class metrics report only when n>=60 truth and n>=60 predictions', () => {
  // Synthesize 70 correct decision cases and 5 blocker predictions against truth decision
  const pairs = [];
  for (let i = 0; i < 70; i += 1) {
    pairs.push({ truth: 'decision', prediction: 'decision' });
  }
  for (let i = 0; i < 5; i += 1) {
    pairs.push({ truth: 'decision', prediction: 'blocker_dependency' });
  }
  for (let i = 0; i < 40; i += 1) {
    pairs.push({ truth: 'follow_up_reminder', prediction: 'follow_up_reminder' });
  }
  const report = perClassPR(pairs);
  assert.equal(report.decision.reportable, true);
  assert.ok(Math.abs(report.decision.precision - 70 / 70) < 1e-12);
  assert.ok(Math.abs(report.decision.recall - 70 / 75) < 1e-12);
  // blocker: truth_n=0, pred_n=5 → not reportable
  assert.equal(report.blocker_dependency.reportable, false);
  // follow: truth_n=40 pred_n=40 → below 60 → not reportable
  assert.equal(report.follow_up_reminder.reportable, false);
  assert.equal(PER_CLASS_MIN_N, 60);
});

test('toPredictionLabel maps suppressed/no_suggestion and unknown → provider_failure', () => {
  assert.equal(toPredictionLabel('no_suggestion'), 'suppressed');
  assert.equal(toPredictionLabel('suppressed'), 'suppressed');
  assert.equal(toPredictionLabel('decision'), 'decision');
  assert.equal(toPredictionLabel('provider_failure'), 'provider_failure');
  assert.equal(toPredictionLabel('timeout_ish'), 'provider_failure');
});

// ---------------------------------------------------------------------------
// Confirmatory protocol
// ---------------------------------------------------------------------------

test('confirmatory fixture vectors match frozen policy', () => {
  assert.ok(confirmatoryCases.length >= 5);
  for (const vector of confirmatoryCases) {
    const result = evaluateConfirmatoryCandidate({
      totalCases: vector.totalCases,
      providerFailureCount: vector.providerFailureCount,
      sendAttempts: vector.sendAttempts,
      retries: vector.retries,
      candidateIndex: vector.candidateIndex,
    });
    assert.equal(result.ok, vector.expect_ok, `${vector.id}: ${JSON.stringify(result)}`);
    if (vector.expect_code) assert.equal(result.code, vector.expect_code, vector.id);
  }
});

test('every case stays in denominator; >=2% provider failure fails candidate', () => {
  const fail = evaluateConfirmatoryCandidate({ totalCases: 50, providerFailureCount: 1, sendAttempts: 50 });
  assert.equal(fail.ok, false);
  assert.equal(fail.provider_failure_rate, 0.02);
  assert.equal(fail.denominator, 50);

  const pass = evaluateConfirmatoryCandidate({ totalCases: 100, providerFailureCount: 1, sendAttempts: 100 });
  assert.equal(pass.ok, true);

  // dropped/unresolved would shrink denominator — policy requires totalCases>0 and sends<=cases
  const dropped = evaluateConfirmatoryCandidate({ totalCases: 0, providerFailureCount: 0 });
  assert.equal(dropped.ok, false);
  assert.equal(dropped.code, 'empty_denominator');
});

// ---------------------------------------------------------------------------
// Deterministic replay of the full protocol object
// ---------------------------------------------------------------------------

test('protocol manifest is deterministic across calls', () => {
  const a = buildProtocolManifest();
  const b = buildProtocolManifest();
  assert.deepEqual(a, b);
  assert.equal(JSON.stringify(a), JSON.stringify(b));
  assert.equal(a.max_confirmatory_candidates, 2);
  assert.equal(a.language_allowlist.length, 1);
  assert.equal(a.confirmatory.retries, 0);
});
