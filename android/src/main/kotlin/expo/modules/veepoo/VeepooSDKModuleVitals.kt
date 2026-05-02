package expo.modules.veepoo

import com.inuker.bluetooth.library.Code
import com.veepoo.protocol.VPOperateManager
import com.veepoo.protocol.listener.base.IBleWriteResponse
import com.veepoo.protocol.listener.data.IECGDetectListener
import com.veepoo.protocol.model.datas.EcgDetectInfo
import com.veepoo.protocol.model.datas.EcgDetectResult
import com.veepoo.protocol.model.datas.EcgDetectState
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
    promise.reject(
      "CAPABILITY_UNSUPPORTED",
      "Breathing realtime test is not implemented on Android in this bridge build; use iOS or extend native with the vendor breathing API.",
      null
    )
  }

  AsyncFunction("stopBreathingTest") { promise: Promise ->
    promise.resolve(null)
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
