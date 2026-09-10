# Phase 4 task-gate rollout evidence

Issue `popcre/ai-devops#335` adds repository-local routing policy and executable refusal evidence. The policy protects POP PIM browser workflow, identity, production-release, and shared-database paths without changing application, database, host, or deployment behavior.

## Required evidence

- `bash scripts/test-task-gates.sh`: 17 passed / 0 failed. It verifies representative classifications, normal code shipping, database escalation refusal, failed acknowledgement and owner-request bypasses, and byte-exact rollback restoration.
- `.github/workflows/task-gates.yml` repeats that proof on pull requests and `main` using the public accepted task-gate engine pinned by commit.
- The existing shared-database guard remains independent and unchanged.
- `npm run lint -- --quiet`: passed with zero findings.
- `npm test -- --reporter=dot`: 14 files and 43 tests passed.
- TypeScript and Vite build passed; 2,073 modules transformed. The 372,923-byte entry remains below the 500,000-byte budget. The existing bundle helper cannot stat a Windows file URL (`C:\\C:\\...`), while CI runs it on Linux.

The engine deliberately chooses the strongest matching class. Browser source paths, including authorization files, retain authenticated visual proof and full rulebook treatment. Hand-written application model types remain UI work; only the generated database contract routes as shared-database work. This rollout changes no browser source path, so no live UI proof is required for this candidate.

## Release boundary

POP PIM deploys production on every non-documentation push to `main`. This rollout does not authorize production deployment, so its reviewed pull request must remain unmerged until that release is explicitly authorized. No database, host, infrastructure, or production action is part of this change.
