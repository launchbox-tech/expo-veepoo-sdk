package expo.modules.veepoo

import com.inuker.bluetooth.library.Code
import com.veepoo.protocol.VPOperateManager
import com.veepoo.protocol.listener.base.IBleWriteResponse
import com.veepoo.protocol.listener.data.*
import com.veepoo.protocol.model.datas.*
import com.veepoo.protocol.model.enums.EBPDetectModel
import com.veepoo.protocol.model.enums.EBloodGlucoseRiskLevel
import com.veepoo.protocol.model.enums.EBloodGlucoseStatus
import com.veepoo.protocol.shareprence.VpSpGetUtil
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

fun ModuleDefinitionBuilder.defineTemperatureTest(module: VeepooSDKModule) {
  AsyncFunction("startTemperatureTest") { promise: Promise ->
    if (!module.tryBeginRealtimeTest("temperature", promise)) {
      return@AsyncFunction
    }

    val manager = VPOperateManager.getInstance() ?: run {
      module.endRealtimeTest("temperature")
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }

    manager.startDetectTempture(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code == Code.REQUEST_SUCCESS) {
            promise.resolve(null)
          } else {
            module.endRealtimeTest("temperature")
            promise.reject("START_FAILED", "Start Temp failed: $code", null)
          }
        }
      },
      object : ITemptureDetectDataListener {
        override fun onDataChange(data: TemptureDetectData?) {
            if (data != null) {
            val testState = when {
              data.oprate == 1 -> "over"
              data.progress <= 0 -> "start"
              data.progress >= 100 -> "over"
              else -> "testing"
            }
            val terminal = data.oprate == 1 || data.progress >= 100
            if (terminal) {
              module.endRealtimeTest("temperature")
            }
            module.sendEvent(TEMPERATURE_TEST_RESULT, mapOf(
              "deviceId" to (module.connectedDeviceId ?: ""),
              "result" to mapOf(
                "state" to testState,
                "rawState" to (data.deviceState?.toString() ?: data.oprate.toString()),
                "value" to data.tempture.toDouble(),
                "deviceState" to data.deviceState,
                "progress" to data.progress,
                "isEnd" to (data.oprate == 1 || data.progress >= 100)
              )
            ))
          }
        }
      }
    )
  }

  AsyncFunction("stopTemperatureTest") { promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }

    module.endRealtimeTest("temperature")
    val manager = VPOperateManager.getInstance()
    manager?.stopDetectTempture(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code == Code.REQUEST_SUCCESS) {
            promise.resolve(null)
          } else {
            promise.reject("STOP_FAILED", "Stop Tempture failed: $code", null)
          }
        }
      },
      object : ITemptureDetectDataListener {
        override fun onDataChange(data: TemptureDetectData?) {}
      }
    )
  }
}
