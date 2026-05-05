#!/usr/bin/env bash
# fetch-sdk-snapshots.sh
# Sparse-clones the event-relevant source files from both upstream HBandSDK repos
# at the SHAs pinned in vendor-manifest.json, writing them into vendor-sdk-snapshots/.
#
# Skips any repo whose snapshot is already present at the correct SHA (cache-friendly).
# Run manually or via CI after vendor-manifest.json SHA pins change.
#
# Requires: git, node (for JSON parsing), bash ≥ 3.2
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MANIFEST="$REPO_ROOT/vendor-manifest.json"
DEST="$REPO_ROOT/vendor-sdk-snapshots"

# Read SHAs from vendor-manifest.json
ANDROID_SHA="$(node -e "const m=require('$MANIFEST'); process.stdout.write(m.upstreamReference.androidBleSdk.lastReviewedHeadSha)")"
IOS_SHA="$(node -e "const m=require('$MANIFEST'); process.stdout.write(m.upstreamReference.iosBleSdk.lastReviewedHeadSha)")"

ANDROID_URL="https://github.com/HBandSDK/Android_Ble_SDK.git"
IOS_URL="https://github.com/HBandSDK/iOS_Ble_SDK.git"

ANDROID_DEST="$DEST/android"
IOS_DEST="$DEST/ios"

stamp_file() { echo "$1/.fetch-sha"; }

needs_fetch() {
  local dest="$1" sha="$2"
  local stamp
  stamp="$(stamp_file "$dest")"
  [[ ! -f "$stamp" ]] || [[ "$(cat "$stamp")" != "$sha" ]]
}

sparse_clone() {
  local url="$1" sha="$2" dest="$3"
  shift 3
  local -a paths=("$@")

  echo "→ fetching $(basename "$url") at $sha"
  local tmp
  tmp="$(mktemp -d)"
  trap 'rm -rf "$tmp"' RETURN

  git -C "$tmp" init -q
  git -C "$tmp" remote add origin "$url"
  git -C "$tmp" config core.sparseCheckout true

  local sparse_file="$tmp/.git/info/sparse-checkout"
  for p in "${paths[@]}"; do
    echo "$p" >> "$sparse_file"
  done

  git -C "$tmp" fetch --depth=1 origin "$sha" 2>&1 | tail -1
  git -C "$tmp" checkout FETCH_HEAD -- 2>/dev/null || true

  rm -rf "$dest"
  mkdir -p "$dest"
  cp -r "$tmp"/. "$dest/"
  echo "$sha" > "$(stamp_file "$dest")"
  echo "  ✓ written to $dest"
}

# ── Android ──────────────────────────────────────────────────────────────────
# We fetch the demo Java service (registers all SDK listeners) and the Javadoc
# HTML file listing (listener interface names without full HTML content).
ANDROID_PATHS=(
  "android_sdk_source/Demo/VpBluetoothSDK/app/src/main/java/com/timaimee/vpdemo/MyService.java"
)

if needs_fetch "$ANDROID_DEST" "$ANDROID_SHA"; then
  sparse_clone "$ANDROID_URL" "$ANDROID_SHA" "$ANDROID_DEST" "${ANDROID_PATHS[@]}"
else
  echo "→ Android snapshot up-to-date ($ANDROID_SHA)"
fi

# ── iOS ───────────────────────────────────────────────────────────────────────
# We fetch the primary manager headers that define all block callbacks.
IOS_HEADER_BASE="iOS_sdk_source/Framework/2.2.XX.15/VeepooBleSDK.framework/Headers"
IOS_PATHS=(
  "$IOS_HEADER_BASE/VPBleCentralManage.h"
  "$IOS_HEADER_BASE/VPPeripheralBaseManage.h"
  "$IOS_HEADER_BASE/VPPeripheralManage.h"
  "$IOS_HEADER_BASE/VPPeripheralAddManage.h"
  "$IOS_HEADER_BASE/VPPublicDefine.h"
  "$IOS_HEADER_BASE/VPECGMultiLeadBLEDelegate.h"
  "$IOS_HEADER_BASE/VPDFUOperation.h"
)

if needs_fetch "$IOS_DEST" "$IOS_SHA"; then
  sparse_clone "$IOS_URL" "$IOS_SHA" "$IOS_DEST" "${IOS_PATHS[@]}"
else
  echo "→ iOS snapshot up-to-date ($IOS_SHA)"
fi

echo ""
echo "SDK snapshots ready in $DEST"
echo "Run 'node build/bridge-contract/cli-check-upstream-sdk.js' to verify coverage."
