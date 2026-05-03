package expo.modules.veepoo

import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

// iOS-only feature — both methods reject on Android (no vendor Android path documented).
fun ModuleDefinitionBuilder.defineApneaRemind(module: VeepooSDKModule) {
  AsyncFunction("readApneaRemindSettings") { promise: Promise ->
    promise.reject("CAPABILITY_UNSUPPORTED", "readApneaRemindSettings is not supported on Android", null)
  }

  AsyncFunction("setApneaRemindSettings") { _: Map<String, Any?>, promise: Promise ->
    promise.reject("CAPABILITY_UNSUPPORTED", "setApneaRemindSettings is not supported on Android", null)
  }
}
