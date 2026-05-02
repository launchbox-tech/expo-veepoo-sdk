package expo.modules.veepoo

import android.util.Log
import com.inuker.bluetooth.library.Code
import com.veepoo.protocol.VPOperateManager
import com.veepoo.protocol.listener.base.IBleWriteResponse
import com.veepoo.protocol.listener.data.ILongSeatDataListener
import com.veepoo.protocol.model.datas.LongSeatData
import com.veepoo.protocol.model.enums.ELongSeatStatus
import com.veepoo.protocol.model.settings.LongSeatSetting
import com.veepoo.protocol.shareprence.VpSpGetUtil
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

private fun longSeatDataToMap(d: LongSeatData): Map<String, Any> {
  return mapOf(
    "startHour" to d.startHour,
    "startMinute" to d.startMinute,
    "endHour" to d.endHour,
    "endMinute" to d.endMinute,
    "thresholdMinutes" to d.threshold,
    "enabled" to d.isOpen
  )
}

private fun mapToLongSeatSetting(m: Map<String, Any?>): LongSeatSetting {
  val sh = (m["startHour"] as? Number)?.toInt() ?: 9
  val sm = (m["startMinute"] as? Number)?.toInt() ?: 0
  val eh = (m["endHour"] as? Number)?.toInt() ?: 18
  val em = (m["endMinute"] as? Number)?.toInt() ?: 0
  val th = (m["thresholdMinutes"] as? Number)?.toInt() ?: 60
  val open = m["enabled"] as? Boolean ?: true
  return LongSeatSetting(sh, sm, eh, em, th, open)
}

fun ModuleDefinitionBuilder.defineSedentary(module: VeepooSDKModule) {
  AsyncFunction("readSedentaryReminder") { promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    val ctx = module.appContext.reactContext ?: run {
      promise.reject("CONTEXT_ERROR", "Cannot get app context", null)
      return@AsyncFunction
    }
    if (!VpSpGetUtil.getVpSpVariInstance(ctx).isSupportLongseat) {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support sedentary reminder", null)
      return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    var done = false
    manager.readLongSeat(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) {
            Log.e(TAG, "readSedentaryReminder: write code=$code")
          }
        }
      },
      object : ILongSeatDataListener {
        override fun onLongSeatDataChange(longSeat: LongSeatData) {
          if (done) return
          when (longSeat.status) {
            ELongSeatStatus.READ_SUCCESS -> {
              done = true
              promise.resolve(longSeatDataToMap(longSeat))
            }
            ELongSeatStatus.READ_FAIL -> {
              done = true
              promise.reject("READ_FAILED", "Read sedentary reminder failed", null)
            }
            ELongSeatStatus.UNSUPPORT -> {
              done = true
              promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support sedentary reminder", null)
            }
            else -> {}
          }
        }
      }
    )
  }

  AsyncFunction("setSedentaryReminder") { settings: Map<String, Any?>, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    val ctx = module.appContext.reactContext ?: run {
      promise.reject("CONTEXT_ERROR", "Cannot get app context", null)
      return@AsyncFunction
    }
    if (!VpSpGetUtil.getVpSpVariInstance(ctx).isSupportLongseat) {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support sedentary reminder", null)
      return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    val setting = mapToLongSeatSetting(settings)
    val wantOpen = setting.isOpen
    var done = false
    manager.settingLongSeat(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) {
            Log.e(TAG, "setSedentaryReminder: write code=$code")
          }
        }
      },
      setting,
      object : ILongSeatDataListener {
        override fun onLongSeatDataChange(longSeat: LongSeatData) {
          if (done) return
          val st = longSeat.status
          val ok =
            (wantOpen && st == ELongSeatStatus.OPEN_SUCCESS) ||
              (!wantOpen && st == ELongSeatStatus.CLOSE_SUCCESS)
          val fail =
            (wantOpen && st == ELongSeatStatus.OPEN_FAIL) ||
              (!wantOpen && st == ELongSeatStatus.CLOSE_FAIL)
          when {
            ok -> {
              done = true
              promise.resolve(null)
            }
            fail -> {
              done = true
              promise.reject("SET_FAILED", "Set sedentary reminder failed", null)
            }
            st == ELongSeatStatus.UNSUPPORT -> {
              done = true
              promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support sedentary reminder", null)
            }
            else -> {}
          }
        }
      }
    )
  }
}
