package expo.modules.veepoo

import android.util.Log
import com.inuker.bluetooth.library.Code
import com.veepoo.protocol.VPOperateManager
import com.veepoo.protocol.listener.base.IBleWriteResponse
import com.veepoo.protocol.listener.data.INightTurnWristeDataListener
import com.veepoo.protocol.model.datas.NightTurnWristeData
import com.veepoo.protocol.model.datas.TimeData
import com.veepoo.protocol.model.enums.ENightTurnWristeStatus
import com.veepoo.protocol.model.settings.NightTurnWristSetting
import com.veepoo.protocol.shareprence.VpSpGetUtil
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

private fun nightTurnDataToMap(d: NightTurnWristeData): Map<String, Any> {
  val st = d.startTime
  val et = d.endTime
  val sh = st?.hour ?: 0
  val sm = st?.minute ?: 0
  val eh = et?.hour ?: 0
  val em = et?.minute ?: 0
  val out = mutableMapOf<String, Any>(
    "enabled" to d.isNightTureWirsteStatusOpen,
    "startHour" to sh,
    "startMinute" to sm,
    "endHour" to eh,
    "endMinute" to em,
    "sensitivityLevel" to d.level,
    "supportsCustomTimeWindow" to d.isSupportCustomSettingTime
  )
  if (d.defaultLevel != 0) {
    out["defaultSensitivityLevel"] = d.defaultLevel
  }
  return out
}

private fun mapToNightTurnWristSetting(m: Map<String, Any?>): NightTurnWristSetting {
  val open = m["enabled"] as? Boolean ?: true
  val sh = (m["startHour"] as? Number)?.toInt() ?: 22
  val sm = (m["startMinute"] as? Number)?.toInt() ?: 0
  val eh = (m["endHour"] as? Number)?.toInt() ?: 8
  val em = (m["endMinute"] as? Number)?.toInt() ?: 0
  val level = (m["sensitivityLevel"] as? Number)?.toInt() ?: 5
  return NightTurnWristSetting(open, TimeData(sh, sm), TimeData(eh, em), level)
}

fun ModuleDefinitionBuilder.defineWristFlipWake(module: VeepooSDKModule) {
  AsyncFunction("readWristFlipWakeSettings") { promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    val ctx = module.appContext.reactContext ?: run {
      promise.reject("CONTEXT_ERROR", "Cannot get app context", null)
      return@AsyncFunction
    }
    if (!VpSpGetUtil.getVpSpVariInstance(ctx).isSupportNightturnSetting) {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support wrist-flip wake", null)
      return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    var done = false
    manager.readNightTurnWriste(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) {
            Log.e(TAG, "readWristFlipWakeSettings: write code=$code")
          }
        }
      },
      object : INightTurnWristeDataListener {
        override fun onNightTurnWristeDataChange(data: NightTurnWristeData) {
          if (done) return
          when (data.getOprateStauts()) {
            ENightTurnWristeStatus.SUCCESS -> {
              done = true
              promise.resolve(nightTurnDataToMap(data))
            }
            ENightTurnWristeStatus.FAIL -> {
              done = true
              promise.reject("READ_FAILED", "Read wrist-flip wake failed", null)
            }
            ENightTurnWristeStatus.UNKONW -> {
              done = true
              promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support wrist-flip wake", null)
            }
          }
        }
      }
    )
  }

  AsyncFunction("setWristFlipWakeSettings") { settings: Map<String, Any?>, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    val ctx = module.appContext.reactContext ?: run {
      promise.reject("CONTEXT_ERROR", "Cannot get app context", null)
      return@AsyncFunction
    }
    if (!VpSpGetUtil.getVpSpVariInstance(ctx).isSupportNightturnSetting) {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support wrist-flip wake", null)
      return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    val setting = mapToNightTurnWristSetting(settings)
    var done = false
    manager.settingNightTurnWriste(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) {
            Log.e(TAG, "setWristFlipWakeSettings: write code=$code")
          }
        }
      },
      object : INightTurnWristeDataListener {
        override fun onNightTurnWristeDataChange(data: NightTurnWristeData) {
          if (done) return
          when (data.getOprateStauts()) {
            ENightTurnWristeStatus.SUCCESS -> {
              done = true
              promise.resolve(null)
            }
            ENightTurnWristeStatus.FAIL -> {
              done = true
              promise.reject("SET_FAILED", "Set wrist-flip wake failed", null)
            }
            ENightTurnWristeStatus.UNKONW -> {
              done = true
              promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support wrist-flip wake", null)
            }
          }
        }
      },
      setting
    )
  }
}
