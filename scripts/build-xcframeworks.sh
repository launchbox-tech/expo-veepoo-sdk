#!/bin/sh
# Wrap the six vendored Veepoo frameworks as .xcframework bundles carrying two
# slices each:
#
#   ios-<archs>            our real, unchanged vendor binary (device)
#   ios-<archs>-simulator  an empty stub compiled from `int veepoo_stub(void)`
#
# The vendor publishes no simulator slice at any version (checked
# HBandSDK/iOS_Ble_SDK, iOS_sdk_source/Framework/2.2.XX.15/), so a stub is the
# only mechanism available. It exists purely so the simulator has something to
# link and a Clang module to `import` — every stub carries the REAL Headers/ and
# module.modulemap, so our Swift type-checks against the true vendor API instead
# of being excluded from the build.
#
# Device builds are unaffected: the device slice is a byte-for-byte copy of the
# framework that was already vendored here (verify with `shasum`).
#
# The bundle is assembled by hand rather than by `xcodebuild -create-xcframework`
# because that tool rejects our VeepooBleSDK: the archive carries bitcode members
# and it exits with `Unknown header: 0xb17c0de`. Stripping the bitcode would mean
# shipping a device binary we did not receive from the vendor, which is the one
# thing this change must not do. The layout below is exactly what the tool emits
# for the five frameworks it does accept.
#
# Idempotent. Re-reads the device slice out of the existing .xcframework once the
# plain .framework has been replaced.
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
FRAMEWORK_DIR="$ROOT_DIR/ios/VeepooSDK/Frameworks"
TMP_DIR="${TMPDIR:-/private/tmp}/veepoo-xcframeworks"
# Match s.platforms in ios/VeepooSDK.podspec.
MIN_IOS="16.4"
SIM_ARCHS="arm64 x86_64"

rm -rf "$TMP_DIR"
mkdir -p "$TMP_DIR"

SIM_SDK_PATH="$(xcrun --sdk iphonesimulator --show-sdk-path)"

# Echoes the path of the device .framework for $1, preferring the plain
# framework and falling back to the non-simulator slice of an existing
# .xcframework. Fails loudly rather than silently producing a stub-only bundle.
device_framework_path() {
  name="$1"
  if [ -d "$FRAMEWORK_DIR/$name.framework" ]; then
    echo "$FRAMEWORK_DIR/$name.framework"
    return 0
  fi
  for slice in "$FRAMEWORK_DIR/$name.xcframework"/ios-*; do
    case "$slice" in
      *-simulator) continue ;;
    esac
    if [ -d "$slice/$name.framework" ]; then
      echo "$slice/$name.framework"
      return 0
    fi
  done
  echo "error: no device slice found for $name (looked in $FRAMEWORK_DIR)" >&2
  return 1
}

# `ios-arm64_armv7`-style slice identifier, from the archs actually in $1.
# Alphabetical, which is the order xcodebuild itself emits.
slice_identifier() {
  binary="$1"
  suffix="$2"
  archs="$(lipo -archs "$binary" | tr ' ' '\n' | sort | tr '\n' '_' | sed 's/_$//')"
  echo "ios-$archs$suffix"
}

# <string> rows for the SupportedArchitectures array of $1.
arch_entries() {
  lipo -archs "$1" | tr ' ' '\n' | sort | sed 's|.*|\
				<string>&</string>|' | tr -d '\n'
}

make_stub_framework() {
  name="$1"
  kind="$2"

  device_src="$(device_framework_path "$name")"

  # Stage the device slice FIRST. The output .xcframework has to be removed
  # before it is rebuilt, and it may be the very thing we are reading from —
  # getting this order wrong destroys a binary that exists nowhere but git.
  stub_root="$TMP_DIR/$name"
  device_framework="$stub_root/device/$name.framework"
  stub_framework="$stub_root/simulator/$name.framework"
  mkdir -p "$stub_root/device" "$stub_framework"
  cp -R "$device_src" "$device_framework"

  # The stub reuses the real Headers/ and module.modulemap verbatim; only the
  # Mach-O is replaced. That is what lets `import VeepooBleSDK` resolve — and
  # type-check — on the simulator.
  cp -R "$device_framework/Headers" "$stub_framework/Headers"
  if [ -d "$device_framework/Modules" ]; then
    cp -R "$device_framework/Modules" "$stub_framework/Modules"
  fi
  cp "$device_framework/Info.plist" "$stub_framework/Info.plist"
  /usr/libexec/PlistBuddy -c "Set :CFBundleExecutable $name" "$stub_framework/Info.plist" >/dev/null

  # A vendor-generated `<name>-Swift.h` guards its declarations with
  # `#elif defined(__arm64__) && __arm64__` and `#error unsupported Swift
  # architecture` otherwise — the vendor only ever compiled for arm64. The
  # x86_64 simulator slice then fails to build the Clang module. Widen the guard
  # in the STUB copy only; the declarations inside are plain ObjC and
  # arch-independent, and the device header is left untouched.
  for header in "$stub_framework/Headers"/*-Swift.h; do
    [ -f "$header" ] || continue
    grep -q "unsupported Swift architecture" "$header" || continue
    /usr/bin/sed -i '' \
      's/^#elif defined(__arm64__) \&\& __arm64__$/#elif (defined(__arm64__) \&\& __arm64__) || (defined(__x86_64__) \&\& __x86_64__)/' \
      "$header"
    grep -q "__x86_64__" "$header" || {
      echo "error: could not widen the arch guard in ${header##*/} — the vendor header shape changed" >&2
      exit 1
    }
  done

  printf 'int veepoo_stub(void) { return 0; }\n' > "$stub_root/empty.c"

  for arch in $SIM_ARCHS; do
    mkdir -p "$stub_root/$arch"
    case "$kind" in
      dynamic)
        xcrun clang -dynamiclib \
          -arch "$arch" \
          -target "$arch-apple-ios$MIN_IOS-simulator" \
          -isysroot "$SIM_SDK_PATH" \
          -install_name "@rpath/$name.framework/$name" \
          "$stub_root/empty.c" \
          -o "$stub_root/$arch/$name"
        ;;
      static)
        xcrun clang -c \
          -arch "$arch" \
          -target "$arch-apple-ios$MIN_IOS-simulator" \
          -isysroot "$SIM_SDK_PATH" \
          "$stub_root/empty.c" \
          -o "$stub_root/$arch/empty.o"
        xcrun libtool -static -o "$stub_root/$arch/$name" "$stub_root/$arch/empty.o"
        ;;
      *)
        echo "error: unknown framework kind: $kind" >&2
        exit 1
        ;;
    esac
  done

  # POSIX sh has no arrays; positional params are the only way to build an
  # argument list that survives paths containing spaces (TMPDIR can).
  set --
  for arch in $SIM_ARCHS; do
    set -- "$@" "$stub_root/$arch/$name"
  done
  lipo -create "$@" -output "$stub_framework/$name"

  device_id="$(slice_identifier "$device_framework/$name" "")"
  sim_id="$(slice_identifier "$stub_framework/$name" "-simulator")"

  out="$TMP_DIR/$name.xcframework"
  rm -rf "$out"
  mkdir -p "$out/$device_id" "$out/$sim_id"
  cp -R "$device_framework" "$out/$device_id/$name.framework"
  cp -R "$stub_framework" "$out/$sim_id/$name.framework"

  cat > "$out/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>AvailableLibraries</key>
	<array>
		<dict>
			<key>BinaryPath</key>
			<string>$name.framework/$name</string>
			<key>LibraryIdentifier</key>
			<string>$device_id</string>
			<key>LibraryPath</key>
			<string>$name.framework</string>
			<key>SupportedArchitectures</key>
			<array>$(arch_entries "$device_framework/$name")
			</array>
			<key>SupportedPlatform</key>
			<string>ios</string>
		</dict>
		<dict>
			<key>BinaryPath</key>
			<string>$name.framework/$name</string>
			<key>LibraryIdentifier</key>
			<string>$sim_id</string>
			<key>LibraryPath</key>
			<string>$name.framework</string>
			<key>SupportedArchitectures</key>
			<array>$(arch_entries "$stub_framework/$name")
			</array>
			<key>SupportedPlatform</key>
			<string>ios</string>
			<key>SupportedPlatformVariant</key>
			<string>simulator</string>
		</dict>
	</array>
	<key>CFBundlePackageType</key>
	<string>XFWK</string>
	<key>XCFrameworkFormatVersion</key>
	<string>1.0</string>
</dict>
</plist>
PLIST
  plutil -lint "$out/Info.plist" >/dev/null

  rm -rf "$FRAMEWORK_DIR/$name.xcframework"
  cp -R "$out" "$FRAMEWORK_DIR/$name.xcframework"
  # The plain .framework is now redundant — the identical bytes live in the
  # device slice. Keeping both would let the two copies drift.
  rm -rf "$FRAMEWORK_DIR/$name.framework"

  echo "wrote $name.xcframework ($device_id + $sim_id)"
}

make_stub_framework VeepooBleSDK static
make_stub_framework JL_BLEKit static
make_stub_framework JLDialUnit dynamic
make_stub_framework GRDFUSDK dynamic
make_stub_framework ABParTool dynamic
make_stub_framework ZipZap dynamic

echo "xcframeworks written to $FRAMEWORK_DIR"
