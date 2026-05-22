package expo.modules.veepoo

import expo.modules.kotlin.modules.ModuleDefinitionBuilder

/**
 * Read-data surface aggregator. Each read path (battery, personal info,
 * device functions, device version, social-msg, origin five-minute, origin
 * half-hour day rollup, device-all-day rollup, sleep, sport-steps, day
 * summary) lives in its own `VeepooSDKModule<Feature>.kt` file with a
 * `define<Feature>` extension function on [ModuleDefinitionBuilder]. The
 * shared helper [buildHalfHourItems] lives in
 * `VeepooSDKModuleOriginHelpers.kt`.
 *
 * Adding a new read path = new file + one line here.
 */
fun ModuleDefinitionBuilder.defineReadData(module: VeepooSDKModule) {
  defineBatteryRead(module)
  definePersonalInfo(module)
  defineDeviceFunctionsRead(module)
  defineSocialMsgRead(module)
  defineDeviceVersionRead(module)
  defineOriginRead(module)
  defineReadDeviceAllData(module)
  defineSleepRead(module)
  defineSportStepsRead(module)
  defineOriginDayRead(module)
  defineDaySummaryRead(module)
}
