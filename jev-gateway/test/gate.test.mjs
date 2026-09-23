import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { loadConfig } from '../src/config.mjs';
import { createServer } from '../src/server.mjs';

const repoRoot = resolve(fileURLToPath(new URL('../..', import.meta.url)));

function listen(server) {
  return new Promise((resolveListen) => {
    server.listen(0, '127.0.0.1', () => resolveListen(server));
  });
}

function close(server) {
  return new Promise((resolveClose) => server.close(resolveClose));
}

async function withServer(config, fn) {
  const server = createServer(config);
  await listen(server);
  const { port } = server.address();
  try {
    await fn(`http://127.0.0.1:${port}`);
  } finally {
    await close(server);
  }
}

test('healthz returns ok', async () => {
  const config = loadConfig({});
  await withServer(config, async (base) => {
    const res = await fetch(`${base}/healthz`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.ok, true);
    assert.equal(body.jev_activity_triage_enabled, false);
  });
});

test('flag-off POST /v1/triage returns 503 jev_disabled', async () => {
  const config = loadConfig({ JEV_ACTIVITY_TRIAGE_ENABLED: 'false' });
  await withServer(config, async (base) => {
    const res = await fetch(`${base}/v1/triage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: 'synthetic' }),
    });
    assert.equal(res.status, 503);
    const body = await res.json();
    assert.equal(body.error, 'jev_disabled');
  });
});

test('unknown managed env names are refused', () => {
  assert.throws(
    () => loadConfig({ JEV_UNKNOWN_THING: '1' }),
    /unknown env name/,
  );
  assert.throws(
    () => loadConfig({ TYPESAFE_EXTRA: '1' }),
    /unknown env name/,
  );
  assert.throws(
    () => loadConfig({ SUPABASE_SERVICE_ROLE_KEY: 'nope' }),
    /service-role|unknown env name/,
  );
});

test('flag-on without required secrets is refused', () => {
  assert.throws(
    () => loadConfig({ JEV_ACTIVITY_TRIAGE_ENABLED: 'true' }),
    /missing required env/,
  );
});

test('TYPESAFE_API_KEY never appears in frontend src/ or .env.example', () => {
  const roots = [join(repoRoot, 'src'), join(repoRoot, '.env.example')];
  const files = [];
  for (const root of roots) {
    const st = statSync(root);
    if (st.isFile()) {
      files.push(root);
      continue;
    }
    const walk = (dir) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else files.push(full);
      }
    };
    walk(root);
  }
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    assert.ok(!text.includes('TYPESAFE_API_KEY'), `TYPESAFE_API_KEY leaked into ${file}`);
  }
});
