#!/usr/bin/env bash
# ci-local.sh
# Run the CI checks from .github/workflows/ci.yml locally, in the same order.
# Exit non-zero on first failure so you catch issues before pushing.
#
# Deliberate divergences from ci.yml — everything else is mirrored step for step:
#   * CI-only infrastructure is omitted: checkout, setup-bun, setup-java, the
#     Bun/SDK-snapshot/kotlinc caches, and the coverage-artifact upload.
#   * Install flags differ. CI passes --ignore-scripts because the `prepare`
#     hook crashes on its Linux runner; locally the hook works, so we let it
#     run. Both then chmod expo-module-scripts' bins — bun leaves those
#     non-executable on macOS as well as Linux, so the workaround ci.yml
#     describes as a Linux quirk is needed here too.
#   * The Kotlin AsyncFunction surface test needs kotlinc and java on PATH. CI
#     installs both; locally we run it when they are present and SKIP it loudly
#     when they are not. A skip is reported again in the closing summary so it
#     can never be mistaken for a pass.
#   * The iOS Swift compile gate is the one step whose SHAPE differs, not just
#     its setup. In ci.yml it is a SEPARATE macos-latest job with no `needs:`,
#     because the Linux runner that carries every other step has no Xcode and
#     could never run it, and because a parallel job keeps the fast Linux
#     feedback from queueing behind an Xcode build. So it does not sit at any
#     position in ci.yml's step order — this script runs it last, and "same
#     order" means the same order for the steps the Linux job actually has.
#     Locally it needs macOS + Xcode + CocoaPods; missing any of those is a
#     loud SKIP in the summary, exactly like the Kotlin step.
#
#     It is also the only step where this script does MORE than ci.yml, not
#     less. CI compiles the device SDK alone (`ios-swift-gate.sh iphoneos`) to
#     hold down 10x-billed macOS minutes; here we compile both, because locally
#     the extra ~2 minutes are free. So a green CI does not prove the
#     `#if targetEnvironment(simulator)` side still compiles — this script does.
#     In practice that side is covered anyway by every `expo run:ios`, which is
#     why CI can afford to drop it; the device slice is the one nobody builds by
#     accident, and the one that let NSUInteger reach a consumer.
#
# Usage: bash scripts/ci-local.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

step() { echo; echo "▶ $*"; }
ok()   { echo "  ✓ $*"; }
skip() { echo "  ⏭  SKIPPED — $*"; }

SKIPPED=()

step "Install dependencies"
bun install --frozen-lockfile
ok "dependencies installed"

# The `expo-module` CLI delegates to sibling executables (expo-module-test,
# expo-module-jest, ...) that aren't declared in expo-module-scripts' `bin`
# field, so bun leaves them non-executable. Without this, test:coverage dies
# with "'expo-module-test' not executable".
step "Restore executable bits on expo-module-scripts bins"
chmod +x node_modules/expo-module-scripts/bin/expo-module-*
ok "executable bits restored"

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
node build/bridge-contract/run-contract-checks.js veepoo-events
ok "veepoo events contract passed"

step "Verify native rejection bridge contract"
node build/bridge-contract/run-contract-checks.js native-rejection
ok "native rejection contract passed"

step "Verify device-function key contract"
node build/bridge-contract/run-contract-checks.js device-function-keys
ok "device-function key contract passed"

step "Verify social-message key contract"
node build/bridge-contract/run-contract-checks.js social-msg-keys
ok "social-message key contract passed"

step "Verify vendor manifest"
bun run vendor:check
ok "vendor manifest passed"

step "Fetch SDK snapshots (cached by SHA stamp)"
bash scripts/fetch-sdk-snapshots.sh
ok "SDK snapshots ready"

step "Verify upstream SDK coverage"
node build/bridge-contract/run-contract-checks.js upstream-sdk
ok "upstream SDK coverage passed"

step "Test with coverage"
CI=true bun run test:coverage
ok "tests passed"

# JVM-only smoke test: compiles + runs the Kotlin scaffold in android/src/test
# against junit. No Android SDK, no vendor frameworks, no Gradle wrapper.
# Mirrors the JS test as a per-platform sanity check so a future Kotlin refactor
# that drops a method fails here too.
step "Run Kotlin AsyncFunction surface test"
if ! command -v kotlinc >/dev/null 2>&1 || ! command -v java >/dev/null 2>&1; then
  skip "kotlinc and/or java not on PATH (CI installs both; try: brew install kotlin temurin)"
  SKIPPED+=("Kotlin AsyncFunction surface test")
else
  mkdir -p /tmp/native-test-deps
  for spec in \
    'junit/junit/4.13.2/junit-4.13.2.jar' \
    'org/hamcrest/hamcrest-core/1.3/hamcrest-core-1.3.jar'; do
    file=/tmp/native-test-deps/$(basename "$spec")
    [ -f "$file" ] || curl -sSL "https://repo1.maven.org/maven2/$spec" -o "$file"
  done
  # -include-runtime bundles kotlin-stdlib into the jar. CI instead puts the
  # stdlib on the classpath by absolute path, which it can do because it
  # installed kotlinc itself; locally the install layout varies by package
  # manager, so we let kotlinc supply its own runtime rather than guess.
  kotlinc -include-runtime -cp /tmp/native-test-deps/junit-4.13.2.jar \
    android/src/test/kotlin/expo/modules/veepoo/AsyncFunctionSurfaceTest.kt \
    -d /tmp/native-async-surface-test.jar
  java -cp "/tmp/native-async-surface-test.jar:/tmp/native-test-deps/junit-4.13.2.jar:/tmp/native-test-deps/hamcrest-core-1.3.jar" \
    org.junit.runner.JUnitCore expo.modules.veepoo.AsyncFunctionSurfaceTest
  ok "Kotlin AsyncFunction surface test passed"
fi

# The one gate that compiles ios/VeepooSDK/*.swift. Everything above is JS,
# Kotlin, or file parsing; a Swift type error reaches consumers otherwise — which
# is how `NSUInteger` (an ObjC typedef with no Swift spelling) sat on main until
# a downstream app's xcodebuild stopped on it. See scripts/ios-swift-gate.sh for
# why this compiles the VeepooSDK pod target against both SDKs.
step "Compile iOS Swift sources (device + simulator SDK)"
set +e
bash scripts/ios-swift-gate.sh
gate_status=$?
set -e
case "$gate_status" in
  0) ok "iOS Swift sources compiled" ;;
  3) skip "macOS + Xcode + CocoaPods required (see message above)"
     SKIPPED+=("iOS Swift compile gate") ;;
  *) exit "$gate_status" ;;
esac

echo
if [ ${#SKIPPED[@]} -eq 0 ]; then
  echo "✅  All CI steps passed locally."
else
  echo "⚠️   CI steps passed locally, but ${#SKIPPED[@]} were SKIPPED — CI still runs them:"
  for name in ${SKIPPED[@]+"${SKIPPED[@]}"}; do echo "      • $name"; done
fi
