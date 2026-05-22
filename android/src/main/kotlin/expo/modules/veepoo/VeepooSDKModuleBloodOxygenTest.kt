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

fun ModuleDefinitionBuilder.defineBloodOxygenTest(module: VeepooSDKModule) {
  AsyncFunction("startBloodOxygenTest") { promise: Promise ->
    if (!module.tryBeginRealtimeTest("bloodOxygen", promise)) {
      return@AsyncFunction
    }

    val manager = VPOperateManager.getInstance() ?: run {
      module.endRealtimeTest("bloodOxygen")
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }

    var lastSPO2Value: Int = 0
    var lastRateValue: Int = 0

    module.startSimulatedBloodOxygenProgress(
      onProgress = { progress ->
        module.sendEvent(BLOOD_OXYGEN_TEST_RESULT, mapOf(
          "deviceId" to (module.connectedDeviceId ?: ""),
            "result" to mapOf(
              "state" to "testing",
              "rawState" to "testing",
              "value" to lastSPO2Value,
              "rate" to lastRateValue,
              "progress" to progress
          )
        ))
      },
      onComplete = {
        manager.stopDetectSPO2H(
          object : IBleWriteResponse {
            override fun onResponse(code: Int) {}
          },
          object : ISpo2hDataListener {
            override fun onSpO2HADataChange(data: Spo2hData?) {}
          }
        )
        module.endRealtimeTest("bloodOxygen")
        module.sendEvent(BLOOD_OXYGEN_TEST_RESULT, mapOf(
          "deviceId" to (module.connectedDeviceId ?: ""),
            "result" to mapOf(
              "state" to "over",
              "rawState" to "over",
              "value" to lastSPO2Value,
              "rate" to lastRateValue,
              "progress" to 100
          )
        ))
      }
    )
    
    manager.startDetectSPO2H(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code == Code.REQUEST_SUCCESS) {
            promise.resolve(null)
          } else {
            module.stopSimulatedBloodOxygenProgress()
            module.endRealtimeTest("bloodOxygen")
            promise.reject("START_FAILED", "Start SPO2 failed: $code", null)
          }
        }
      },
      object : ISpo2hDataListener {
        override fun onSpO2HADataChange(spo2hData: Spo2hData?) {
          if (spo2hData != null && module.isBloodOxygenTesting) {
            val testState = normalizeTestState(spo2hData.deviceState?.toString())
            lastSPO2Value = spo2hData.value
            lastRateValue = spo2hData.rateValue

            if (testState == "error" || testState == "notWear" || testState == "deviceBusy") {
              module.stopSimulatedBloodOxygenProgress()
              manager.stopDetectSPO2H(
                object : IBleWriteResponse {
                  override fun onResponse(code: Int) {}
                },
                object : ISpo2hDataListener {
                  override fun onSpO2HADataChange(data: Spo2hData?) {}
                }
              )
              module.endRealtimeTest("bloodOxygen")
              module.sendEvent(BLOOD_OXYGEN_TEST_RESULT, mapOf(
                "deviceId" to (module.connectedDeviceId ?: ""),
                "result" to mapOf(
                  "state" to testState,
                  "rawState" to (spo2hData.deviceState?.toString() ?: ""),
                  "value" to spo2hData.value,
                  "rate" to spo2hData.rateValue,
                  "progress" to module.bloodOxygenTestProgress
                )
              ))
            }
          }
        }
      },
      object : ILightDataCallBack {
        override fun onGreenLightDataChange(data: IntArray?) {}
      }
    )
  }

  AsyncFunction("stopBloodOxygenTest") { promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }

    module.stopSimulatedBloodOxygenProgress()
    module.endRealtimeTest("bloodOxygen")
    
    val manager = VPOperateManager.getInstance()
    manager?.stopDetectSPO2H(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code == Code.REQUEST_SUCCESS) {
            promise.resolve(null)
          } else {
            promise.reject("STOP_FAILED", "Stop SpO2 failed: $code", null)
          }
        }
      },
      object : ISpo2hDataListener {
        override fun onSpO2HADataChange(data: Spo2hData?) {}
      }
    )
  }
}
