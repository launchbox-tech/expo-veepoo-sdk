package expo.modules.veepoo

import android.util.Log
import com.inuker.bluetooth.library.Code
import com.veepoo.protocol.VPOperateManager
import com.veepoo.protocol.listener.base.IBleWriteResponse
import com.veepoo.protocol.listener.data.IAlarm2DataListListener
import com.veepoo.protocol.listener.data.ITextAlarmDataListener
import com.veepoo.protocol.model.datas.AlarmData2
import com.veepoo.protocol.model.datas.TextAlarmData
import com.veepoo.protocol.model.enums.EMultiAlarmOprate
import com.veepoo.protocol.model.settings.Alarm2Setting
import com.veepoo.protocol.model.settings.TextAlarm2Setting
import com.veepoo.protocol.shareprence.VpSpGetUtil
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

private fun repeatDecimalToBinaryString(repeatStatus: String): String {
  val decimal = repeatStatus.toIntOrNull() ?: 0
  val binary = Integer.toBinaryString(decimal)
  return binary.padStart(7, '0').let { if (it.length > 7) it.takeLast(7) else it }
}

private fun isoWeekdaysToRepeatDecimal(days: List<*>): String {
  var decimal = 0
  for (day in days) {
    val d = (day as? Number)?.toInt() ?: continue
    if (d in 1..7) decimal = decimal or (1 shl (d - 1))
  }
  return decimal.toString()
}

private fun alarm2SettingToMap(alarm: Alarm2Setting): Map<String, Any> {
  val map = mutableMapOf<String, Any>(
    "id" to alarm.alarmId,
    "hour" to alarm.alarmHour,
    "minute" to alarm.alarmMinute,
    "enabled" to alarm.isOpen,
    "repeat" to repeatDecimalToBinaryString(alarm.repeatStatus ?: "0"),
    "scene" to alarm.scene
  )
  if (alarm is TextAlarm2Setting && !alarm.content.isNullOrEmpty()) {
    map["text"] = alarm.content
    map["type"] = "text"
  }
  return map
}

fun ModuleDefinitionBuilder.defineAlarms(module: VeepooSDKModule) {
  AsyncFunction("readAlarms") { promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }

    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }

    Log.d(TAG, "readAlarms: reading alarm list")

    var resolved = false
    manager.readAlarm2(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) Log.e(TAG, "readAlarms: write failed code=$code")
        }
      },
      object : IAlarm2DataListListener {
        override fun onAlarmDataChangeListListener(data: AlarmData2?) {
          if (resolved) return
          if (data == null) {
            resolved = true
            promise.reject("READ_FAILED", "Alarm data is null", null)
            return
          }
          when (data.oprate) {
            EMultiAlarmOprate.READ_SUCCESS,
            EMultiAlarmOprate.READ_SUCCESS_NULL,
            EMultiAlarmOprate.READ_SUCCESS_SAME_CRC,
            EMultiAlarmOprate.READ_SUCCESS_SAVE -> {
              resolved = true
              val alarms = data.alarm2SettingList?.map { alarm2SettingToMap(it) } ?: emptyList<Map<String, Any>>()
              Log.d(TAG, "readAlarms: success, ${alarms.size} alarms")
              module.sendEvent(ALARM_DATA, mapOf("deviceId" to (module.connectedDeviceId ?: ""), "alarms" to alarms))
              promise.resolve(alarms)
            }
            EMultiAlarmOprate.READ_FAIL -> {
              resolved = true
              Log.e(TAG, "readAlarms: READ_FAIL")
              promise.reject("READ_FAILED", "Read alarms failed", null)
            }
            else -> {} // intermediate states (ALARM_REPORT etc.)
          }
        }
      }
    )
  }

  AsyncFunction("setAlarm") { alarm: Map<String, Any?>, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }

    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }

    val alarmId = (alarm["id"] as? Number)?.toInt() ?: run {
      promise.reject("INVALID_ARGUMENT", "id is required", null)
      return@AsyncFunction
    }
    val hour = (alarm["hour"] as? Number)?.toInt() ?: 0
    val minute = (alarm["minute"] as? Number)?.toInt() ?: 0
    val enabled = alarm["enabled"] as? Boolean ?: true
    val scene = (alarm["scene"] as? Number)?.toInt() ?: 0
    val text = alarm["text"] as? String

    @Suppress("UNCHECKED_CAST")
    val repeatDays = alarm["repeat"] as? List<*> ?: emptyList<Any>()
    val repeatDecimal = isoWeekdaysToRepeatDecimal(repeatDays)

    val context = module.appContext.reactContext
    val supportsTextAlarm = context != null && VpSpGetUtil.getVpSpVariInstance(context).isSupportTextAlarm

    val writeResponse = object : IBleWriteResponse {
      override fun onResponse(code: Int) {
        if (code != Code.REQUEST_SUCCESS) Log.e(TAG, "setAlarm: write failed code=$code")
      }
    }

    if (!text.isNullOrEmpty() && supportsTextAlarm) {
      val textAlarm = TextAlarm2Setting().apply {
        this.alarmId = alarmId
        this.alarmHour = hour
        this.alarmMinute = minute
        this.isOpen = enabled
        this.scene = scene
        this.repeatStatus = repeatDecimal
        this.content = text
      }
      Log.d(TAG, "setAlarm: text alarm, id=$alarmId")
      var resolved = false
      manager.modifyTextAlarm(
        writeResponse,
        object : ITextAlarmDataListener {
          override fun onAlarmDataChangeListListener(data: TextAlarmData?) {
            if (resolved) return
            resolved = true
            val result = if (data?.oprate == EMultiAlarmOprate.SETTING_SUCCESS) "success" else "fail"
            Log.d(TAG, "setAlarm(text): $result, oprate=${data?.oprate}")
            promise.resolve(result)
          }
        },
        textAlarm
      )
    } else {
      val alarm2 = Alarm2Setting(alarmId, hour, minute, repeatDecimal, scene, "0000-00-00", enabled)
      Log.d(TAG, "setAlarm: alarm2, id=$alarmId")
      var resolved = false
      manager.modifyAlarm2(
        writeResponse,
        object : IAlarm2DataListListener {
          override fun onAlarmDataChangeListListener(data: AlarmData2?) {
            if (resolved) return
            if (data == null) { resolved = true; promise.resolve("fail"); return }
            when (data.oprate) {
              EMultiAlarmOprate.SETTING_SUCCESS -> { resolved = true; promise.resolve("success") }
              EMultiAlarmOprate.SETTING_FAIL -> { resolved = true; promise.resolve("fail") }
              else -> {}
            }
          }
        },
        alarm2
      )
    }
  }

  AsyncFunction("deleteAlarm") { alarmId: Int, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }

    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }

    val alarm2 = Alarm2Setting().apply { this.alarmId = alarmId }
    Log.d(TAG, "deleteAlarm: id=$alarmId")

    var resolved = false
    manager.deleteAlarm2(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) Log.e(TAG, "deleteAlarm: write failed code=$code")
        }
      },
      object : IAlarm2DataListListener {
        override fun onAlarmDataChangeListListener(data: AlarmData2?) {
          if (resolved) return
          if (data == null) { resolved = true; promise.resolve("fail"); return }
          when (data.oprate) {
            EMultiAlarmOprate.CLEAR_SUCCESS -> { resolved = true; promise.resolve("success") }
            EMultiAlarmOprate.CLEAR_FAIL -> { resolved = true; promise.resolve("fail") }
            else -> {}
          }
        }
      },
      alarm2
    )
  }
}
