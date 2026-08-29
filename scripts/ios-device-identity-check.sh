#!/usr/bin/env bash
# ios-device-identity-check.sh
# Compile and RUN the #218 device-identity split against the shipped Swift.
#
# The contract check (`bun run check:device-ready-identity`) proves the
# DEVICE_READY emission sites call VeepooDeviceIdentity. It cannot prove the
# type decides correctly — it only reads source text. This runs it.
#
# Deliberately not part of scripts/ios-swift-gate.sh: that gate needs a bun
# install, an expo prebuild and a pod install before it can compile anything
# (~4 minutes), because ios/VeepooSDK/*.swift import ExpoModulesCore.
# VeepooDeviceIdentity.swift imports Foundation and nothing else, so it needs
# none of that and finishes in about a second. Keeping it separate means a
# broken predicate fails in seconds rather than behind a four-minute build.
#
# Exit codes: 0 pass, 1 fail, 3 prerequisites missing (caller may treat as skip).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

[ "$(uname -s)" = "Darwin" ] || { echo "ios-device-identity-check: needs macOS (swiftc); this host is $(uname -s)" >&2; exit 3; }
command -v xcrun >/dev/null 2>&1 || { echo "ios-device-identity-check: xcrun not on PATH — install Xcode" >&2; exit 3; }

SOURCE="ios/VeepooSDK/VeepooDeviceIdentity.swift"
CASES="scripts/ios-device-identity-check.swift"
[ -f "$SOURCE" ] || { echo "ios-device-identity-check: $SOURCE missing" >&2; exit 1; }

BIN="$(mktemp -t veepoo-device-identity)"
trap 'rm -f "$BIN"' EXIT

# The shipped source itself, not a copy — a test against a duplicated predicate
# would go green while the emitted one rots.
echo "  · compiling $SOURCE + cases"
xcrun swiftc -O -o "$BIN" "$SOURCE" "$CASES"

"$BIN"
