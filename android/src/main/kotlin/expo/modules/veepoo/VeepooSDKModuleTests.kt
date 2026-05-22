package expo.modules.veepoo

import expo.modules.kotlin.modules.ModuleDefinitionBuilder

/**
 * Realtime-test surface aggregator. Each modality lives in its own
 * `VeepooSDKModule<Modality>Test.kt` file with a `define<Modality>Test` extension
 * function on [ModuleDefinitionBuilder]; this file just composes them so the
 * module definition reads as one block.
 *
 * Adding a new modality = new file + one line here.
 */
fun ModuleDefinitionBuilder.defineTests(module: VeepooSDKModule) {
  defineHeartRateTest(module)
  defineBloodPressureTest(module)
  defineBloodOxygenTest(module)
  defineTemperatureTest(module)
  defineStressTest(module)
  defineBloodGlucoseTest(module)
  defineBodyCompositionTest(module)
}
