package expo.modules.veepoo

import android.util.Log
import com.inuker.bluetooth.library.Code
import com.veepoo.protocol.VPOperateManager
import com.veepoo.protocol.listener.base.IBleWriteResponse
import com.veepoo.protocol.listener.data.IScreenLightListener
import com.veepoo.protocol.listener.data.IScreenLightTimeListener
import com.veepoo.protocol.model.datas.ScreenLightData
import com.veepoo.protocol.model.datas.ScreenLightTimeData
import com.veepoo.protocol.model.enums.EScreenLight
import com.veepoo.protocol.model.enums.EScreenLightTime
import com.veepoo.protocol.model.settings.ScreenSetting
import com.veepoo.protocol.shareprence.VpSpGetUtil
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

private fun screenSettingToMap(s: ScreenSetting): Map<String, Any> {
  return mapOf(
    "nightStartHour" to s.startHour,
    "nightStartMinute" to s.startMinute,
    "nightEndHour" to s.endHour,
    "nightEndMinute" to s.endMinute,
    "nightLevel" to s.level,
    "dayLevel" to s.otherLeverl,
    "autoAdjust" to (s.auto == 1),
    "maxLevel" to s.maxLevel
  )
}

private fun mapToScreenSetting(m: Map<String, Any?>): ScreenSetting {
  val sh = (m["nightStartHour"] as? Number)?.toInt() ?: 22
  val sm = (m["nightStartMinute"] as? Number)?.toInt() ?: 0
  val eh = (m["nightEndHour"] as? Number)?.toInt() ?: 7
  val em = (m["nightEndMinute"] as? Number)?.toInt() ?: 0
  val nl = (m["nightLevel"] as? Number)?.toInt() ?: 2
  val dl = (m["dayLevel"] as? Number)?.toInt() ?: 4
  val auto = if (m["autoAdjust"] as? Boolean == true) 1 else 0
  val max = (m["maxLevel"] as? Number)?.toInt() ?: 5
  val s = ScreenSetting(sh, sm, eh, em, nl, dl)
  s.auto = auto
  s.maxLevel = max
  return s
}

private fun screenLightTimeToMap(d: ScreenLightTimeData): Map<String, Any> {
  return mapOf(
    "currentSeconds" to d.currentDuration,
    "minSeconds" to d.minDuration,
    "maxSeconds" to d.maxDuration,
    "recommendSeconds" to d.recommendDuration
  )
}

fun ModuleDefinitionBuilder.defineScreenLight(module: VeepooSDKModule) {
  AsyncFunction("readScreenLightSettings") { promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    val ctx = module.appContext.reactContext ?: run {
      promise.reject("CONTEXT_ERROR", "Cannot get app context", null)
      return@AsyncFunction
    }
    if (!VpSpGetUtil.getVpSpVariInstance(ctx).isSupportScreenlight) {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support screen brightness schedule", null)
      return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    var done = false
    manager.readScreenLight(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) {
            Log.e(TAG, "readScreenLightSettings: write code=$code")
          }
        }
      },
      object : IScreenLightListener {
        override fun onScreenLightDataChange(data: ScreenLightData) {
          if (done) return
          when (data.status) {
            EScreenLight.READ_SUCCESS -> {
              val setting = data.screenSetting ?: run {
                done = true
                promise.reject("READ_FAILED", "Screen light data missing settings", null)
                return
              }
              done = true
              promise.resolve(screenSettingToMap(setting))
            }
            EScreenLight.READ_FAIL -> {
              done = true
              promise.reject("READ_FAILED", "Read screen light failed", null)
            }
            else -> {}
          }
        }
      }
    )
  }

  AsyncFunction("setScreenLightSettings") { settings: Map<String, Any?>, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    val ctx = module.appContext.reactContext ?: run {
      promise.reject("CONTEXT_ERROR", "Cannot get app context", null)
      return@AsyncFunction
    }
    if (!VpSpGetUtil.getVpSpVariInstance(ctx).isSupportScreenlight) {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support screen brightness schedule", null)
      return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    val screenSetting = mapToScreenSetting(settings)
    var done = false
    manager.settingScreenLight(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) {
            Log.e(TAG, "setScreenLightSettings: write code=$code")
          }
        }
      },
      object : IScreenLightListener {
        override fun onScreenLightDataChange(data: ScreenLightData) {
          if (done) return
          when (data.status) {
            EScreenLight.SETTING_SUCCESS -> {
              done = true
              promise.resolve(null)
            }
            EScreenLight.SETTING_FAIL -> {
              done = true
              promise.reject("SET_FAILED", "Set screen light failed", null)
            }
            else -> {}
          }
        }
      },
      screenSetting
    )
  }

  AsyncFunction("readScreenLightDuration") { promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    val ctx = module.appContext.reactContext ?: run {
      promise.reject("CONTEXT_ERROR", "Cannot get app context", null)
      return@AsyncFunction
    }
    if (!VpSpGetUtil.getVpSpVariInstance(ctx).isSupportScreenlightTime) {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support screen-on duration", null)
      return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    var done = false
    manager.readScreenLightTime(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) {
            Log.e(TAG, "readScreenLightDuration: write code=$code")
          }
        }
      },
      object : IScreenLightTimeListener {
        override fun onScreenLightTimeDataChange(data: ScreenLightTimeData?) {
          if (done) return
          val d = data ?: run {
            done = true
            promise.reject("READ_FAILED", "Screen light duration data null", null)
            return
          }
          when (d.screenLightState) {
            EScreenLightTime.READ_SUCCESS -> {
              done = true
              promise.resolve(screenLightTimeToMap(d))
            }
            EScreenLightTime.READ_FAIL -> {
              done = true
              promise.reject("READ_FAILED", "Read screen light duration failed", null)
            }
            else -> {}
          }
        }
      }
    )
  }

  AsyncFunction("setScreenLightDuration") { seconds: Double, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    val ctx = module.appContext.reactContext ?: run {
      promise.reject("CONTEXT_ERROR", "Cannot get app context", null)
      return@AsyncFunction
    }
    if (!VpSpGetUtil.getVpSpVariInstance(ctx).isSupportScreenlightTime) {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support screen-on duration", null)
      return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    val sec = seconds.toInt()
    var done = false
    manager.setScreenLightTime(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) {
            Log.e(TAG, "setScreenLightDuration: write code=$code")
          }
        }
      },
      object : IScreenLightTimeListener {
        override fun onScreenLightTimeDataChange(data: ScreenLightTimeData?) {
          if (done) return
          val d = data ?: run {
            done = true
            promise.reject("READ_FAILED", "Screen light duration set callback null", null)
            return
          }
          when (d.screenLightState) {
            EScreenLightTime.SETTING_SUCCESS -> {
              done = true
              promise.resolve(null)
            }
            EScreenLightTime.SETTING_FAIL -> {
              done = true
              promise.reject("SET_FAILED", "Set screen light duration failed", null)
            }
            else -> {}
          }
        }
      },
      sec
    )
  }
}
