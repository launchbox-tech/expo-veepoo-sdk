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

fun ModuleDefinitionBuilder.defineBloodPressureTest(module: VeepooSDKModule) {
  AsyncFunction("startBloodPressureTest") { promise: Promise ->
    if (!module.tryBeginRealtimeTest("bloodPressure", promise)) {
      return@AsyncFunction
    }

    val manager = VPOperateManager.getInstance() ?: run {
      module.endRealtimeTest("bloodPressure")
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    
    var lastSystolic: Int = 0
    var lastDiastolic: Int = 0
    var lastTestState: String = "start"
    var progressReached100: Boolean = false
    
    
    manager.startDetectBP(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code == Code.REQUEST_SUCCESS) {
            promise.resolve(null)
          } else {
            module.endRealtimeTest("bloodPressure")
            promise.reject("START_FAILED", "Start BP failed: $code", null)
          }
        }
      },
      object : IBPDetectDataListener {
        override fun onDataChange(bpData: BpData?) {
          if (bpData != null) {
            val rawStatus = bpData.status?.toString()
            val testState = normalizeTestState(rawStatus)
            lastSystolic = bpData.highPressure
            lastDiastolic = bpData.lowPressure
            lastTestState = testState
            
            val progress = bpData.progress
            
            // 发送事件， 进度在走的时候状态应该是 testing
            if (progress > 0 && progress < 100 && testState != "error" && testState != "notWear" && testState != "deviceBusy") {
              module.sendEvent(BLOOD_PRESSURE_TEST_RESULT, mapOf(
                "deviceId" to (module.connectedDeviceId ?: ""),
                "result" to mapOf(
                  "state" to "testing",
                  "rawState" to rawStatus,
                  "systolic" to lastSystolic,
                  "diastolic" to lastDiastolic,
                  "progress" to progress,
                  "isHaveProgress" to bpData.isHaveProgress
                )
              ))
            }

            // 当进度到达 100% 或出现错误状态时自动停止
            if (progress >= 100 || testState == "error" || testState == "notWear" || testState == "deviceBusy") {
              progressReached100 = true
              manager.stopDetectBP(
                object : IBleWriteResponse {
                  override fun onResponse(code: Int) {}
                },
                EBPDetectModel.DETECT_MODEL_PUBLIC
              )
              module.endRealtimeTest("bloodPressure")
              // 发送最终结果
              module.sendEvent(BLOOD_PRESSURE_TEST_RESULT, mapOf(
                "deviceId" to (module.connectedDeviceId ?: ""),
                "result" to mapOf(
                  "state" to if (testState == "error" || testState == "notWear" || testState == "deviceBusy") testState else "over",
                  "rawState" to rawStatus,
                  "systolic" to lastSystolic,
                  "diastolic" to lastDiastolic,
                  "progress" to 100,
                  "isHaveProgress" to bpData.isHaveProgress
                )
              ))
            }
          }
        }
      },
      EBPDetectModel.DETECT_MODEL_PUBLIC
    )
  }

  AsyncFunction("stopBloodPressureTest") { promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }

    module.endRealtimeTest("bloodPressure")
    val manager = VPOperateManager.getInstance()
    manager?.stopDetectBP(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code == Code.REQUEST_SUCCESS) {
            promise.resolve(null)
          } else {
            promise.reject("STOP_FAILED", "Stop BP failed: $code", null)
          }
        }
      },
      EBPDetectModel.DETECT_MODEL_PUBLIC
    )
  }
}
