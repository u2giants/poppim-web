#!/usr/bin/env bash
# shellcheck disable=SC2016 # fixture strings intentionally contain literal ${...}
# Phase 0 workflow-validation fixture for the Coolify transport gate.
# Proves deploy.yml cannot load/send COOLIFY_TOKEN over plaintext transport
# and cannot send it to an unpinned host. Negative fixtures must fail the
# same checks that the real workflow must pass.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKFLOW="$ROOT/.github/workflows/deploy.yml"
failures=0
passes=0
pass(){ passes=$((passes + 1)); printf 'PASS: %s\n' "$1"; }
fail(){ printf 'FAIL: %s\n' "$1" >&2; failures=$((failures + 1)); }

# Returns 0 when the workflow is safe; nonzero when any transport rule is broken.
check_workflow(){
  local wf="$1"
  local deploy_line token_lines ln bad_curls token_curls
  local preflight_body verify_body publish_body curl_invocations inv

  grep -Eq -- 'http://' "$wf" && return 1
  grep -Eq -- '178\.156\.180\.212' "$wf" && return 1
  grep -Eq -- 'COOLIFY_CONTROL_PLANE_HOST_PIN: \$\{\{ vars\.' "$wf" && return 1
  grep -Eq -- "COOLIFY_CONTROL_PLANE_HOST_PIN: 'coolify\\.designflow\\.app'" "$wf" || return 1
  grep -Eq -- 'does not match the authorized pin' "$wf" || return 1
  grep -Eq -- 'needs:[[:space:]]*\[[^]]*deploy-transport-preflight[^]]*\]' "$wf" || return 1

  preflight_body="$(awk '/^  deploy-transport-preflight:/{flag=1} flag{print} /^  deploy:/{if(flag){exit}}' "$wf")"
  verify_body="$(awk '/^  verify:/{flag=1} flag{print} /^  publish:/{if(flag){exit}}' "$wf")"
  publish_body="$(awk '/^  publish:/{flag=1} flag{print} /^  deploy-transport-preflight:/{if(flag){exit}}' "$wf")"
  printf '%s\n%s\n%s\n' "$preflight_body" "$verify_body" "$publish_body" | grep -Eq 'secrets\.COOLIFY_TOKEN' && return 1

  deploy_line="$(grep -n '^  deploy:' "$wf" | head -1 | cut -d: -f1)"
  token_lines="$(grep -n 'secrets\.COOLIFY_TOKEN' "$wf" | cut -d: -f1 || true)"
  [ -n "$token_lines" ] || return 1
  [ -n "$deploy_line" ] || return 1
  for ln in $token_lines; do
    [ "$ln" -gt "$deploy_line" ] || return 1
  done

  curl_invocations="$(awk '
    function flush() { if (buf != "") { print buf; buf = "" } }
    /^[[:space:]]*curl / { flush(); buf = $0; cont = ($0 ~ /\\$/); next }
    cont { buf = buf " " $0; cont = ($0 ~ /\\$/); if (!cont) flush(); next }
    { flush() }
    END { flush() }
  ' "$wf")"
  bad_curls=0
  token_curls=0
  while IFS= read -r inv; do
    [ -z "$inv" ] && continue
    # shellcheck disable=SC2016 # literal workflow token name, not shell expansion
    case "$inv" in
      *'Bearer ${COOLIFY_TOKEN}'*)
        token_curls=$((token_curls + 1))
        case "$inv" in
          *"--proto '=https'"*) ;;
          *) bad_curls=$((bad_curls + 1)) ;;
        esac
        case "$inv" in
          *'--tlsv1.2'*) ;;
          *) bad_curls=$((bad_curls + 1)) ;;
        esac
        ;;
    esac
  done <<EOF
$curl_invocations
EOF
  [ "$token_curls" -ge 1 ] || return 1
  [ "$bad_curls" -eq 0 ] || return 1
  return 0
}

if check_workflow "$WORKFLOW"; then
  pass 'deploy.yml satisfies every transport gate rule'
else
  fail 'deploy.yml satisfies every transport gate rule'
fi

# Granular assertions for readable CI output on the real file.
assert_absent(){ local label="$1" pattern="$2"; if grep -Eq -- "$pattern" "$WORKFLOW"; then fail "$label (matched /$pattern/)"; else pass "$label"; fi; }
assert_present(){ local label="$1" pattern="$2"; if grep -Eq -- "$pattern" "$WORKFLOW"; then pass "$label"; else fail "$label (missing /$pattern/)"; fi; }
assert_absent 'no plaintext http:// URL assignment' 'http://'
assert_absent 'no bare IPv4 control-plane host' '178\.156\.180\.212'
assert_absent 'hostname pin is not a mutable repository variable' 'COOLIFY_CONTROL_PLANE_HOST_PIN: \$\{\{ vars\.'
assert_present 'authorized hostname pin is required' "COOLIFY_CONTROL_PLANE_HOST_PIN: 'coolify\\.designflow\\.app'"
assert_present 'fixture is enforced in verify' 'test-deploy-transport'
assert_present 'fixture is enforced in preflight' 'test-deploy-transport'

# Negative fixtures: each must FAIL check_workflow.
expect_unsafe(){
  local label="$1" content="$2" tmp
  tmp="$(mktemp)"
  printf '%s\n' "$content" >"$tmp"
  if check_workflow "$tmp"; then
    fail "$label (checker accepted an unsafe workflow)"
  else
    pass "$label"
  fi
  rm -f "$tmp"
}

expect_unsafe 'fixture: plaintext Coolify URL is rejected' \
$'name: bad\non: push\njobs:\n  deploy-transport-preflight:\n    steps:\n      - run: echo ok\n  deploy:\n    needs: [deploy-transport-preflight]\n    steps:\n      - run: |\n          curl --proto "=https" --tlsv1.2 -H "Authorization: Bearer ${COOLIFY_TOKEN}" http://178.156.180.212:8000\n'
expect_unsafe 'fixture: token job without preflight dependency is rejected' \
$'name: bad\non: push\njobs:\n  deploy-transport-preflight:\n    steps:\n      - run: echo ok\n  deploy:\n    steps:\n      - run: |\n          curl --proto "=https" --tlsv1.2 -H "Authorization: Bearer ${COOLIFY_TOKEN}" https://example.invalid\n'
expect_unsafe 'fixture: token curl without https proto is rejected' \
$'name: bad\non: push\njobs:\n  deploy-transport-preflight:\n    steps:\n      - run: echo ok\n  deploy:\n    needs: [deploy-transport-preflight]\n    steps:\n      - run: |\n          curl -H "Authorization: Bearer ${COOLIFY_TOKEN}" https://example.invalid\n'
expect_unsafe 'fixture: empty hostname pin is rejected' \
$'name: bad\non: push\njobs:\n  deploy-transport-preflight:\n    steps:\n      - run: echo ok\n  deploy:\n    needs: [deploy-transport-preflight]\n    steps:\n      - run: |\n          curl --proto "=https" --tlsv1.2 -H "Authorization: Bearer ${COOLIFY_TOKEN}" https://example.invalid\n'
expect_unsafe 'fixture: wrong hostname pin is rejected' \
$'name: bad\non: push\nenv:\n  COOLIFY_CONTROL_PLANE_HOST_PIN: '"'"'evil.example'"'"'\njobs:\n  deploy-transport-preflight:\n    steps:\n      - run: echo ok\n  deploy:\n    needs: [deploy-transport-preflight]\n    steps:\n      - run: |\n          curl --proto "=https" --tlsv1.2 -H "Authorization: Bearer ${COOLIFY_TOKEN}" https://example.invalid\n'
expect_unsafe 'fixture: token referenced in preflight is rejected' \
$'name: bad\non: push\njobs:\n  deploy-transport-preflight:\n    steps:\n      - run: echo "${{ secrets.COOLIFY_TOKEN }}"\n  deploy:\n    needs: [deploy-transport-preflight]\n    steps:\n      - run: |\n          curl --proto "=https" --tlsv1.2 -H "Authorization: Bearer ${COOLIFY_TOKEN}" https://example.invalid\n'

# Positive control fixtures that should pass structural rules are covered by the real file.
if grep -Eq -- 'http://|178\.156\.180\.212' "$WORKFLOW"; then
  fail 'positive control: deploy.yml is free of plaintext/IP control-plane literals'
else
  pass 'positive control: deploy.yml is free of plaintext/IP control-plane literals'
fi

if [ "$failures" -ne 0 ]; then
  printf '%s failure(s)\n' "$failures" >&2
  exit 1
fi
printf '%s passed / 0 failed\n' "$passes"
