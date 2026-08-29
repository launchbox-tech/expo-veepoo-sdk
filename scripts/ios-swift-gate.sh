#!/usr/bin/env bash
# ios-swift-gate.sh
# Compile the module's iOS Swift sources so a type error in ios/VeepooSDK/*.swift
# fails here instead of in a consumer's `xcodebuild`.
#
# Why this shape:
#   * TYPECHECK, not parse. `xcrun swiftc -frontend -parse` is syntax-only and
#     happily accepts `func f(_ x: NSUInteger)` — the exact bug that reached main
#     and broke a downstream app. Only a real compile resolves type names.
#   * A real build, not a hand-rolled `swiftc -typecheck`. The sources
#     `import ExpoModulesCore`, whose .swiftmodule only exists once CocoaPods has
#     built it, so `pod install` is unavoidable either way — and once you have
#     Pods, letting CocoaPods generate the search paths beats hand-maintaining
#     the -I/-F/-fmodule-map-file set. The podspec also warns that the vendored
#     .xcframework slice directory names change on a vendor bump, so they must
#     not be written by hand.
#   * The `VeepooSDK` POD TARGET, not the example app target. Same compile of the
#     same sources, without the app's JS bundle, Hermes, or the final link step —
#     where the vendor's bitcode-carrying device binary buys us nothing (see the
#     0xb17c0de note in scripts/build-xcframeworks.sh).
#   * The `iphoneos` SDK, and only that one. Swift parses but does not type-check
#     an inactive `#if` branch, and 52 of the 54 files here sit behind
#     `#if !targetEnvironment(simulator)` — so the device SDK is the one that
#     activates that code and checks our calls against the real vendor headers.
#     It is also the slice nobody exercises by accident: the simulator side is
#     what every `expo run:ios` compiles all day, so a break there surfaces in
#     minutes, whereas a device-only type error can reach a release build — which
#     is exactly what happened. Adding the simulator pass roughly doubles the
#     wall time (3m38s -> 6m41s on a CI runner) to cover the side that is already
#     self-catching, so it is not in the default. It stays available as an
#     explicit argument for anyone touching the `#if targetEnvironment(simulator)`
#     branches:
#
#         bash scripts/ios-swift-gate.sh iphoneos iphonesimulator
#
# Exit codes: 0 pass, 1 fail, 3 prerequisites missing (caller may treat as skip).
#
# Usage: bash scripts/ios-swift-gate.sh [iphoneos|iphonesimulator ...]
#        defaults to iphoneos; both are run when both are named.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

SDKS=("$@")
[ ${#SDKS[@]} -eq 0 ] && SDKS=(iphoneos)

missing() { echo "ios-swift-gate: $*" >&2; exit 3; }

[ "$(uname -s)" = "Darwin" ] || missing "needs macOS (Xcode); this host is $(uname -s)"
command -v xcodebuild >/dev/null 2>&1 || missing "xcodebuild not on PATH — install Xcode and run xcode-select --switch"
command -v bun        >/dev/null 2>&1 || missing "bun not on PATH — see https://bun.sh"
command -v pod        >/dev/null 2>&1 || missing "CocoaPods not on PATH — try: brew install cocoapods"

# The example's app.json lists "expo-veepoo-sdk" as a config plugin, which
# resolves through package.json -> expo.plugin -> ./build/plugin/index.js. That
# is emitted by `bun run build`, so prebuild fails without it.
[ -f build/plugin/index.js ] || { echo "ios-swift-gate: build/plugin/index.js missing — run 'bun run build' first" >&2; exit 1; }

# CocoaPods refuses to run under an ASCII locale.
export LANG="${LANG:-en_US.UTF-8}"
case "$LANG" in *UTF-8|*utf8) ;; *) export LANG=en_US.UTF-8 ;; esac

echo "  · installing example dependencies"
# Not --frozen-lockfile: the example depends on the module as `file:..`, so any
# dependency edit in the root package.json legitimately moves example/bun.lock.
# Freezing it would fail this gate for a reason that has nothing to do with Swift.
# The retry is not superstition: the example depends on the module as `file:..`,
# and bun caches that local package. Editing a module source between runs can
# leave the cache entry pointing at files that no longer exist, and the install
# dies with "ENOENT: failed copying files from cache". Dropping the linked copy
# and reinstalling clears it.
(cd example && bun install) \
  || { rm -rf example/node_modules/expo-veepoo-sdk; (cd example && bun install); }

echo "  · expo prebuild (ios)"
# The example's own expo binary, not `npx`/`bunx`: no resolver in the middle, so
# CI and a developer's shell run the identical thing, and a failed install above
# surfaces here as a missing file rather than a silent fetch of another version.
# --no-install: we run pod install ourselves below, so its output isn't buried.
(cd example && ./node_modules/.bin/expo prebuild -p ios --no-install)

echo "  · pod install"
(cd example/ios && pod install)

STATUS=0

for sdk in "${SDKS[@]}"; do
  case "$sdk" in
    iphoneos)        destination='generic/platform=iOS' ;;
    iphonesimulator) destination='generic/platform=iOS Simulator' ;;
    *) echo "ios-swift-gate: unknown sdk '$sdk'" >&2; exit 1 ;;
  esac

  echo "  · compiling ios/VeepooSDK/*.swift for -sdk $sdk"
  log="$(mktemp -t veepoo-swift-gate)"
  # CODE_SIGNING_*=NO: a static pod target needs no identity, and CI has none.
  if xcodebuild \
      -project example/ios/Pods/Pods.xcodeproj \
      -target VeepooSDK \
      -configuration Debug \
      -sdk "$sdk" \
      -destination "$destination" \
      CODE_SIGNING_ALLOWED=NO \
      CODE_SIGNING_REQUIRED=NO \
      build >"$log" 2>&1; then
    echo "    ✓ $sdk"
  else
    echo "    ✗ $sdk — compile errors:"
    grep -E "error:" "$log" | sort -u | sed 's/^/      /' || tail -40 "$log" | sed 's/^/      /'
    echo "    full log: $log"
    STATUS=1
  fi
done

# A gate that compiles nothing passes. Assert the sources really were handed to
# the compiler, so a renamed pod target or a narrowed `source_files` glob in the
# podspec fails loudly instead of going green on an empty build. SwiftFileList is
# the input list Xcode writes per target — unlike the build log it survives an
# incremental rebuild that recompiled nothing.
#
# Scoped to the SDKs this run actually built. Globbing every Pods.build/*/ dir
# instead reads leftovers: example/ios/build is not cleaned between runs, so a
# Debug-iphonesimulator list from an earlier invocation still sits there, and
# adding a .swift file makes the default (iphoneos-only) run fail on a count
# from a build that predates the new file. The `-configuration Debug` above is
# what makes the directory name "Debug-$sdk".
if [ "$STATUS" -eq 0 ]; then
  EXPECTED=$(find ios/VeepooSDK -maxdepth 1 -name '*.swift' | wc -l | tr -d ' ')
  for sdk in "${SDKS[@]}"; do
    found_lists=0
    for list in "example/ios/build/Pods.build/Debug-$sdk"/VeepooSDK.build/Objects-normal/*/VeepooSDK.SwiftFileList; do
      [ -f "$list" ] || continue
      found_lists=$((found_lists + 1))
      arch="$(basename "$(dirname "$list")")"
      compiled=$(grep -c '/ios/VeepooSDK/[^/]*\.swift$' "$list" || true)
      if [ "$compiled" -lt "$EXPECTED" ]; then
        echo "ios-swift-gate: Debug-$sdk ($arch) compiled only $compiled of $EXPECTED ios/VeepooSDK/*.swift files" >&2
        echo "  the VeepooSDK pod target is no longer building this module's sources — check source_files in ios/VeepooSDK.podspec" >&2
        STATUS=1
      fi
    done
    # Per SDK, not once overall: a run that built two SDKs and got a file list
    # for only one of them has half a gate, and the old global check passed it.
    if [ "$found_lists" -eq 0 ]; then
      echo "ios-swift-gate: xcodebuild reported success for $sdk but wrote no VeepooSDK.SwiftFileList" >&2
      echo "  nothing was compiled — the gate cannot vouch for these sources" >&2
      STATUS=1
    fi
  done
fi

exit "$STATUS"
