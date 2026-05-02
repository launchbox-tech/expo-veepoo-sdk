package expo.modules.veepoo

import com.inuker.bluetooth.library.Code
import com.veepoo.protocol.VPOperateManager
import com.veepoo.protocol.listener.base.IBleWriteResponse
import com.veepoo.protocol.listener.data.*
import com.veepoo.protocol.model.datas.*
import com.veepoo.protocol.model.enums.DetectState
import com.veepoo.protocol.model.enums.EBPDetectModel
import com.veepoo.protocol.model.enums.EBloodGlucoseRiskLevel
import com.veepoo.protocol.model.enums.EBloodGlucoseStatus
import com.veepoo.protocol.shareprence.VpSpGetUtil
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

fun ModuleDefinitionBuilder.defineTests(module: VeepooSDKModule) {
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

  AsyncFunction("startStressTest") { promise: Promise ->
    if (!module.tryBeginRealtimeTest("stress", promise)) {
      return@AsyncFunction
    }

    module.isPressureMeasuring = true
    module.startPressureLoop(promise)
  }

  AsyncFunction("stopStressTest") { promise: Promise ->
    module.isPressureMeasuring = false
    module.endRealtimeTest("stress")
    promise.resolve(null)
  }

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

  AsyncFunction("startBodyCompositionTest") { promise: Promise ->
    if (!module.tryBeginRealtimeTest("bodyComposition", promise)) {
      return@AsyncFunction
    }
    val ctx = module.context
    if (!VpSpGetUtil.getVpSpVariInstance(ctx).isSupportBodyComponent) {
      module.endRealtimeTest("bodyComposition")
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support body composition", null)
      return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      module.endRealtimeTest("bodyComposition")
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }

    manager.startDetectBodyComponent(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code == Code.REQUEST_SUCCESS) {
            promise.resolve(null)
          } else {
            module.endRealtimeTest("bodyComposition")
            promise.reject("START_FAILED", "Start body composition failed: $code", null)
          }
        }
      },
      object : IBodyComponentDetectListener {
        override fun onDetecting(progress: Int, leadState: Int) {
          module.sendEvent(BODY_COMPOSITION_TEST_RESULT, mapOf(
            "deviceId" to (module.connectedDeviceId ?: ""),
            "result" to mapOf(
              "state" to "testing",
              "progress" to progress,
              "lead" to leadState,
              "rawState" to "detecting",
              "isEnd" to false
            )
          ))
        }

        override fun onDetectSuccess(bodyComponent: BodyComponent) {
          module.endRealtimeTest("bodyComposition")
          module.sendEvent(BODY_COMPOSITION_TEST_RESULT, mapOf(
            "deviceId" to (module.connectedDeviceId ?: ""),
            "result" to mapOf(
              "state" to "complete",
              "progress" to 100,
              "rawState" to "success",
              "isEnd" to true,
              "composition" to bodyComponentToCompositionMap(bodyComponent)
            )
          ))
        }

        override fun onDetectFailed(detectState: DetectState) {
          module.endRealtimeTest("bodyComposition")
          module.sendEvent(BODY_COMPOSITION_TEST_RESULT, mapOf(
            "deviceId" to (module.connectedDeviceId ?: ""),
            "result" to mapOf(
              "state" to detectStateToBodyCompLabel(detectState),
              "progress" to 0,
              "rawState" to detectState.name,
              "isEnd" to true
            )
          ))
        }

        override fun onDetectStop() {
          module.endRealtimeTest("bodyComposition")
          module.sendEvent(BODY_COMPOSITION_TEST_RESULT, mapOf(
            "deviceId" to (module.connectedDeviceId ?: ""),
            "result" to mapOf(
              "state" to "over",
              "progress" to 100,
              "rawState" to "stop",
              "isEnd" to true
            )
          ))
        }
      }
    )
  }

  AsyncFunction("stopBodyCompositionTest") { promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    module.endRealtimeTest("bodyComposition")
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    manager.stopDetectBodyComponent(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code == Code.REQUEST_SUCCESS) {
            promise.resolve(null)
          } else {
            promise.reject("STOP_FAILED", "Stop body composition failed: $code", null)
          }
        }
      }
    )
  }
}

private fun readBodyFloat(bean: BodyComponent, vararg names: String): Double? {
  val cls = bean.javaClass
  for (n in names) {
    try {
      val m = cls.getMethod(n)
      val v = m.invoke(bean) ?: continue
      return when (v) {
        is Float -> v.toDouble()
        is Double -> v
        is Int -> v.toDouble()
        else -> null
      }
    } catch (_: Exception) {
    }
  }
  return null
}

private fun bodyComponentToCompositionMap(b: BodyComponent): Map<String, Any?> {
  val out = mutableMapOf<String, Any?>()
  readBodyFloat(b, "getBMI", "getBmi")?.let { out["bmi"] = it }
  readBodyFloat(b, "getBodyFatRate", "getBodyFatPercentage")?.let { out["bodyFatPercentage"] = it }
  readBodyFloat(b, "getFatRate", "getFatMass")?.let { out["fatMassKg"] = it }
  readBodyFloat(b, "getFFM", "getFfm", "getLeanBodyMass")?.let { out["leanBodyMassKg"] = it }
  readBodyFloat(b, "getMuscleRate")?.let { out["muscleRate"] = it }
  readBodyFloat(b, "getMuscleMass")?.let { out["muscleMassKg"] = it }
  readBodyFloat(b, "getSubcutaneousFat")?.let { out["subcutaneousFatPercentage"] = it }
  readBodyFloat(b, "getBodyWater", "getBodyMoisture")?.let { out["bodyWaterPercentage"] = it }
  readBodyFloat(b, "getWaterContent")?.let { out["waterMassKg"] = it }
  readBodyFloat(b, "getSkeletalMuscleRate")?.let { out["skeletalMuscleRate"] = it }
  readBodyFloat(b, "getBoneMass")?.let { out["boneMassKg"] = it }
  readBodyFloat(b, "getProteinProportion", "getProportionOfProtein")?.let { out["proteinPercentage"] = it }
  readBodyFloat(b, "getProteinMass")?.let { out["proteinMassKg"] = it }
  readBodyFloat(b, "getBasalMetabolicRate")?.let { out["basalMetabolicRateKcal"] = it }
  try {
    val d = b.duration
    out["measurementDurationSeconds"] = d
  } catch (_: Exception) {
  }
  try {
    out["sourceIdType"] = b.idType
  } catch (_: Exception) {
  }
  try {
    val tb = b.timeBean
    if (tb != null) {
      out["measurementTime"] = mapOf("hour" to tb.hour, "minute" to tb.minute)
    }
  } catch (_: Exception) {
  }
  return out
}

private fun detectStateToBodyCompLabel(ds: DetectState): String {
  return when (ds) {
    DetectState.PROGRESS -> "testing"
    DetectState.SUCCESS -> "complete"
    DetectState.FAILED -> "error"
    DetectState.BUSY -> "deviceBusy"
    DetectState.LOW_POWER -> "lowPower"
    else -> "error"
  }
}
