#!/usr/bin/env bash
# android-function-status-check.sh
# Compile and RUN the Android vendor-status mappers (#212, #210) against the
# real vendor classes.
#
# Scope: `toFunctionStatus`, the 13-channel social-message map, and the 12
# device-function package keys — each driven one field at a time against the
# vendor's own structs, so a crossed field fails as loudly as a constant.
#
# The contract check (`bun run check:social-msg-keys`) proves the emitter names
# the right 13 channels and routes each through `toFunctionStatus`. It cannot
# prove the mapper DECIDES correctly — it only reads source text, and #212 was
# precisely a mapper whose output did not depend on its input. This runs it.
#
# Deliberately not folded into the Kotlin AsyncFunction surface test: that one
# parses `.kt` files and links nothing but junit. This links
# vpprotocol-2.3.80.15.aar, because the whole point is to feed the mapper the
# vendor's own `EFunctionStatus` constants rather than a stub that could drift
# from them. `VeepooFunctionStatus.kt` imports those two vendor types and
# nothing else — no Android framework, no ExpoModulesCore — so the AAR is the
# only classpath needed and the run finishes in seconds without a Gradle
# invocation, an Android SDK or an emulator.
#
# Exit codes: 0 pass, 1 fail, 3 prerequisites missing (caller may treat as skip).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

command -v kotlinc >/dev/null 2>&1 || { echo "android-function-status-check: kotlinc not on PATH (try: brew install kotlin)" >&2; exit 3; }
command -v java >/dev/null 2>&1 || { echo "android-function-status-check: java not on PATH (try: brew install temurin)" >&2; exit 3; }
command -v unzip >/dev/null 2>&1 || { echo "android-function-status-check: unzip not on PATH" >&2; exit 3; }

SOURCE="android/src/main/kotlin/expo/modules/veepoo/VeepooFunctionStatus.kt"
CASES="scripts/AndroidFunctionStatusCheck.kt"
for file in "$SOURCE" "$CASES"; do
  [ -f "$file" ] || { echo "android-function-status-check: $file missing" >&2; exit 1; }
done

# Resolved by glob, not pinned: a vendor bump should send the NEW enum through
# these cases, not fail with "file missing" and leave the mappers untested at
# the one moment their input might have changed. `bun run vendor:check` is what
# tracks the version; this only needs whichever vpprotocol ships.
shopt -s nullglob
AARS=(android/libs/vpprotocol-*.aar)
shopt -u nullglob
case ${#AARS[@]} in
  1) AAR="${AARS[0]}" ;;
  0) echo "android-function-status-check: no android/libs/vpprotocol-*.aar found" >&2; exit 1 ;;
  *) echo "android-function-status-check: ${#AARS[@]} vpprotocol AARs in android/libs — ${AARS[*]}; leave one" >&2; exit 1 ;;
esac

# Explicit XXXXXX template, not `mktemp -t NAME`: the BSD spelling the iOS
# check uses is fine there because that script is guarded to macOS, but this
# one runs on the Linux CI job, where GNU mktemp rejects a template with no X.
WORK="$(mktemp -d "${TMPDIR:-/tmp}/veepoo-function-status.XXXXXX")"
trap 'rm -rf "$WORK"' EXIT

# The vendor's own enum, not a hand-written stand-in — a stub would go green
# while the shipped constants moved underneath it.
unzip -o -q "$AAR" classes.jar -d "$WORK"
VENDOR="$WORK/classes.jar"

# The shipped source itself, not a copy — a test against a duplicated mapper
# would go green while the emitted one rots.
echo "  · compiling $SOURCE + cases against $(basename "$AAR")"
# -include-runtime bundles kotlin-stdlib into the jar: kotlinc's install layout
# varies by package manager, so we let it supply its own runtime rather than
# guess a path to the stdlib.
kotlinc -include-runtime -nowarn -cp "$VENDOR" "$SOURCE" "$CASES" -d "$WORK/check.jar" 2>&1 |
  grep -v '^warning: ' || true
[ -f "$WORK/check.jar" ] || { echo "android-function-status-check: compilation failed" >&2; exit 1; }

java -cp "$WORK/check.jar:$VENDOR" expo.modules.veepoo.AndroidFunctionStatusCheckKt
