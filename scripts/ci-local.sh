#!/usr/bin/env bash
# ci-local.sh
# Run every CI step locally in sequence, identical to .github/workflows/ci.yml.
# Exit non-zero on first failure so you catch issues before pushing.
#
# Usage: bash scripts/ci-local.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

step() { echo; echo "▶ $*"; }
ok()   { echo "  ✓ $*"; }

step "Install dependencies"
bun install --frozen-lockfile
ok "dependencies installed"

step "Lint"
bun run lint
ok "lint passed"

step "Typecheck"
bun run typecheck
ok "typecheck passed"

step "Build"
bun run build
ok "build passed"

step "Verify Veepoo events bridge contract"
node build/bridge-contract/cli-check-veepoo-events.js
ok "veepoo events contract passed"

step "Verify native rejection bridge contract"
node build/bridge-contract/cli-check-native-rejection.js
ok "native rejection contract passed"

step "Verify vendor manifest"
bun run vendor:check
ok "vendor manifest passed"

step "Fetch SDK snapshots (cached by SHA stamp)"
bash scripts/fetch-sdk-snapshots.sh
ok "SDK snapshots ready"

step "Verify upstream SDK coverage"
node build/bridge-contract/cli-check-upstream-sdk.js
ok "upstream SDK coverage passed"

step "Test with coverage"
CI=true bun run test:coverage
ok "tests passed"

echo
echo "✅  All CI steps passed locally."
