Pod::Spec.new do |s|
  s.name           = 'VeepooSDK'
  s.version        = '1.2.11'
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

  frameworks_dir = File.expand_path('VeepooSDK/Frameworks', __dir__)
  # VeepooBleSDK is vendored under ios/VeepooSDK/Frameworks. Pod target and user target
  # have different available vars, so keep separate search-path strings.
  veepoo_fw_search = '$(inherited) "$(PODS_TARGET_SRCROOT)/VeepooSDK/Frameworks"'
  veepoo_fw_search_user = %($(inherited) "#{frameworks_dir}")
  linked_frameworks = %w[
    VeepooBleSDK
    JL_BLEKit
    JLDialUnit
    GRDFUSDK
    ABParTool
    ZipZap
  ]
  linker_flags = linked_frameworks.map { |name| %(-framework "#{name}") }.join(' ')

  # This spec only *links* the vendored frameworks (device-only). The four
  # dynamic frameworks (ABParTool, GRDFUSDK, JLDialUnit, ZipZap) must also be
  # *embedded* into the app's Frameworks/ folder or the app crashes at launch
  # ("Library not loaded: @rpath/JLDialUnit.framework/JLDialUnit"). A pod
  # script_phase cannot do that: this pod is a static library, so its build
  # phases have no FRAMEWORKS_FOLDER_PATH and never reach the app bundle.
  # Embedding therefore happens in the *app* target via the config plugin
  # (src/plugin/index.ts -> withVeepooFrameworkEmbed).

  s.preserve_paths = 'VeepooSDK/Frameworks/**/*'
  s.pod_target_xcconfig = {
    'FRAMEWORK_SEARCH_PATHS[sdk=iphoneos*]' => veepoo_fw_search,
    'OTHER_LDFLAGS[sdk=iphoneos*]' => %($(inherited) #{linker_flags}),
    'FRAMEWORK_SEARCH_PATHS[sdk=iphonesimulator*]' => veepoo_fw_search,
    'OTHER_LDFLAGS[sdk=iphonesimulator*]' => '$(inherited)',
    'EXCLUDED_SOURCE_FILE_NAMES[sdk=iphonesimulator*]' => 'VeepooSDK.swift VeepooSDKModule+*.swift'
  }
  s.user_target_xcconfig = {
    'FRAMEWORK_SEARCH_PATHS[sdk=iphoneos*]' => veepoo_fw_search_user,
    'OTHER_LDFLAGS[sdk=iphoneos*]' => %($(inherited) #{linker_flags}),
    'FRAMEWORK_SEARCH_PATHS[sdk=iphonesimulator*]' => veepoo_fw_search_user,
    'OTHER_LDFLAGS[sdk=iphonesimulator*]' => '$(inherited)'
  }
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
