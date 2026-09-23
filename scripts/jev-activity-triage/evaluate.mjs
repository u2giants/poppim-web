#!/usr/bin/env node
/**
 * Synthetic dry-run over invented fixtures.
 * Redact → language gate → optional mock decision → validate.
 * Prints aggregate counts only (never row text). Exit non-zero on any failure.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { CONTRACT_VERSION, isActionableKind, validateJevDecision } from '../../shared/jev-activity-triage/contract.mjs';
import { languageGate, redactForTypeSafe } from '../../shared/jev-activity-triage/redact.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const FIXTURE_PATH = join(ROOT, 'fixtures', 'jev-activity-triage', 'synthetic.jsonl');
const PINNED_MODEL = 'jev-1';

function loadFixtures(path) {
  const raw = readFileSync(path, 'utf8');
  const rows = [];
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    rows.push(JSON.parse(trimmed));
  }
  return rows;
}

function checkFixture(row) {
  const expect = row.expect ?? {};
  const text = row.text ?? '';
  const dictionary = row.dictionary ?? [];
  const outcome = expect.outcome;

  const redacted = redactForTypeSafe(text, { dictionary });

  if (outcome === 'blocked_sensitive_input') {
    if (redacted.ok) return { ok: false, stage: 'redact' };
    if (redacted.code !== 'blocked_sensitive_input') return { ok: false, stage: 'redact' };
    return {
      ok: true,
      outcome: 'blocked_sensitive_input',
      language: null,
      decisionOk: null,
      actionable: false,
    };
  }

  if (!redacted.ok) return { ok: false, stage: 'redact' };
  if (typeof expect.redacted_text === 'string' && redacted.text !== expect.redacted_text) {
    return { ok: false, stage: 'redact' };
  }

  const language = languageGate(redacted.text);
  if (expect.language && language !== expect.language) return { ok: false, stage: 'language' };

  if (outcome === 'blocked_unsupported_language') {
    if (language !== 'blocked_unsupported_language') return { ok: false, stage: 'language' };
    return {
      ok: true,
      outcome: 'blocked_unsupported_language',
      language,
      decisionOk: null,
      actionable: false,
    };
  }

  if (language !== 'english_eligible') return { ok: false, stage: 'language' };

  let decisionOk = null;
  let actionable = false;
  if (expect.decision) {
    const validated = validateJevDecision(expect.decision, { pinnedModel: PINNED_MODEL });
    decisionOk = validated.ok;
    if (typeof expect.decision_ok === 'boolean' && validated.ok !== expect.decision_ok) {
      return { ok: false, stage: 'decision' };
    }
    if (!validated.ok) {
      if (expect.decision_ok === true) return { ok: false, stage: 'decision' };
      if (expect.decision_error && validated.error !== expect.decision_error) {
        return { ok: false, stage: 'decision' };
      }
    } else {
      actionable = isActionableKind(validated.value.kind);
      if (typeof expect.actionable === 'boolean' && actionable !== expect.actionable) {
        return { ok: false, stage: 'decision' };
      }
    }
  } else if (typeof expect.decision_ok === 'boolean' && expect.decision_ok) {
    return { ok: false, stage: 'decision' };
  }

  return {
    ok: true,
    outcome: 'eligible',
    language,
    decisionOk,
    actionable,
  };
}

function main() {
  const rows = loadFixtures(FIXTURE_PATH);
  const counts = {
    fixtures_total: rows.length,
    outcome_eligible: 0,
    outcome_blocked_sensitive_input: 0,
    outcome_blocked_unsupported_language: 0,
    language_english_eligible: 0,
    language_blocked_unsupported_language: 0,
    decision_ok: 0,
    decision_invalid: 0,
    actionable: 0,
    failures: 0,
  };
  const failedIds = [];

  for (const row of rows) {
    const result = checkFixture(row);
    if (!result.ok) {
      counts.failures += 1;
      failedIds.push(row.id ?? 'unknown');
      continue;
    }
    if (result.outcome === 'eligible') counts.outcome_eligible += 1;
    if (result.outcome === 'blocked_sensitive_input') counts.outcome_blocked_sensitive_input += 1;
    if (result.outcome === 'blocked_unsupported_language') {
      counts.outcome_blocked_unsupported_language += 1;
    }
    if (result.language === 'english_eligible') counts.language_english_eligible += 1;
    if (result.language === 'blocked_unsupported_language') {
      counts.language_blocked_unsupported_language += 1;
    }
    if (result.decisionOk === true) counts.decision_ok += 1;
    if (result.decisionOk === false) counts.decision_invalid += 1;
    if (result.actionable) counts.actionable += 1;
  }

  const lines = [
    `contract_version=${CONTRACT_VERSION}`,
    `pinned_model=${PINNED_MODEL}`,
    ...Object.entries(counts).map(([k, v]) => `${k}=${v}`),
  ];
  if (failedIds.length > 0) {
    lines.push(`failed_ids=${failedIds.join(',')}`);
  }
  process.stdout.write(lines.join('\n') + '\n');
  process.exit(counts.failures > 0 ? 1 : 0);
}

main();
