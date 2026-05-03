package expo.modules.veepoo

import android.util.Log
import com.veepoo.protocol.VPOperateManager
import com.veepoo.protocol.listener.base.IBleWriteResponse
import com.veepoo.protocol.listener.data.IDeviceBTInfoListener
import com.veepoo.protocol.model.datas.BTInfo
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

private fun btStateToString(status: Int): String = when (status) {
  0 -> "disconnected"
  1 -> "connected"
  2 -> "pairing"
  else -> "disconnected"
}

private fun emitBTStateChanged(module: VeepooSDKModule, info: BTInfo) {
  module.sendEvent(DEVICE_BT_STATE_CHANGED, mapOf(
    "deviceId" to (module.connectedDeviceId ?: ""),
    "state" to btStateToString(info.status),
    "btSwitchOpen" to info.isBTOpen,
    "mediaSwitchOpen" to info.isAudioOpen
  ))
}

fun ModuleDefinitionBuilder.defineBluetooth(module: VeepooSDKModule) {

  AsyncFunction("readDeviceBTStatus") { promise: Promise ->
    val manager = VPOperateManager.getInstance()
    if (manager == null) {
      promise.reject("SDK_NOT_INITIALIZED", "SDK not initialized", null)
      return@AsyncFunction
    }

    // Register a one-shot info listener, then fire read
    manager.registerBTInfoListener(object : IDeviceBTInfoListener {
      override fun onDeviceBTFunctionNotSupport() {
        promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support classic Bluetooth", null)
      }
      override fun onDeviceBTInfoSettingSuccess(info: BTInfo?) {
        // Not expected during read
      }
      override fun onDeviceBTInfoSettingFailed() {
        // Not expected during read
      }
      override fun onDeviceBTInfoReadSuccess(info: BTInfo?) {
        if (info != null) {
          promise.resolve(mapOf(
            "isBTOpen" to info.isBTOpen,
            "isAutoConnect" to info.isAutoCon,
            "isAudioOpen" to info.isAudioOpen,
            "hasPairInfo" to info.isHavePairInfo,
            "state" to btStateToString(info.status)
          ))
        } else {
          promise.reject("OPERATION_FAILED", "Read BT info returned null", null)
        }
      }
      override fun onDeviceBTInfoReadFailed() {
        promise.reject("OPERATION_FAILED", "Read BT info failed", null)
      }
      override fun onDeviceBTInfoReport(info: BTInfo?) {
        if (info != null) {
          emitBTStateChanged(module, info)
        }
      }
    })

    manager.readBTInfo(object : IBleWriteResponse {
      override fun onResponse(code: Int) {
        if (code != 0) {
          Log.w(TAG, "readBTInfo write response code: $code")
        }
      }
    }, object : IDeviceBTInfoListener {
      override fun onDeviceBTFunctionNotSupport() {
        promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support classic Bluetooth", null)
      }
      override fun onDeviceBTInfoSettingSuccess(info: BTInfo?) {}
      override fun onDeviceBTInfoSettingFailed() {}
      override fun onDeviceBTInfoReadSuccess(info: BTInfo?) {
        if (info != null) {
          promise.resolve(mapOf(
            "isBTOpen" to info.isBTOpen,
            "isAutoConnect" to info.isAutoCon,
            "isAudioOpen" to info.isAudioOpen,
            "hasPairInfo" to info.isHavePairInfo,
            "state" to btStateToString(info.status)
          ))
        } else {
          promise.reject("OPERATION_FAILED", "Read BT info returned null", null)
        }
      }
      override fun onDeviceBTInfoReadFailed() {
        promise.reject("OPERATION_FAILED", "Read BT info failed", null)
      }
      override fun onDeviceBTInfoReport(info: BTInfo?) {
        if (info != null) {
          emitBTStateChanged(module, info)
        }
      }
    })
  }

  AsyncFunction("setDeviceBTSwitch") { open: Boolean, promise: Promise ->
    val manager = VPOperateManager.getInstance()
    if (manager == null) {
      promise.reject("SDK_NOT_INITIALIZED", "SDK not initialized", null)
      return@AsyncFunction
    }

    // Register listener for state-change events
    manager.registerBTInfoListener(object : IDeviceBTInfoListener {
      override fun onDeviceBTFunctionNotSupport() {
        promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support classic Bluetooth", null)
      }
      override fun onDeviceBTInfoSettingSuccess(info: BTInfo?) {
        if (info != null) {
          emitBTStateChanged(module, info)
        }
        promise.resolve(null)
      }
      override fun onDeviceBTInfoSettingFailed() {
        promise.reject("OPERATION_FAILED", "Set BT switch failed", null)
      }
      override fun onDeviceBTInfoReadSuccess(info: BTInfo?) {}
      override fun onDeviceBTInfoReadFailed() {}
      override fun onDeviceBTInfoReport(info: BTInfo?) {
        if (info != null) {
          emitBTStateChanged(module, info)
        }
      }
    })

    manager.setBTSwitchStatus(open, object : IBleWriteResponse {
      override fun onResponse(code: Int) {
        if (code != 0) {
          Log.w(TAG, "setBTSwitchStatus write response code: $code")
        }
      }
    })
  }
}
