Pod::Spec.new do |s|
  s.name           = 'VeepooSDK'
  s.version        = '1.2.1'
  s.summary        = 'Expo module for Veepoo SDK Bluetooth connectivity'
  s.description    = 'Expo module that provides Bluetooth LE functionality for Veepoo devices'
  s.author         = 'Expo'
  s.homepage       = 'https://github.com/expo/expo'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: 'https://github.com/expo/expo.git' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.dependency 'FMDB'
  s.dependency 'MJExtension'
  s.swift_versions = '5.4'

  frameworks_dir = File.expand_path('VeepooSDK/Frameworks', __dir__)
  linker_flags = %w[
    VeepooBleSDK
    JL_BLEKit
    JLDialUnit
    GRDFUSDK
    ABParTool
    ZipZap
  ].map { |name| %(-framework "#{name}") }.join(' ')

  s.preserve_paths = 'VeepooSDK/Frameworks/**/*'
  s.pod_target_xcconfig = {
    'FRAMEWORK_SEARCH_PATHS[sdk=iphoneos*]' => %($(inherited) "#{frameworks_dir}"),
    'OTHER_LDFLAGS[sdk=iphoneos*]' => %($(inherited) #{linker_flags}),
    'FRAMEWORK_SEARCH_PATHS[sdk=iphonesimulator*]' => '$(inherited)',
    'OTHER_LDFLAGS[sdk=iphonesimulator*]' => '$(inherited)'
  }
  s.user_target_xcconfig = {
    'FRAMEWORK_SEARCH_PATHS[sdk=iphoneos*]' => %($(inherited) "#{frameworks_dir}"),
    'OTHER_LDFLAGS[sdk=iphoneos*]' => %($(inherited) #{linker_flags}),
    'FRAMEWORK_SEARCH_PATHS[sdk=iphonesimulator*]' => '$(inherited)',
    'OTHER_LDFLAGS[sdk=iphonesimulator*]' => '$(inherited)'
  }

  s.frameworks = 'CoreBluetooth', 'CoreLocation', 'CoreMotion', 'CoreAudio', 'AVFoundation'

  s.subspec 'VeepooSDK' do |ss|
    ss.source_files = 'VeepooSDK/*.{swift,m,h}'
  end
end
