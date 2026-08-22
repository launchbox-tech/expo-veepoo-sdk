Pod::Spec.new do |s|
  s.name           = 'VeepooSDK'
  s.version        = '1.3.3'
  s.summary        = 'Expo module for Veepoo SDK Bluetooth connectivity'
  s.description    = 'Expo module that provides Bluetooth LE functionality for Veepoo devices'
  s.author         = 'Expo'
  s.homepage       = 'https://github.com/expo/expo'
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: 'https://github.com/expo/expo.git' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.dependency 'FMDB'
  s.dependency 'MJExtension'
  s.swift_versions = '5.4'

  # Each vendored framework is an .xcframework with two slices: our real,
  # unchanged device binary, and an empty stub for the simulator (built by
  # scripts/build-xcframeworks.sh — the vendor publishes no simulator slice at
  # any version). The stub carries the real Headers/ and module.modulemap, so
  # `import VeepooBleSDK` resolves on the simulator and our Swift compiles
  # there instead of being excluded from the build.
  #
  # NOTE on what this does and does not buy: Swift parses but does not
  # type-check an inactive `#if` branch, so simulator builds now catch syntax
  # errors everywhere and type errors only OUTSIDE the
  # `#if !targetEnvironment(simulator)` guards. Vendor signature drift is still
  # device-only. Verify with `-sdk iphoneos`.
  #
  # CocoaPods owns the slice selection: it copies the matching slice into
  # PODS_XCFRAMEWORKS_BUILD_DIR at build time and generates the search paths.
  # Do not hand-write slice directory names here — they vary per binary
  # (ios-arm64 vs ios-arm64_armv7) and change on a vendor bump.
  s.vendored_frameworks = %w[
    VeepooSDK/Frameworks/VeepooBleSDK.xcframework
    VeepooSDK/Frameworks/JL_BLEKit.xcframework
    VeepooSDK/Frameworks/JLDialUnit.xcframework
    VeepooSDK/Frameworks/GRDFUSDK.xcframework
    VeepooSDK/Frameworks/ABParTool.xcframework
    VeepooSDK/Frameworks/ZipZap.xcframework
  ]

  # Declaring them here also makes CocoaPods embed the four dynamic frameworks
  # (ABParTool, GRDFUSDK, JLDialUnit, ZipZap) into the app's Frameworks/ folder
  # via `[CP] Embed Pods Frameworks` — without that the app crashes at launch
  # with "Library not loaded: @rpath/JLDialUnit.framework/JLDialUnit". That used
  # to need a bespoke run-script phase in the app target
  # (src/plugin/index.ts -> withVeepooFrameworkEmbed), which is why the plugin no
  # longer has one.

  s.frameworks = 'CoreBluetooth', 'CoreLocation', 'CoreMotion', 'CoreAudio', 'AVFoundation'

  s.subspec 'VeepooSDK' do |ss|
    ss.source_files = 'VeepooSDK/*.{swift,m,h}'
  end

  # File-parsing tests that don't link against the vendored frameworks. Kept
  # in a test_spec so `pod lib lint --include-tests` and consumer Xcode test
  # targets can pick them up without forcing the binary frameworks onto the
  # test scheme.
  s.test_spec 'Tests' do |ts|
    ts.source_files = 'Tests/*.swift'
    ts.requires_app_host = false
  end
end
