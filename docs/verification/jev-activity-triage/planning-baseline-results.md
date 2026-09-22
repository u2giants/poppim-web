# Poppim pre-Jev baseline result

Recorded: `2026-09-20T19:43:42Z`

Source baseline: `09c870bbe6e41e657ff585c11c5ffeb3e9939ec1`

Worktree: `codex/jev-implementation-plan`

This is the bounded, scrubbed command result retained with the plan. The complete ephemeral outputs contained no secrets; their hashes bind the omitted routine lines.

## Results

- `npm test -- --reporter=dot` — exit 0; 15 test files passed, 50 tests passed, 0 failed; duration 1.63s. Complete-output SHA-256: `69399ca7566545a42a2066d3c50d38f3f3d1659ca63ce3d5d3a0ac56c0ce4515`.
- `npm run lint -- --quiet` — exit 0; ESLint produced no diagnostics. Complete-output SHA-256: `986fa9f58b3a2aec22fda842ec8bb5affcba6eeaa249bf343ee2f038756fe690`.
- `npm run build` — exit 0; Vite built in 1.66s; entry `index--Te365m1.js` was 372,239 bytes (116.13 kB gzip); bundle limit was `< 500,000`. Complete-output SHA-256: `b95abe6b10287260e42360989de8e5810b669755cc7cdf657ea6081c224cde31`.
- `git diff --check` — exit 0 with empty output for tracked documentation changes. Because new plan/handoff/evidence files are untracked until implementation shipping is separately requested, `rg -n '[ \t]+$' plan_jev_activity_triage.md HANDOFF.md HANDOFF.d docs/verification/jev-activity-triage` also returned zero matches, explicitly checking their trailing whitespace.

These commands are reproducible from the named source baseline. They prove only that the pre-existing application remains green; they are not Jev, database, preview, deployment, or production acceptance.
