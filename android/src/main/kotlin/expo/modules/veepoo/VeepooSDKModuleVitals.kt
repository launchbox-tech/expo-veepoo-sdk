package expo.modules.veepoo

import com.inuker.bluetooth.library.Code
import com.veepoo.protocol.VPOperateManager
import com.veepoo.protocol.listener.base.IBleWriteResponse
import com.veepoo.protocol.listener.data.IBreathDataListener
import com.veepoo.protocol.listener.data.IECGDetectListener
import com.veepoo.protocol.model.datas.BreathData
import com.veepoo.protocol.model.datas.EcgDetectInfo
import com.veepoo.protocol.model.datas.EcgDetectResult
import com.veepoo.protocol.model.datas.EcgDetectState
import com.veepoo.protocol.model.enums.EDeviceStatus
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

fun ModuleDefinitionBuilder.defineVitals(module: VeepooSDKModule) {
  AsyncFunction("startHrvTest") { promise: Promise ->
    if (!module.tryBeginRealtimeTest("hrv", promise)) {
      return@AsyncFunction
    }
    module.isHrvTesting = true
    module.startHrvManualReadLoop(promise)
  }

  AsyncFunction("stopHrvTest") { promise: Promise ->
    module.isHrvTesting = false
    module.endRealtimeTest("hrv")
    promise.resolve(null)
  }

  AsyncFunction("startFatigueTest") { promise: Promise ->
    if (!module.tryBeginRealtimeTest("fatigue", promise)) {
      return@AsyncFunction
    }
    module.isFatigueTesting = true
    module.startFatigueManualReadLoop(promise)
  }

  AsyncFunction("stopFatigueTest") { promise: Promise ->
    module.isFatigueTesting = false
    module.endRealtimeTest("fatigue")
    promise.resolve(null)
  }

  AsyncFunction("startEcgTest") { options: Map<String, Any?>?, promise: Promise ->
    if (!module.tryBeginRealtimeTest("ecg", promise)) {
      return@AsyncFunction
    }

    val includeWaveform = (options?.get("includeWaveform") as? Boolean) ?: false
    module.ecgWantWaveform = includeWaveform

    val manager = VPOperateManager.getInstance() ?: run {
      module.endRealtimeTest("ecg")
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }

    val listener = object : IECGDetectListener {
      override fun onEcgDetectInfoChange(ecgDetectInfo: EcgDetectInfo?) {
        // optional: could emit sampling metadata later
      }

      override fun onEcgDetectStateChange(ecgDetectState: EcgDetectState?) {
        if (ecgDetectState == null) return
        val progress = probeInt(ecgDetectState, "progress", "testProgress")
        val hr = probeInt(ecgDetectState, "hr1", "hr2", "heartRate")
        val hrv = probeInt(ecgDetectState, "hrv")
        module.sendEvent(
          ECG_TEST_RESULT,
          mapOf(
            "deviceId" to (module.connectedDeviceId ?: ""),
            "result" to mapOf(
              "state" to "testing",
              "rawState" to ecgDetectState.toString(),
              "progress" to progress,
              "heartRate" to hr,
              "hrv" to hrv
            )
          )
        )

        val dataType = probeInt(ecgDetectState, "dataType")
        if (dataType == 3 || dataType == 4 || progress >= 100) {
          finishAndroidEcg(module, manager, includeWaveform, this)
        }
      }

      override fun onEcgDetectResultChange(ecgDetectResult: EcgDetectResult?) {
        if (ecgDetectResult == null) return
        module.sendEvent(
          ECG_TEST_RESULT,
          mapOf(
            "deviceId" to (module.connectedDeviceId ?: ""),
            "result" to mapOf(
              "state" to "over",
              "rawState" to "result",
              "progress" to 100,
              "heartRate" to probeInt(ecgDetectResult, "heartRate", "hr"),
              "hrv" to probeInt(ecgDetectResult, "hrv")
            )
          )
        )
        finishAndroidEcg(module, manager, includeWaveform, this)
      }

      override fun onEcgADCChange(data: IntArray?) {
        if (!module.ecgWantWaveform || data == null) return
        module.sendEvent(
          ECG_TEST_RESULT,
          mapOf(
            "deviceId" to (module.connectedDeviceId ?: ""),
            "result" to mapOf(
              "state" to "testing",
              "rawState" to "waveform",
              "waveform" to data.toList()
            )
          )
        )
      }
    }

    module.ecgDetectListener = listener

    manager.startDetectECG(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code == Code.REQUEST_SUCCESS) {
            promise.resolve(null)
          } else {
            module.ecgDetectListener = null
            module.endRealtimeTest("ecg")
            promise.reject("START_FAILED", "Start ECG failed: $code", null)
          }
        }
      },
      includeWaveform,
      listener
    )
  }

  AsyncFunction("stopEcgTest") { promise: Promise ->
    val manager = VPOperateManager.getInstance()
    val listener = module.ecgDetectListener
    val wf = module.ecgWantWaveform
    module.ecgDetectListener = null
    module.endRealtimeTest("ecg")
    if (manager != null && listener != null) {
      manager.stopDetectECG(
        object : IBleWriteResponse {
          override fun onResponse(code: Int) {
            if (code == Code.REQUEST_SUCCESS) {
              promise.resolve(null)
            } else {
              promise.reject("STOP_FAILED", "Stop ECG failed: $code", null)
            }
          }
        },
        wf,
        listener
      )
    } else {
      promise.resolve(null)
    }
  }

  AsyncFunction("startBreathingTest") { promise: Promise ->
    if (!module.tryBeginRealtimeTest("breathing", promise)) {
      return@AsyncFunction
    }

    val manager = VPOperateManager.getInstance() ?: run {
      module.endRealtimeTest("breathing")
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }

    val listener = object : IBreathDataListener {
      override fun onDataChange(data: BreathData) {
        val rawDevice = data.deviceStateEnum?.name ?: data.deviceState.toString()
        val stateLabel = mapBreathingDeviceState(data)
        val progress = data.progressValue.coerceIn(0, 100)
        val rate = data.value

        module.sendEvent(
          BREATHING_TEST_RESULT,
          mapOf(
            "deviceId" to (module.connectedDeviceId ?: ""),
            "result" to mapOf(
              "state" to stateLabel,
              "rawState" to rawDevice,
              "progress" to progress,
              "rate" to rate
            )
          )
        )

        if (isBreathingDeviceTerminal(data)) {
          module.breathDataListener = null
          module.endRealtimeTest("breathing")
          manager.stopDetectBreath(
            object : IBleWriteResponse {
              override fun onResponse(code: Int) {}
            },
            this
          )
        }
      }
    }
    module.breathDataListener = listener

    manager.startDetectBreath(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code == Code.REQUEST_SUCCESS) {
            promise.resolve(null)
          } else {
            module.breathDataListener = null
            module.endRealtimeTest("breathing")
            promise.reject("START_FAILED", "Start breath detect failed: $code", null)
          }
        }
      },
      listener
    )
  }

  AsyncFunction("stopBreathingTest") { promise: Promise ->
    val manager = VPOperateManager.getInstance()
    val listener = module.breathDataListener
    module.breathDataListener = null
    module.endRealtimeTest("breathing")
    if (manager != null && listener != null) {
      manager.stopDetectBreath(
        object : IBleWriteResponse {
          override fun onResponse(code: Int) {
            if (code == Code.REQUEST_SUCCESS) {
              promise.resolve(null)
            } else {
              promise.reject("STOP_FAILED", "Stop breath detect failed: $code", null)
            }
          }
        },
        listener
      )
    } else {
      promise.resolve(null)
    }
  }
}

private fun mapBreathingDeviceState(data: BreathData): String {
  val ds = data.deviceStateEnum
  if (ds == EDeviceStatus.FREE) {
    return if (data.progressValue > 0) "testing" else "start"
  }
  val name = ds?.name ?: ""
  return normalizeTestState(name)
}

private fun isBreathingDeviceTerminal(data: BreathData): Boolean {
  val ds = data.deviceStateEnum ?: return data.progressValue >= 100
  return when (ds) {
    EDeviceStatus.FINISH -> true
    EDeviceStatus.UNPASS_WEAR -> true
    EDeviceStatus.BUSY -> true
    EDeviceStatus.CHARGING -> true
    EDeviceStatus.CHARG_LOW -> true
    EDeviceStatus.KEEP_QUIT -> true
    else -> data.progressValue >= 100
  }
}

private fun probeInt(target: Any?, vararg names: String): Int {
  if (target == null) return 0
  for (name in names) {
    try {
      val f = target.javaClass.getDeclaredField(name)
      f.isAccessible = true
      when (val v = f.get(target)) {
        is Int -> return v
        is Float -> return v.toInt()
        is Double -> return v.toInt()
      }
    } catch (_: Exception) {
    }
  }
  return 0
}

private fun finishAndroidEcg(
  module: VeepooSDKModule,
  manager: VPOperateManager,
  includeWaveform: Boolean,
  listener: IECGDetectListener
) {
  if (module.ecgDetectListener == null) return
  module.ecgDetectListener = null
  module.endRealtimeTest("ecg")
  manager.stopDetectECG(
    object : IBleWriteResponse {
      override fun onResponse(code: Int) {}
    },
    includeWaveform,
    listener
  )
}
