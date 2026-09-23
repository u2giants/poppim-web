/**
 * Jev gateway HTTP server (Jev-OFF). No provider code.
 */

import http from 'node:http';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

import { loadConfig } from './config.mjs';

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}

/**
 * @param {{ jevActivityTriageEnabled: boolean }} config
 */
export function createRequestHandler(config) {
  return (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    if (req.method === 'GET' && url.pathname === '/healthz') {
      json(res, 200, {
        ok: true,
        jev_activity_triage_enabled: config.jevActivityTriageEnabled,
      });
      return;
    }
    if (req.method === 'POST' && url.pathname === '/v1/triage') {
      if (!config.jevActivityTriageEnabled) {
        json(res, 503, { error: 'jev_disabled' });
        return;
      }
      // Flag on still has no provider path in this scaffold.
      json(res, 501, { error: 'not_implemented' });
      return;
    }
    json(res, 404, { error: 'not_found' });
  };
}

export function createServer(config) {
  return http.createServer(createRequestHandler(config));
}

export function startServer(config) {
  const server = createServer(config);
  return new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(config.port, '127.0.0.1', () => resolveListen(server));
  });
}

const isMain =
  process.argv[1] !== undefined &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (isMain) {
  const config = loadConfig(process.env);
  startServer(config).then((server) => {
    const addr = server.address();
    console.log(`jev-gateway listening on 127.0.0.1:${addr.port}`);
  });
}
