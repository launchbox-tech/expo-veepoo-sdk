package expo.modules.veepoo

import android.util.Log
import com.inuker.bluetooth.library.Code
import com.veepoo.protocol.VPOperateManager
import com.veepoo.protocol.listener.base.IBleWriteResponse
import com.veepoo.protocol.listener.data.IHeartWaringDataListener
import com.veepoo.protocol.model.datas.HeartWaringData
import com.veepoo.protocol.model.settings.HeartWaringSetting
import com.veepoo.protocol.model.enums.EHeartWaringStatus
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

private fun heartWaringDataToMap(data: HeartWaringData): Map<String, Any> {
  return mapOf(
    "enabled" to data.isOpen,
    "highThreshold" to data.heartHigh,
    "lowThreshold" to data.heartLow
  )
}

fun ModuleDefinitionBuilder.defineHeartRateAlarm(module: VeepooSDKModule) {
  AsyncFunction("readHeartRateAlarm") { promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }

    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }

    Log.d(TAG, "readHeartRateAlarm: start")
    var resolved = false

    manager.readHeartWarning(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) Log.e(TAG, "readHeartRateAlarm: write response code=$code")
        }
      },
      object : IHeartWaringDataListener {
        override fun onHeartWaringDataChange(heartWaringData: HeartWaringData?) {
          if (resolved) return
          if (heartWaringData == null) {
            resolved = true
            promise.reject("READ_FAILED", "Heart rate alarm data is null", null)
            return
          }
          when (heartWaringData.status) {
            EHeartWaringStatus.READ_SUCCESS -> {
              resolved = true
              val map = heartWaringDataToMap(heartWaringData)
              Log.d(TAG, "readHeartRateAlarm: success $map")
              promise.resolve(map)
            }
            EHeartWaringStatus.READ_FAIL, EHeartWaringStatus.UNSUPPORT -> {
              resolved = true
              promise.reject("READ_FAILED", "Read heart rate alarm failed or unsupported", null)
            }
            else -> {
              // ignore intermediate / unexpected status values
            }
          }
        }
      }
    )
  }

  AsyncFunction("setHeartRateAlarm") { alarm: Map<String, Any?>, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }

    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }

    val high = (alarm["highThreshold"] as? Number)?.toInt() ?: run {
      promise.reject("INVALID_ARGUMENT", "highThreshold is required", null)
      return@AsyncFunction
    }
    val low = (alarm["lowThreshold"] as? Number)?.toInt() ?: run {
      promise.reject("INVALID_ARGUMENT", "lowThreshold is required", null)
      return@AsyncFunction
    }
    val enabled = alarm["enabled"] as? Boolean ?: true

    val setting = HeartWaringSetting(high, low, enabled)
    Log.d(TAG, "setHeartRateAlarm: high=$high low=$low enabled=$enabled")

    var resolved = false
    manager.settingHeartWarning(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) Log.e(TAG, "setHeartRateAlarm: write failed code=$code")
        }
      },
      object : IHeartWaringDataListener {
        override fun onHeartWaringDataChange(heartWaringData: HeartWaringData?) {
          if (resolved) return
          if (heartWaringData == null) {
            resolved = true
            promise.resolve("fail")
            return
          }
          val st = heartWaringData.status
          when (st) {
            EHeartWaringStatus.OPEN_SUCCESS, EHeartWaringStatus.CLOSE_SUCCESS -> {
              resolved = true
              promise.resolve("success")
            }
            EHeartWaringStatus.OPEN_FAIL, EHeartWaringStatus.CLOSE_FAIL, EHeartWaringStatus.UNSUPPORT -> {
              resolved = true
              promise.resolve("fail")
            }
            else -> {}
          }
        }
      },
      setting
    )
  }
}
