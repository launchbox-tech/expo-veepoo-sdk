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

fun ModuleDefinitionBuilder.defineHeartRateTest(module: VeepooSDKModule) {
  AsyncFunction("startHeartRateTest") { promise: Promise ->
    if (!module.tryBeginRealtimeTest("heartRate", promise)) {
      return@AsyncFunction
    }

    val manager = VPOperateManager.getInstance() ?: run {
      module.endRealtimeTest("heartRate")
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }

    var lastHeartValue: Int = 0

    module.startSimulatedHeartRateProgress(
      onProgress = { progress ->
        module.sendEvent(HEART_RATE_TEST_RESULT, mapOf(
          "deviceId" to (module.connectedDeviceId ?: ""),
          "result" to mapOf(
            "state" to "testing",
            "rawState" to "testing",
            "value" to lastHeartValue,
            "progress" to progress
          )
        ))
      },
      onComplete = {
        manager.stopDetectHeart(object : IBleWriteResponse {
          override fun onResponse(code: Int) {}
        })
        module.endRealtimeTest("heartRate")
        module.sendEvent(HEART_RATE_TEST_RESULT, mapOf(
          "deviceId" to (module.connectedDeviceId ?: ""),
          "result" to mapOf(
            "state" to "over",
            "rawState" to "over",
            "value" to lastHeartValue,
            "progress" to 100
          )
        ))
      }
    )
    
    manager.startDetectHeart(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code == Code.REQUEST_SUCCESS) {
            promise.resolve(null)
          } else {
            module.stopSimulatedHeartRateProgress()
            module.endRealtimeTest("heartRate")
            promise.reject("START_FAILED", "Start detect heart failed: $code", null)
          }
        }
      },
      object : IHeartDataListener {
        override fun onDataChange(heartData: HeartData?) {
          if (heartData != null && module.isHeartRateTesting) {
            val rawStatus = heartData.heartStatus?.toString() ?: ""
            val testState = normalizeTestState(rawStatus)
            lastHeartValue = heartData.data

            if (testState == "error" || testState == "notWear" || testState == "deviceBusy") {
              module.stopSimulatedHeartRateProgress()
              manager.stopDetectHeart(object : IBleWriteResponse {
                override fun onResponse(code: Int) {}
              })
              module.endRealtimeTest("heartRate")
              module.sendEvent(HEART_RATE_TEST_RESULT, mapOf(
                "deviceId" to (module.connectedDeviceId ?: ""),
                "result" to mapOf(
                  "state" to testState,
                  "rawState" to rawStatus,
                  "value" to heartData.data,
                  "progress" to module.heartRateTestProgress
                )
              ))
            }
          }
        }
      }
    )
  }

  AsyncFunction("stopHeartRateTest") { promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }

    module.stopSimulatedHeartRateProgress()
    module.endRealtimeTest("heartRate")
    
    val manager = VPOperateManager.getInstance()
    manager?.stopDetectHeart(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code == Code.REQUEST_SUCCESS) {
            promise.resolve(null)
          } else {
            promise.reject("STOP_FAILED", "Stop detect heart failed: $code", null)
          }
        }
      }
    )
  }
}
