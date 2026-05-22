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

fun ModuleDefinitionBuilder.defineBloodGlucoseTest(module: VeepooSDKModule) {
  AsyncFunction("startBloodGlucoseTest") { promise: Promise ->
    if (!module.tryBeginRealtimeTest("bloodGlucose", promise)) {
      return@AsyncFunction
    }

    val manager = VPOperateManager.getInstance() ?: run {
      module.endRealtimeTest("bloodGlucose")
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    
    var lastBloodGlucose: Float = 0f
    var lastLevel: EBloodGlucoseRiskLevel? = null

    manager.startBloodGlucoseDetect(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code == Code.REQUEST_SUCCESS) {
            promise.resolve(null)
          } else {
            module.endRealtimeTest("bloodGlucose")
            promise.reject("START_FAILED", "Start blood glucose detect failed: $code", null)
          }
        }
      },
      object : IBloodGlucoseChangeListener {
        override fun onBloodGlucoseDetect(progress: Int, bloodGlucose: Float, level: EBloodGlucoseRiskLevel?) {
          lastBloodGlucose = bloodGlucose
          lastLevel = level
          
          val state = when {
            progress <= 0 -> "start"
            progress >= 100 -> "over"
            else -> "testing"
          }
          
          module.sendEvent(BLOOD_GLUCOSE_DATA, mapOf(
            "deviceId" to (module.connectedDeviceId ?: ""),
            "data" to mapOf(
              "glucose" to bloodGlucose.toDouble(),
              "progress" to progress,
              "level" to (level?.toString() ?: "UNKNOWN"),
              "state" to state,
              "rawState" to "progress:$progress",
              "isEnd" to (progress >= 100),
              "timestamp" to System.currentTimeMillis()
            )
          ))

          // 当进度到达 100% 时自动停止
          if (progress >= 100) {
            module.endRealtimeTest("bloodGlucose")
            manager.stopBloodGlucoseDetect(
              object : IBleWriteResponse {
                override fun onResponse(code: Int) {}
              },
              object : IBloodGlucoseChangeListener {
                override fun onBloodGlucoseDetect(progress: Int, bloodGlucose: Float, level: EBloodGlucoseRiskLevel?) {}
                override fun onBloodGlucoseStopDetect() {}
                override fun onDetectError(opt: Int, status: EBloodGlucoseStatus?) {}
                override fun onBloodGlucoseAdjustingSettingSuccess(isSuccess: Boolean, adjustingValue: Float) {}
                override fun onBloodGlucoseAdjustingSettingFailed() {}
                override fun onBloodGlucoseAdjustingReadSuccess(isOpen: Boolean, adjustingValue: Float) {}
                override fun onBloodGlucoseAdjustingReadFailed() {}
                override fun onBGMultipleAdjustingReadSuccess(isSuccess: Boolean, info1: MealInfo?, info2: MealInfo?, info3: MealInfo?) {}
                override fun onBGMultipleAdjustingReadFailed() {}
                override fun onBGMultipleAdjustingSettingSuccess() {}
                override fun onBGMultipleAdjustingSettingFailed() {}
              }
            )
          }
        }

        override fun onBloodGlucoseStopDetect() {
          module.endRealtimeTest("bloodGlucose")
          module.sendEvent(BLOOD_GLUCOSE_DATA, mapOf(
            "deviceId" to (module.connectedDeviceId ?: ""),
            "data" to mapOf(
              "glucose" to lastBloodGlucose.toDouble(),
              "progress" to 100,
              "level" to (lastLevel?.toString() ?: "UNKNOWN"),
              "state" to "over",
              "rawState" to "stop",
              "status" to "STOPPED",
              "isEnd" to true,
              "timestamp" to System.currentTimeMillis()
            )
          ))
        }

        override fun onDetectError(opt: Int, status: EBloodGlucoseStatus?) {
          module.endRealtimeTest("bloodGlucose")
          module.sendEvent(BLOOD_GLUCOSE_DATA, mapOf(
            "deviceId" to (module.connectedDeviceId ?: ""),
            "data" to mapOf(
              "glucose" to lastBloodGlucose.toDouble(),
              "progress" to 100,
              "level" to (lastLevel?.toString() ?: "UNKNOWN"),
              "error" to "Detect error: $status",
              "state" to "error",
              "rawState" to (status?.toString() ?: "UNKNOWN"),
              "status" to (status?.toString() ?: "UNKNOWN"),
              "isEnd" to true,
              "timestamp" to System.currentTimeMillis()
            )
          ))
        }
        
        override fun onBloodGlucoseAdjustingSettingSuccess(isSuccess: Boolean, adjustingValue: Float) {}
        override fun onBloodGlucoseAdjustingSettingFailed() {}
        override fun onBloodGlucoseAdjustingReadSuccess(isOpen: Boolean, adjustingValue: Float) {}
        override fun onBloodGlucoseAdjustingReadFailed() {}
        override fun onBGMultipleAdjustingReadSuccess(isSuccess: Boolean, info1: MealInfo?, info2: MealInfo?, info3: MealInfo?) {}
        override fun onBGMultipleAdjustingReadFailed() {}
        override fun onBGMultipleAdjustingSettingSuccess() {}
        override fun onBGMultipleAdjustingSettingFailed() {}
      }
    )
  }

  AsyncFunction("stopBloodGlucoseTest") { promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }

    module.endRealtimeTest("bloodGlucose")
    val manager = VPOperateManager.getInstance()
    manager?.stopBloodGlucoseDetect(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code == Code.REQUEST_SUCCESS) {
            promise.resolve(null)
          } else {
            promise.reject("STOP_FAILED", "Stop blood glucose detect failed: $code", null)
          }
        }
      },
      object : IBloodGlucoseChangeListener {
        override fun onBloodGlucoseDetect(progress: Int, bloodGlucose: Float, level: EBloodGlucoseRiskLevel?) {}
        override fun onBloodGlucoseStopDetect() {}
        override fun onDetectError(opt: Int, status: EBloodGlucoseStatus?) {}
        override fun onBloodGlucoseAdjustingSettingSuccess(isSuccess: Boolean, adjustingValue: Float) {}
        override fun onBloodGlucoseAdjustingSettingFailed() {}
        override fun onBloodGlucoseAdjustingReadSuccess(isOpen: Boolean, adjustingValue: Float) {}
        override fun onBloodGlucoseAdjustingReadFailed() {}
        override fun onBGMultipleAdjustingReadSuccess(isSuccess: Boolean, info1: MealInfo?, info2: MealInfo?, info3: MealInfo?) {}
        override fun onBGMultipleAdjustingReadFailed() {}
        override fun onBGMultipleAdjustingSettingSuccess() {}
        override fun onBGMultipleAdjustingSettingFailed() {}
      }
    )
  }
}
