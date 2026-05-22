package expo.modules.veepoo

import android.util.Log
import com.inuker.bluetooth.library.Code
import com.veepoo.protocol.VPOperateManager
import com.veepoo.protocol.listener.base.IBleWriteResponse
import com.veepoo.protocol.listener.data.*
import com.veepoo.protocol.model.datas.*
import com.veepoo.protocol.model.enums.EOprateStauts
import com.veepoo.protocol.model.enums.ESex
import com.veepoo.protocol.model.settings.*
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

fun ModuleDefinitionBuilder.defineDeviceVersionRead(module: VeepooSDKModule) {
  AsyncFunction("readDeviceVersion") { promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    
    Log.d(TAG, "readDeviceVersion: reading device version info")
    
    val result = mapOf(
      "hardwareVersion" to module.cachedDeviceVersion,
      "firmwareVersion" to "",
      "softwareVersion" to "",
      "deviceNumber" to module.cachedDeviceNumber,
      "newVersion" to "",
      "description" to ""
    )
    
    module.sendEvent(DEVICE_VERSION, mapOf(
      "deviceId" to (module.connectedDeviceId ?: ""),
      "version" to result
    ))
    
    Log.d(TAG, "readDeviceVersion: $result")
    promise.resolve(result)
  }

}
