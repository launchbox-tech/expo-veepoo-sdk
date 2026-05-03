package expo.modules.veepoo

import android.util.Log
import com.inuker.bluetooth.library.Code
import com.veepoo.protocol.VPOperateManager
import com.veepoo.protocol.listener.IHealthRemindListener
import com.veepoo.protocol.listener.base.IBleWriteResponse
import com.veepoo.protocol.model.datas.HealthRemind
import com.veepoo.protocol.model.datas.TimeData
import com.veepoo.protocol.model.enums.HealthRemindType
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

private fun jsTypeToHealthRemindType(type: String): HealthRemindType = when (type) {
  "sedentary" -> HealthRemindType.SEDENTARY
  "drinkWater" -> HealthRemindType.DRINK_WATER
  "lookFarAway" -> HealthRemindType.OVERLOOK
  "sport" -> HealthRemindType.SPORTS
  "takeMedicine" -> HealthRemindType.TAKE_MEDICINE
  "read" -> HealthRemindType.READING
  "trip" -> HealthRemindType.GOING_OUT
  "washHands" -> HealthRemindType.WASH
  else -> HealthRemindType.ALL
}

private fun healthRemindTypeToJs(type: HealthRemindType): String = when (type) {
  HealthRemindType.SEDENTARY -> "sedentary"
  HealthRemindType.DRINK_WATER -> "drinkWater"
  HealthRemindType.OVERLOOK -> "lookFarAway"
  HealthRemindType.SPORTS -> "sport"
  HealthRemindType.TAKE_MEDICINE -> "takeMedicine"
  HealthRemindType.READING -> "read"
  HealthRemindType.GOING_OUT -> "trip"
  HealthRemindType.WASH -> "washHands"
  else -> "sedentary"
}

private fun healthRemindToMap(h: HealthRemind): Map<String, Any> {
  val st = h.startTime
  val et = h.endTime
  return mapOf(
    "type" to healthRemindTypeToJs(h.remindType),
    "startHour" to (st?.hour ?: 0),
    "startMinute" to (st?.minute ?: 0),
    "endHour" to (et?.hour ?: 0),
    "endMinute" to (et?.minute ?: 0),
    "interval" to h.interval,
    "enabled" to h.status
  )
}

fun ModuleDefinitionBuilder.defineHealthReminders(module: VeepooSDKModule) {
  AsyncFunction("readHealthReminder") { type: String, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    val remindType = jsTypeToHealthRemindType(type)
    var done = false
    manager.readHealthRemind(
      remindType,
      object : IHealthRemindListener {
        override fun functionNotSupport() {
          if (done) return
          done = true
          promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support health reminders", null)
        }
        override fun onHealthRemindRead(healthRemind: HealthRemind) {
          if (done) return
          done = true
          val result = healthRemindToMap(healthRemind)
          module.sendEvent(HEALTH_REMIND_DATA, mapOf(
            "deviceId" to (module.connectedDeviceId ?: ""),
            "data" to result
          ))
          promise.resolve(result)
        }
        override fun onHealthRemindReadFailed() {
          if (done) return
          done = true
          promise.reject("OPERATION_FAILED", "Read health reminder failed", null)
        }
        override fun onHealthRemindReport(healthRemind: HealthRemind) {
          module.sendEvent(HEALTH_REMIND_DATA, mapOf(
            "deviceId" to (module.connectedDeviceId ?: ""),
            "data" to healthRemindToMap(healthRemind)
          ))
        }
        override fun onHealthRemindReportFailed() {
          Log.w(TAG, "onHealthRemindReportFailed")
        }
        override fun onHealthRemindSettingSuccess(healthRemind: HealthRemind) {}
        override fun onHealthRemindSettingFailed(healthRemindType: HealthRemindType) {}
      },
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) {
            Log.e(TAG, "readHealthReminder: write code=$code")
          }
        }
      }
    )
  }

  AsyncFunction("setHealthReminder") { reminder: Map<String, Any?>, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    val typeStr = reminder["type"] as? String ?: "sedentary"
    val remindType = jsTypeToHealthRemindType(typeStr)
    val sh = (reminder["startHour"] as? Number)?.toInt() ?: 8
    val sm = (reminder["startMinute"] as? Number)?.toInt() ?: 0
    val eh = (reminder["endHour"] as? Number)?.toInt() ?: 20
    val em = (reminder["endMinute"] as? Number)?.toInt() ?: 0
    val interval = (reminder["interval"] as? Number)?.toInt() ?: 60
    val enabled = reminder["enabled"] as? Boolean ?: true
    val healthRemind = HealthRemind(remindType, TimeData(sh, sm), TimeData(eh, em), interval, enabled)
    var done = false
    manager.settingHealthRemind(
      healthRemind,
      object : IHealthRemindListener {
        override fun functionNotSupport() {
          if (done) return
          done = true
          promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support health reminders", null)
        }
        override fun onHealthRemindRead(healthRemind: HealthRemind) {}
        override fun onHealthRemindReadFailed() {}
        override fun onHealthRemindReport(healthRemind: HealthRemind) {
          module.sendEvent(HEALTH_REMIND_DATA, mapOf(
            "deviceId" to (module.connectedDeviceId ?: ""),
            "data" to healthRemindToMap(healthRemind)
          ))
        }
        override fun onHealthRemindReportFailed() {}
        override fun onHealthRemindSettingSuccess(healthRemind: HealthRemind) {
          if (done) return
          done = true
          promise.resolve(null)
        }
        override fun onHealthRemindSettingFailed(healthRemindType: HealthRemindType) {
          if (done) return
          done = true
          promise.reject("OPERATION_FAILED", "Set health reminder failed for type: $healthRemindType", null)
        }
      },
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) {
            Log.e(TAG, "setHealthReminder: write code=$code")
          }
        }
      }
    )
  }
}
