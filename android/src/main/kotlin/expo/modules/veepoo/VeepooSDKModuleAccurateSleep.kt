package expo.modules.veepoo

import android.os.Handler
import android.os.Looper
import android.util.Log
import com.veepoo.protocol.VPOperateManager
import com.veepoo.protocol.listener.base.IBleWriteResponse
import com.veepoo.protocol.listener.data.ISleepDataListener
import com.veepoo.protocol.model.datas.SleepData
import com.veepoo.protocol.model.datas.SleepPrecisionData
import com.veepoo.protocol.model.datas.TimeData
import com.veepoo.protocol.model.enums.Code
import com.veepoo.protocol.shareprence.VpSpGetUtil
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.ModuleDefinitionBuilder
import java.util.concurrent.atomic.AtomicBoolean

fun ModuleDefinitionBuilder.defineAccurateSleep(module: VeepooSDKModule) {

  AsyncFunction("readAccurateSleepData") { date: String?, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    val vpUtil = VpSpGetUtil.getVpSpVariInstance(module.context)
    if (!vpUtil.isSupportPreciseSleep()) {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support precise sleep", null)
      return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }

    val resolved = AtomicBoolean(false)
    val uiHandler = Handler(Looper.getMainLooper())
    val timeoutTask = Runnable {
      if (resolved.compareAndSet(false, true)) promise.resolve(null)
    }
    uiHandler.postDelayed(timeoutTask, 20_000)

    manager.readSleepData(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) {
            uiHandler.removeCallbacks(timeoutTask)
            if (resolved.compareAndSet(false, true)) promise.resolve(null)
          }
        }
      },
      object : ISleepDataListener {
        override fun onSleepDataChange(day: String?, sleepData: SleepData?) {
          val precise = sleepData as? SleepPrecisionData ?: return
          val dateStr = day ?: precise.Date ?: ""
          val session = buildSession(precise)
          module.sendEvent(ACCURATE_SLEEP_DATA, mapOf(
            "deviceId" to (module.connectedDeviceId ?: ""),
            "date" to dateStr,
            "data" to session
          ))
        }

        override fun onSleepProgress(progress: Float) {}
        override fun onSleepProgressDetail(day: String?, index: Int) {}
        override fun onReadSleepComplete() {
          uiHandler.removeCallbacks(timeoutTask)
          if (resolved.compareAndSet(false, true)) promise.resolve(null)
        }
      },
      0
    )
  }
}

private fun buildSession(p: SleepPrecisionData): Map<String, Any> = mapOf(
  "sleepTime" to formatTimeData(p.sleepDown),
  "wakeTime" to formatTimeData(p.sleepUp),
  "deepDuration" to p.deepSleepTime,
  "lightDuration" to p.lowSleepTime,
  "remDuration" to p.getOtherDuration(),
  "getUpDuration" to p.getGetUpDuration(),
  "sleepDuration" to p.allSleepTime,
  "getUpTimes" to p.wakeCount,
  "sleepQuality" to p.sleepQulity,
  "insomniaScore" to p.getInsomniaScore(),
  "insomniaTimes" to p.getInsomniaTimes(),
  "fallAsleepScore" to p.getFallAsleepScore(),
  "sleepEfficiencyScore" to p.getSleepEfficiencyScore(),
  "curve" to parseSleepLineCurve(p.sleepLine)
)

private fun formatTimeData(t: TimeData?): String {
  if (t == null) return ""
  return String.format("%04d-%02d-%02d %02d:%02d:%02d", t.year, t.month, t.day, t.hour, t.minute, t.second)
}

private val SLEEP_STATES = listOf("deep", "light", "rem", "insomnia", "awake")

private fun parseSleepLineCurve(sleepLine: String?): List<Map<String, Any>> {
  if (sleepLine.isNullOrEmpty()) return emptyList()
  val result = mutableListOf<Map<String, Any>>()
  var minuteIndex = 0
  var i = 0
  while (i + 3 < sleepLine.length) {
    val word = sleepLine.substring(i, i + 4).toIntOrNull(16) ?: break
    val stateIdx = (word shr 13) and 0x7
    if (stateIdx < SLEEP_STATES.size) {
      result.add(mapOf("index" to minuteIndex, "state" to SLEEP_STATES[stateIdx]))
    }
    minuteIndex++
    i += 4
  }
  return result
}
