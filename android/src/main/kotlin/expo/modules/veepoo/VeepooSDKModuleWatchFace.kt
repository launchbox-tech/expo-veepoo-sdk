package expo.modules.veepoo

import android.util.Log
import com.inuker.bluetooth.library.Code
import com.veepoo.protocol.VPOperateManager
import com.veepoo.protocol.listener.base.IBleWriteResponse
import com.veepoo.protocol.listener.data.IScreenStyleListener
import com.veepoo.protocol.model.datas.ScreenStyleData
import com.veepoo.protocol.model.enums.EScreenStyle
import com.veepoo.protocol.model.enums.EUIFromType
import com.veepoo.protocol.shareprence.VpSpGetUtil
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

private fun uiFromTypeToDialKey(t: EUIFromType): String {
  return when (t) {
    EUIFromType.SERVER -> "market"
    EUIFromType.CUSTOM -> "photo"
    EUIFromType.DEFAULT -> "default"
    else -> "default"
  }
}

private fun dialKeyToUiFromType(key: String): EUIFromType {
  return when (key) {
    "market" -> EUIFromType.SERVER
    "photo" -> EUIFromType.CUSTOM
    else -> EUIFromType.DEFAULT
  }
}

private fun screenStyleDataToMap(d: ScreenStyleData): Map<String, Any> {
  return mapOf(
    "dialType" to uiFromTypeToDialKey(d.screenType),
    "screenIndex" to d.screenIndex,
    "operationSuccess" to (d.status == EScreenStyle.READ_SUCCESS || d.status == EScreenStyle.SETTING_SUCCESS)
  )
}

private fun extractDialKey(options: Map<String, Any?>?): String {
  val raw = options?.get("dialType") as? String ?: return "default"
  return when (raw.lowercase().trim()) {
    "market" -> "market"
    "photo" -> "photo"
    else -> "default"
  }
}

fun ModuleDefinitionBuilder.defineWatchFaceStyle(module: VeepooSDKModule) {
  AsyncFunction("readWatchFaceStyle") { options: Map<String, Any?>?, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    val ctx = module.appContext.reactContext ?: run {
      promise.reject("CONTEXT_ERROR", "Cannot get app context", null)
      return@AsyncFunction
    }
    if (!VpSpGetUtil.getVpSpVariInstance(ctx).isSupportScreenStyle) {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support watch face / screen style", null)
      return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    extractDialKey(options) // reserved for future per-type reads; Android API returns unified snapshot
    var done = false
    manager.readScreenStyle(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) {
            Log.e(TAG, "readWatchFaceStyle: write code=$code")
          }
        }
      },
      object : IScreenStyleListener {
        override fun onScreenStyleDataChange(data: ScreenStyleData?) {
          if (done) return
          if (data == null) {
            done = true
            promise.reject("READ_FAILED", "Watch face style data is null", null)
            return
          }
          when (data.status) {
            EScreenStyle.READ_SUCCESS -> {
              done = true
              promise.resolve(screenStyleDataToMap(data))
            }
            EScreenStyle.READ_FAIL, EScreenStyle.UNKONW -> {
              done = true
              promise.reject("READ_FAILED", "Read watch face style failed", null)
            }
            else -> {}
          }
        }
      }
    )
  }

  AsyncFunction("setWatchFaceStyle") { settings: Map<String, Any?>, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    val ctx = module.appContext.reactContext ?: run {
      promise.reject("CONTEXT_ERROR", "Cannot get app context", null)
      return@AsyncFunction
    }
    if (!VpSpGetUtil.getVpSpVariInstance(ctx).isSupportScreenStyle) {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support watch face / screen style", null)
      return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    val idx = (settings["screenIndex"] as? Number)?.toInt() ?: run {
      promise.reject("INVALID_ARGUMENT", "screenIndex is required", null)
      return@AsyncFunction
    }
    val dialKey = extractDialKey(settings)
    val uiType = dialKeyToUiFromType(dialKey)
    var done = false
    manager.settingScreenStyle(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) {
            Log.e(TAG, "setWatchFaceStyle: write code=$code")
          }
        }
      },
      object : IScreenStyleListener {
        override fun onScreenStyleDataChange(data: ScreenStyleData?) {
          if (done) return
          if (data == null) {
            done = true
            promise.reject("SET_FAILED", "Set watch face style returned null", null)
            return
          }
          when (data.status) {
            EScreenStyle.SETTING_SUCCESS -> {
              done = true
              promise.resolve(null)
            }
            EScreenStyle.SETTING_FAIL -> {
              done = true
              promise.reject("SET_FAILED", "Set watch face style failed", null)
            }
            else -> {}
          }
        }
      },
      idx,
      uiType
    )
  }
}
