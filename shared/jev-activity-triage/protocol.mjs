/**
 * Jev real-evaluation protocol (pure, freezeable).
 * Invented-fixture only: no real comments, no provider calls, no secrets.
 * Sampling, split, replacement, rubric, metrics, confirmatory, and limits.
 */

export const PROTOCOL_VERSION = 'poppim-jev-eval-protocol-v1';
export const LANGUAGE_ALLOWLIST = Object.freeze(['en']);
export const MAX_CONFIRMATORY_CANDIDATES = 2;

export const SPLITS = Object.freeze(['calibration', 'natural_holdout']);
export const GROUP_KEYS = Object.freeze(['product', 'thread', 'template', 'near_dup']);

export const KIND_LABELS = Object.freeze([
  'routine_update',
  'blocker_dependency',
  'decision',
  'follow_up_reminder',
  'unclear',
]);

export const ACTIONABLE_CLASSES = Object.freeze([
  'blocker_dependency',
  'decision',
  'follow_up_reminder',
]);

/** No-action prediction outcomes (never an action suggestion). */
export const NO_ACTION_PREDICTIONS = Object.freeze([
  'routine_update',
  'unclear',
  'suppressed',
  'blocked_sensitive_input',
  'blocked_unsupported_language',
  'provider_failure',
]);

export const SPECIAL_PREDICTIONS = Object.freeze([
  'suppressed',
  'blocked_sensitive_input',
  'blocked_unsupported_language',
  'provider_failure',
]);

export const PREDICTION_VALUES = Object.freeze([...KIND_LABELS, ...SPECIAL_PREDICTIONS]);

/** Rubric precedence: explicit decision > blocker_dependency > follow_up_reminder > routine_update. */
export const RUBRIC_PRECEDENCE = Object.freeze([
  'decision',
  'blocker_dependency',
  'follow_up_reminder',
  'routine_update',
]);

export const REPLACEMENT_CAP_RATIO = 0.1;
export const PER_CLASS_MIN_N = 60;

export const CONFIRMATORY = Object.freeze({
  max_preregistered_candidates: 2,
  sends_per_case: 1,
  retries: 0,
  provider_failure_fail_rate: 0.02,
  every_case_in_denominator: true,
  family_wise_alpha: 0.05,
  clustered_lower_bound_level: 0.975,
});

export const LIMITS = Object.freeze({
  concurrency: 2,
  env_per_24h: Object.freeze({ requests: 250, tokens: 250000 }),
  profile_per_24h: Object.freeze({ requests: 50, tokens: 50000 }),
  eligible_comment_limit: 1000,
  eligible_window_days: 30,
});

export const BOOTSTRAP = Object.freeze({
  replicates: 9999,
  poisson_mean: 1,
  weight: 'requester_weight * product_weight',
  degenerate_policy: 'advance_counter_past_zero_denominator',
});

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function fnv1a32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic unit interval from seed + domain string. */
export function keyedUnit(seed, domain) {
  return mulberry32(fnv1a32(`${seed}|${domain}`))();
}

/**
 * Build a composite group id. All rows sharing any product/thread/template/near_dup
 * key belong to one group and must stay wholly in one split.
 * @param {{product?: string, thread?: string, template?: string, near_dup?: string}} parts
 */
export function groupId(parts) {
  if (!isPlainObject(parts)) throw new TypeError('groupId: parts must be an object');
  const keys = GROUP_KEYS.filter((k) => parts[k] !== undefined && parts[k] !== null && parts[k] !== '');
  if (keys.length === 0) {
    throw new TypeError('groupId: at least one group key is required');
  }
  return keys
    .map((k) => `${k}=${parts[k]}`)
    .sort()
    .join('|');
}

/**
 * Union-find merge of rows that share any group key; returns map rowId -> group id.
 * @param {Array<{id: string} & Record<string, string|undefined>>} rows
 */
export function assignRowGroups(rows) {
  const parent = new Map();
  function find(x) {
    let cur = x;
    while (parent.get(cur) !== cur) {
      parent.set(cur, parent.get(parent.get(cur)));
      cur = parent.get(cur);
    }
    return cur;
  }
  function union(a, b) {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  }

  const keyToFirstRow = new Map();
  for (const row of rows) {
    if (!row || typeof row.id !== 'string') throw new TypeError('assignRowGroups: row.id required');
    parent.set(row.id, row.id);
    for (const key of GROUP_KEYS) {
      const value = row[key];
      if (value === undefined || value === null || value === '') continue;
      const mapKey = `${key}=${value}`;
      if (keyToFirstRow.has(mapKey)) union(row.id, keyToFirstRow.get(mapKey));
      else keyToFirstRow.set(mapKey, row.id);
    }
  }

  const out = {};
  for (const row of rows) {
    out[row.id] = find(row.id);
  }
  return out;
}

/**
 * Deterministic whole-group split assignment. Never splits a group across frames.
 * Stratification hint: higher product diversity in holdout when pool allows.
 * @param {string[]} groupIds unique group ids
 * @param {{seed: string, calibrationShare?: number}} opts
 * @returns {Record<string, 'calibration'|'natural_holdout'>}
 */
export function assignGroupsToSplits(groupIds, opts) {
  const seed = opts?.seed;
  if (typeof seed !== 'string' || seed.length < 1) throw new TypeError('assignGroupsToSplits: seed required');
  const share = opts?.calibrationShare ?? 0.4;
  const unique = [...new Set(groupIds)].sort();
  const ordered = unique
    .map((id) => ({ id, u: keyedUnit(seed, `split|${id}`) }))
    .sort((a, b) => (a.u - b.u) || (a.id < b.id ? -1 : 1));
  const cut = Math.max(1, Math.min(ordered.length - 1 || 1, Math.floor(ordered.length * share)));
  const out = {};
  ordered.forEach((entry, idx) => {
    out[entry.id] = idx < cut ? 'calibration' : 'natural_holdout';
  });
  // Single-group edge: put it in calibration (still wholly one split).
  if (ordered.length === 1) out[ordered[0].id] = 'calibration';
  return out;
}

/**
 * Assert every group maps to exactly one split.
 * @param {Record<string, string>} rowSplit rowId -> split
 * @param {Record<string, string>} rowGroup rowId -> groupId
 * @returns {{ok: true} | {ok: false, reason: string}}
 */
export function assertSplitIsolation(rowSplit, rowGroup) {
  const groupSplits = new Map();
  for (const [rowId, split] of Object.entries(rowSplit)) {
    const group = rowGroup[rowId];
    if (!group) return { ok: false, reason: `missing_group:${rowId}` };
    if (!SPLITS.includes(split)) return { ok: false, reason: `bad_split:${rowId}` };
    if (groupSplits.has(group)) {
      if (groupSplits.get(group) !== split) {
        return { ok: false, reason: `group_collision:${group}` };
      }
    } else {
      groupSplits.set(group, split);
    }
  }
  return { ok: true };
}

/**
 * Keyed-random deterministic candidate order within one split.
 * @param {Array<{id: string, group_id: string}>} cases
 * @param {{seed: string, split: string}} opts
 */
export function keyedCandidateOrder(cases, opts) {
  const { seed, split } = opts;
  return cases
    .filter((c) => c.split === split || opts.ignoreSplit === true)
    .map((c) => ({
      id: c.id,
      group_id: c.group_id,
      split: c.split ?? split,
      u: keyedUnit(seed, `order|${split}|${c.id}`),
    }))
    .sort((a, b) => (a.u - b.u) || (a.id < b.id ? -1 : 1))
    .map(({ id, group_id, split: s }) => ({ id, group_id, split: s }));
}

/** Max replacements allowed at 10% of target (floor). */
export function maxReplacements(targetSize) {
  if (!Number.isInteger(targetSize) || targetSize < 0) {
    throw new TypeError('maxReplacements: targetSize must be a non-negative integer');
  }
  return Math.floor(targetSize * REPLACEMENT_CAP_RATIO);
}

/**
 * Replacement policy: cap 10% of target; next candidate same split; never move groups.
 * @param {{
 *   targetSize: number,
 *   replacedSoFar: number,
 *   nextCandidate: {id: string, group_id: string, split: string},
 *   requiredSplit: string,
 *   usedIds: Set<string>|string[],
 *   groupSplit: Record<string, string>,
 *   postABChange?: boolean,
 * }} input
 */
export function planReplacement(input) {
  const {
    targetSize,
    replacedSoFar,
    nextCandidate,
    requiredSplit,
    usedIds,
    groupSplit,
    postABChange = false,
  } = input;

  if (postABChange) {
    return {
      ok: false,
      code: 'invalidate_post_ab_change',
      invalidate_dataset: true,
    };
  }

  const used = usedIds instanceof Set ? usedIds : new Set(usedIds ?? []);
  const cap = maxReplacements(targetSize);
  const alreadyOver = replacedSoFar > cap;
  const wouldBe = replacedSoFar + 1;
  const ratio = targetSize === 0 ? 1 : wouldBe / targetSize;
  const exceedsCap = wouldBe > cap || ratio > REPLACEMENT_CAP_RATIO + 1e-12;

  if (alreadyOver || exceedsCap) {
    return {
      ok: false,
      code: 'invalidate_replacement_cap',
      invalidate_dataset: true,
      replaced: replacedSoFar,
      cap,
    };
  }

  if (!nextCandidate || typeof nextCandidate.id !== 'string') {
    return { ok: false, code: 'exhausted_pool', invalidate_dataset: false };
  }
  if (used.has(nextCandidate.id)) {
    return { ok: false, code: 'already_used', invalidate_dataset: false };
  }
  if (nextCandidate.split !== requiredSplit) {
    return {
      ok: false,
      code: 'group_collision_wrong_split',
      invalidate_dataset: false,
    };
  }
  const assigned = groupSplit?.[nextCandidate.group_id];
  if (assigned && assigned !== requiredSplit) {
    return {
      ok: false,
      code: 'group_collision_wrong_split',
      invalidate_dataset: false,
    };
  }

  return {
    ok: true,
    code: 'replace',
    invalidate_dataset: false,
    replaced: wouldBe,
    cap,
    next_id: nextCandidate.id,
  };
}

/**
 * Invalidate the entire dataset version on post-A/B change or >10% replacements.
 * @param {{targetSize: number, replacements: number, postABChange?: boolean}} input
 */
export function shouldInvalidateDataset(input) {
  const { targetSize, replacements, postABChange = false } = input;
  if (postABChange === true) return true;
  if (!Number.isInteger(replacements) || replacements < 0) return true;
  if (targetSize <= 0) return replacements > 0;
  return replacements > maxReplacements(targetSize) || replacements / targetSize > REPLACEMENT_CAP_RATIO + 1e-12;
}

/**
 * Frozen labeling rubric.
 * Precedence: explicit decision > blocker_dependency > follow_up_reminder > routine_update.
 * Unclear only when genuinely indeterminate / multi-intent without primary / missing context.
 * @param {{present: string[], explicitPrimary?: string|null, missingContext?: boolean, noIntentFits?: boolean}} input
 * @returns {{ok: true, label: string} | {ok: false, reason: string}}
 */
export function resolveRubricLabel(input) {
  const present = input?.present ?? [];
  const explicitPrimary = input?.explicitPrimary ?? null;
  const missingContext = input?.missingContext === true;
  const noIntentFits = input?.noIntentFits === true;

  if (!Array.isArray(present)) return { ok: false, reason: 'present_must_be_array' };
  for (const p of present) {
    if (!KIND_LABELS.includes(p)) return { ok: false, reason: `unknown_intent:${p}` };
  }

  if (missingContext) return { ok: true, label: 'unclear' };
  if (noIntentFits || present.length === 0) return { ok: true, label: 'unclear' };

  if (explicitPrimary !== null && explicitPrimary !== undefined) {
    if (!present.includes(explicitPrimary) || !RUBRIC_PRECEDENCE.includes(explicitPrimary)) {
      return { ok: false, reason: 'explicit_primary_not_in_present' };
    }
    return { ok: true, label: explicitPrimary };
  }

  const actionablePresent = ACTIONABLE_CLASSES.filter((c) => present.includes(c));
  if (actionablePresent.length > 1) {
    return { ok: true, label: 'unclear' };
  }

  for (const label of RUBRIC_PRECEDENCE) {
    if (present.includes(label)) return { ok: true, label };
  }
  if (present.includes('unclear')) return { ok: true, label: 'unclear' };
  return { ok: true, label: 'unclear' };
}

/** Map a raw outcome to a prediction label used by metrics. */
export function toPredictionLabel(outcome) {
  if (outcome === 'no_suggestion' || outcome === 'suppressed') return 'suppressed';
  if (PREDICTION_VALUES.includes(outcome)) return outcome;
  return 'provider_failure';
}

export function isActionableLabel(label) {
  return ACTIONABLE_CLASSES.includes(label);
}

export function isNoActionPrediction(label) {
  return NO_ACTION_PREDICTIONS.includes(label);
}

/**
 * Exact-label confusion: rows = adjudicated truth (5 kinds),
 * columns = prediction (5 kinds + special no-action outcomes).
 * @param {Array<{truth: string, prediction: string}>} pairs
 */
export function buildExactLabelConfusion(pairs) {
  const matrix = {};
  for (const truth of KIND_LABELS) {
    matrix[truth] = {};
    for (const pred of PREDICTION_VALUES) matrix[truth][pred] = 0;
  }
  let exactMatches = 0;
  let n = 0;
  for (const pair of pairs) {
    const truth = pair?.truth;
    const prediction = toPredictionLabel(pair?.prediction);
    if (!KIND_LABELS.includes(truth)) throw new TypeError(`buildExactLabelConfusion: bad truth ${truth}`);
    matrix[truth][prediction] += 1;
    n += 1;
    if (truth === prediction) exactMatches += 1;
  }
  return {
    labels: [...KIND_LABELS],
    prediction_values: [...PREDICTION_VALUES],
    matrix,
    n,
    exact_matches: exactMatches,
  };
}

/**
 * Actionable 3-class TP/FP/FN. Special/no-action predictions are FN vs actionable truth.
 * A wrong actionable class is FP for predicted and FN for true actionable class.
 * @param {Array<{truth: string, prediction: string}>} pairs
 * @param {string} classLabel
 */
export function classCounts(pairs, classLabel) {
  if (!ACTIONABLE_CLASSES.includes(classLabel)) {
    throw new TypeError(`classCounts: ${classLabel} is not an actionable class`);
  }
  let tp = 0;
  let fp = 0;
  let fn = 0;
  let truthN = 0;
  let predN = 0;
  for (const pair of pairs) {
    const truth = pair?.truth;
    const prediction = toPredictionLabel(pair?.prediction);
    if (truth === classLabel) truthN += 1;
    if (prediction === classLabel) predN += 1;
    if (truth === classLabel && prediction === classLabel) tp += 1;
    else if (prediction === classLabel && truth !== classLabel) fp += 1;
    else if (truth === classLabel && prediction !== classLabel) fn += 1;
  }
  return { tp, fp, fn, truth_n: truthN, pred_n: predN };
}

/** precision = TP/(TP+FP); null when denominator is 0. */
export function precisionOf(tp, fp) {
  const denom = tp + fp;
  if (denom === 0) return null;
  return tp / denom;
}

/** recall = TP/(TP+FN); null when denominator is 0. */
export function recallOf(tp, fn) {
  const denom = tp + fn;
  if (denom === 0) return null;
  return tp / denom;
}

/**
 * Micro precision/recall across blocker_dependency|decision|follow_up_reminder.
 * @param {Array<{truth: string, prediction: string}>} pairs
 */
export function microPR(pairs) {
  let tp = 0;
  let fp = 0;
  let fn = 0;
  for (const cls of ACTIONABLE_CLASSES) {
    const c = classCounts(pairs, cls);
    tp += c.tp;
    fp += c.fp;
    fn += c.fn;
  }
  return {
    tp,
    fp,
    fn,
    precision: precisionOf(tp, fp),
    recall: recallOf(tp, fn),
  };
}

/**
 * Per-class precision/recall; reported only when truth_n >= 60 and pred_n >= 60.
 * @param {Array<{truth: string, prediction: string}>} pairs
 * @param {number} [minN]
 */
export function perClassPR(pairs, minN = PER_CLASS_MIN_N) {
  const out = {};
  for (const cls of ACTIONABLE_CLASSES) {
    const c = classCounts(pairs, cls);
    const reportable = c.truth_n >= minN && c.pred_n >= minN;
    out[cls] = {
      tp: c.tp,
      fp: c.fp,
      fn: c.fn,
      truth_n: c.truth_n,
      pred_n: c.pred_n,
      reportable,
      precision: reportable ? precisionOf(c.tp, c.fp) : null,
      recall: reportable ? recallOf(c.tp, c.fn) : null,
    };
  }
  return out;
}

/**
 * Full metrics bundle over the uniform natural holdout.
 * @param {Array<{truth: string, prediction: string}>} pairs
 */
export function computeMetrics(pairs) {
  const confusion = buildExactLabelConfusion(pairs);
  const micro = microPR(pairs);
  const perClass = perClassPR(pairs);
  let providerFailures = 0;
  let blocked = 0;
  let suppressed = 0;
  for (const pair of pairs) {
    const p = toPredictionLabel(pair?.prediction);
    if (p === 'provider_failure') providerFailures += 1;
    if (p === 'blocked_sensitive_input' || p === 'blocked_unsupported_language') blocked += 1;
    if (p === 'suppressed') suppressed += 1;
  }
  return {
    n: pairs.length,
    confusion,
    micro,
    per_class: perClass,
    provider_failures: providerFailures,
    blocked,
    suppressed,
    actionable_classes: [...ACTIONABLE_CLASSES],
  };
}

/**
 * Confirmatory candidate gate: one send, no retry, all cases in denominator,
 * provider failure >= 2% fails the candidate.
 * @param {{totalCases: number, providerFailureCount: number, sendAttempts?: number, retries?: number, candidateIndex?: number}} input
 */
export function evaluateConfirmatoryCandidate(input) {
  const totalCases = input?.totalCases ?? 0;
  const providerFailureCount = input?.providerFailureCount ?? 0;
  const sendAttempts = input?.sendAttempts ?? totalCases;
  const retries = input?.retries ?? 0;
  const candidateIndex = input?.candidateIndex ?? 1;

  if (candidateIndex < 1 || candidateIndex > CONFIRMATORY.max_preregistered_candidates) {
    return {
      ok: false,
      code: 'exceeds_max_preregistered_candidates',
      max: CONFIRMATORY.max_preregistered_candidates,
    };
  }
  if (retries > CONFIRMATORY.retries) {
    return { ok: false, code: 'retry_forbidden' };
  }
  if (totalCases <= 0) {
    return { ok: false, code: 'empty_denominator' };
  }
  if (sendAttempts > totalCases * CONFIRMATORY.sends_per_case) {
    return { ok: false, code: 'more_than_one_send' };
  }
  const rate = providerFailureCount / totalCases;
  const failed = rate >= CONFIRMATORY.provider_failure_fail_rate;
  return {
    ok: !failed,
    code: failed ? 'provider_failure_rate_failed' : 'pass',
    provider_failure_rate: rate,
    threshold: CONFIRMATORY.provider_failure_fail_rate,
    denominator: totalCases,
  };
}

/**
 * Deterministic mean-one Poisson weight (Knuth) from keyed PRNG.
 * Frozen for the two-way requester/product clustered bootstrap.
 */
export function poissonWeightOne(seed, domain, state) {
  const rand = state?.rand ?? mulberry32(fnv1a32(`${seed}|${domain}`));
  const L = Math.exp(-BOOTSTRAP.poisson_mean);
  let k = 0;
  let p = 1;
  do {
    k += 1;
    p *= rand();
  } while (p > L);
  return { weight: k - 1, rand };
}

/**
 * Two-way clustered bootstrap replicates (requester x product Poisson weights).
 * Exactly BOOTSTRAP.replicates non-degenerate replicates; zero-denominator draws advance the counter.
 * @param {Array<{id: string, requester: string, product: string, truth: string, prediction: string}>} rows
 * @param {{seed: string, metric?: string}} opts
 */
export function clusteredBootstrap(rows, opts) {
  const seed = opts?.seed;
  if (typeof seed !== 'string' || seed.length < 1) throw new TypeError('clusteredBootstrap: seed required');
  const values = [];
  let counter = 0;
  let guard = 0;
  const guardMax = BOOTSTRAP.replicates * 20;
  while (values.length < BOOTSTRAP.replicates && guard < guardMax) {
    guard += 1;
    const attempt = counter;
    counter += 1;
    let denom = 0;
    let num = 0;
    for (const row of rows) {
      const rw = poissonWeightOne(seed, `boot|${attempt}|r|${row.requester}`, {
        rand: mulberry32(fnv1a32(`${seed}|boot|${attempt}|r|${row.requester}`)),
      }).weight;
      const pw = poissonWeightOne(seed, `boot|${attempt}|p|${row.product}`, {
        rand: mulberry32(fnv1a32(`${seed}|boot|${attempt}|p|${row.product}`)),
      }).weight;
      const w = rw * pw;
      denom += w;
      const pred = toPredictionLabel(row.prediction);
      const hit = row.truth === pred && ACTIONABLE_CLASSES.includes(pred);
      if (hit) num += w;
    }
    if (denom === 0) continue;
    values.push(num / denom);
  }
  return {
    replicates: values.length,
    values,
    seed,
    degenerate_skips: counter - values.length,
  };
}

/** Frozen protocol object for hashing/documentation. */
export function buildProtocolManifest() {
  return {
    protocol_version: PROTOCOL_VERSION,
    language_allowlist: [...LANGUAGE_ALLOWLIST],
    max_confirmatory_candidates: MAX_CONFIRMATORY_CANDIDATES,
    splits: [...SPLITS],
    group_keys: [...GROUP_KEYS],
    kind_labels: [...KIND_LABELS],
    actionable_classes: [...ACTIONABLE_CLASSES],
    no_action_predictions: [...NO_ACTION_PREDICTIONS],
    rubric_precedence: [...RUBRIC_PRECEDENCE],
    replacement_cap_ratio: REPLACEMENT_CAP_RATIO,
    per_class_min_n: PER_CLASS_MIN_N,
    confirmatory: { ...CONFIRMATORY },
    limits: {
      concurrency: LIMITS.concurrency,
      env_per_24h: { ...LIMITS.env_per_24h },
      profile_per_24h: { ...LIMITS.profile_per_24h },
      eligible_comment_limit: LIMITS.eligible_comment_limit,
      eligible_window_days: LIMITS.eligible_window_days,
    },
    bootstrap: { ...BOOTSTRAP },
  };
}
