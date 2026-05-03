package expo.modules.veepoo

import android.util.Log
import com.veepoo.protocol.VPOperateManager
import com.veepoo.protocol.listener.base.IBleWriteResponse
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

fun ModuleDefinitionBuilder.defineGPS(module: VeepooSDKModule) {
  // AGPS: Android has no documented GPS data-transfer API.
  // The capability flag (data.agps) exists but no setter methods.
  AsyncFunction("setDeviceGPSAndTimezone") { data: Map<String, Any?>, promise: Promise ->
    promise.reject("CAPABILITY_UNSUPPORTED", "setDeviceGPSAndTimezone is not supported on Android", null)
  }
}
