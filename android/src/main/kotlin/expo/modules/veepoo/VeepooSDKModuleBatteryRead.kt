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

fun ModuleDefinitionBuilder.defineBatteryRead(module: VeepooSDKModule) {
  AsyncFunction("readBattery") { promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    
    manager.readBattery(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {}
      },
      object : IBatteryDataListener {
        override fun onDataChange(batteryData: BatteryData?) {
          if (batteryData != null) {
            val actualLevel = if (batteryData.isPercent) batteryData.batteryPercent else batteryData.batteryLevel
            val payload = mapOf(
              "level" to actualLevel,
              "percent" to batteryData.batteryPercent,
              "powerModel" to batteryData.powerModel,
              "state" to batteryData.state,
              "bat" to batteryData.bat.toInt(),
              "isPercent" to batteryData.isPercent,
              "isLowBattery" to batteryData.isLowBattery
            )
            module.sendEvent(BATTERY_DATA, mapOf(
              "deviceId" to (module.connectedDeviceId ?: ""),
              "data" to payload
            ))
            promise.resolve(payload)
          } else {
            promise.reject("READ_FAILED", "Battery data is null", null)
          }
        }
      }
    )
  }

}
