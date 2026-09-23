/**
 * Jev gateway env allowlist. Fail closed: unknown or privileged names refuse load.
 */

export const ENV_ALLOWLIST = Object.freeze([
  'PORT',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'TYPESAFE_API_KEY',
  'JEV_ACTIVITY_TRIAGE_ENABLED',
  'JEV_COMPLETION_HMAC_KEY',
  'JEV_COMPLETION_HMAC_KEY_VERSION',
  'JEV_INPUT_HMAC_KEY',
  'JEV_INPUT_HMAC_KEY_VERSION',
]);

const MANAGED_PREFIX = /^(JEV_|TYPESAFE_|SUPABASE_)/;
const SERVICE_ROLE = /service[_-]?role/i;

function parseFlag(value) {
  if (value === undefined || value === '') return false;
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  throw new Error(`JEV_ACTIVITY_TRIAGE_ENABLED must be true/false, got: ${value}`);
}

/**
 * @param {Record<string, string | undefined>} [env]
 */
export function loadConfig(env = process.env) {
  const names = Object.keys(env);
  for (const name of names) {
    if (SERVICE_ROLE.test(name)) {
      throw new Error(`refusing service-role env name: ${name}`);
    }
  }
  const unknown = names.filter((name) => MANAGED_PREFIX.test(name) && !ENV_ALLOWLIST.includes(name));
  if (unknown.length > 0) {
    throw new Error(`unknown env name(s): ${unknown.sort().join(', ')}`);
  }

  const jevActivityTriageEnabled = parseFlag(env.JEV_ACTIVITY_TRIAGE_ENABLED);
  if (jevActivityTriageEnabled) {
    const required = [
      'TYPESAFE_API_KEY',
      'JEV_COMPLETION_HMAC_KEY',
      'JEV_COMPLETION_HMAC_KEY_VERSION',
      'JEV_INPUT_HMAC_KEY',
      'JEV_INPUT_HMAC_KEY_VERSION',
    ];
    const missing = required.filter((name) => !env[name]);
    if (missing.length > 0) {
      throw new Error(`missing required env: ${missing.join(', ')}`);
    }
  }

  const port = env.PORT === undefined || env.PORT === '' ? 3000 : Number(env.PORT);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`PORT must be an integer 0-65535, got: ${env.PORT}`);
  }

  return {
    jevActivityTriageEnabled,
    port,
    supabaseUrl: env.SUPABASE_URL ?? null,
    supabaseAnonKey: env.SUPABASE_ANON_KEY ?? null,
  };
}
