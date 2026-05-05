#!/usr/bin/env bash
# fetch-sdk-snapshots.sh
# Downloads the event-relevant source files from both upstream HBandSDK repos
# at the SHAs pinned in vendor-manifest.json, writing them into vendor-sdk-snapshots/.
#
# Uses GitHub raw content URLs (no git clone required — no git subprocess warnings).
# Skips any file whose snapshot is already present at the correct SHA (cache-friendly).
# Run manually or via CI after vendor-manifest.json SHA pins change.
#
# Requires: curl, node (for JSON parsing), bash ≥ 3.2
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MANIFEST="$REPO_ROOT/vendor-manifest.json"
DEST="$REPO_ROOT/vendor-sdk-snapshots"

# Read SHAs from vendor-manifest.json
ANDROID_SHA="$(node -e "const m=require('$MANIFEST'); process.stdout.write(m.upstreamReference.androidBleSdk.lastReviewedHeadSha)")"
IOS_SHA="$(node -e "const m=require('$MANIFEST'); process.stdout.write(m.upstreamReference.iosBleSdk.lastReviewedHeadSha)")"

ANDROID_RAW="https://raw.githubusercontent.com/HBandSDK/Android_Ble_SDK/${ANDROID_SHA}"
IOS_RAW="https://raw.githubusercontent.com/HBandSDK/iOS_Ble_SDK/${IOS_SHA}"

ANDROID_DEST="$DEST/android"
IOS_DEST="$DEST/ios"

stamp_file() { echo "$1/.fetch-sha"; }

needs_fetch() {
  local dest="$1" sha="$2"
  local stamp
  stamp="$(stamp_file "$dest")"
  [[ ! -f "$stamp" ]] || [[ "$(cat "$stamp")" != "$sha" ]]
}

download_file() {
  local url="$1" dest="$2"
  mkdir -p "$(dirname "$dest")"
  curl -fsSL --max-time 30 "$url" -o "$dest"
}

# ── Android ──────────────────────────────────────────────────────────────────
ANDROID_FILES=(
  "android_sdk_source/Demo/VpBluetoothSDK/app/src/main/java/com/timaimee/vpdemo/MyService.java"
)

if needs_fetch "$ANDROID_DEST" "$ANDROID_SHA"; then
  echo "→ fetching Android_Ble_SDK at $ANDROID_SHA"
  rm -rf "$ANDROID_DEST"
  for f in "${ANDROID_FILES[@]}"; do
    echo "  downloading $f"
    download_file "$ANDROID_RAW/$f" "$ANDROID_DEST/$f"
  done
  echo "$ANDROID_SHA" > "$(stamp_file "$ANDROID_DEST")"
  echo "  ✓ written to $ANDROID_DEST"
else
  echo "→ Android snapshot up-to-date ($ANDROID_SHA)"
fi

# ── iOS ───────────────────────────────────────────────────────────────────────
IOS_HEADER_BASE="iOS_sdk_source/Framework/2.2.XX.15/VeepooBleSDK.framework/Headers"
IOS_FILES=(
  "$IOS_HEADER_BASE/VPBleCentralManage.h"
  "$IOS_HEADER_BASE/VPPeripheralBaseManage.h"
  "$IOS_HEADER_BASE/VPPeripheralManage.h"
  "$IOS_HEADER_BASE/VPPeripheralAddManage.h"
  "$IOS_HEADER_BASE/VPPublicDefine.h"
  "$IOS_HEADER_BASE/VPECGMultiLeadBLEDelegate.h"
  "$IOS_HEADER_BASE/VPDFUOperation.h"
)

if needs_fetch "$IOS_DEST" "$IOS_SHA"; then
  echo "→ fetching iOS_Ble_SDK at $IOS_SHA"
  rm -rf "$IOS_DEST"
  for f in "${IOS_FILES[@]}"; do
    echo "  downloading $f"
    download_file "$IOS_RAW/$f" "$IOS_DEST/$f"
  done
  echo "$IOS_SHA" > "$(stamp_file "$IOS_DEST")"
  echo "  ✓ written to $IOS_DEST"
else
  echo "→ iOS snapshot up-to-date ($IOS_SHA)"
fi

echo ""
echo "SDK snapshots ready in $DEST"
echo "Run 'node build/bridge-contract/cli-check-upstream-sdk.js' to verify coverage."
