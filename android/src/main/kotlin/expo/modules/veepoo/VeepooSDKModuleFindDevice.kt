package expo.modules.veepoo

import android.util.Log
import com.inuker.bluetooth.library.Code
import com.veepoo.protocol.VPOperateManager
import com.veepoo.protocol.listener.base.IBleWriteResponse
import com.veepoo.protocol.listener.data.IFindDevicelistener
import com.veepoo.protocol.shareprence.VpSpGetUtil
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

private fun emitFindDevicePhase(module: VeepooSDKModule, phase: String, raw: Int? = null) {
  val deviceId = module.connectedDeviceId ?: ""
  val payload = mutableMapOf<String, Any>("deviceId" to deviceId, "phase" to phase)
  if (raw != null) payload["rawState"] = raw
  module.sendEvent(FIND_DEVICE_STATE, payload)
}

fun ModuleDefinitionBuilder.defineFindDevice(module: VeepooSDKModule) {
  AsyncFunction("startFindDevice") { promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    val context = module.appContext.reactContext ?: run {
      promise.reject("CONTEXT_ERROR", "Cannot get app context", null)
      return@AsyncFunction
    }
    if (!VpSpGetUtil.getVpSpVariInstance(context).isSupportFindDeviceByPhone) {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support find-device-from-phone", null)
      return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }

    var promiseDone = false
    manager.startFindDeviceByPhone(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code == Code.REQUEST_SUCCESS) {
            if (!promiseDone) {
              promiseDone = true
              promise.resolve(null)
            }
          } else {
            Log.e(TAG, "startFindDevice: write failed code=$code")
            if (!promiseDone) {
              promiseDone = true
              promise.reject("OPERATION_FAILED", "startFindDevice write failed: $code", null)
            }
          }
        }
      },
      object : IFindDevicelistener {
        override fun unSupportFindDeviceByPhone() {
          emitFindDevicePhase(module, "unsupported", 0)
          if (!promiseDone) {
            promiseDone = true
            promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support find-device-from-phone", null)
          }
        }

        override fun findingDevice() {
          emitFindDevicePhase(module, "searching", 1)
        }

        override fun findedDevice() {
          emitFindDevicePhase(module, "found", 2)
        }

        override fun unFindDevice() {
          emitFindDevicePhase(module, "timeout", 3)
        }
      }
    )
  }

  AsyncFunction("stopFindDevice") { promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    val context = module.appContext.reactContext ?: run {
      promise.reject("CONTEXT_ERROR", "Cannot get app context", null)
      return@AsyncFunction
    }
    if (!VpSpGetUtil.getVpSpVariInstance(context).isSupportFindDeviceByPhone) {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support find-device-from-phone", null)
      return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }

    var promiseDone = false
    manager.stopFindDeviceByPhone(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code == Code.REQUEST_SUCCESS) {
            if (!promiseDone) {
              promiseDone = true
              promise.resolve(null)
            }
          } else {
            Log.e(TAG, "stopFindDevice: write failed code=$code")
            if (!promiseDone) {
              promiseDone = true
              promise.reject("OPERATION_FAILED", "stopFindDevice write failed: $code", null)
            }
          }
        }
      },
      object : IFindDevicelistener {
        override fun unSupportFindDeviceByPhone() {
          emitFindDevicePhase(module, "unsupported", 0)
          if (!promiseDone) {
            promiseDone = true
            promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support find-device-from-phone", null)
          }
        }

        override fun findingDevice() {
          emitFindDevicePhase(module, "searching", 1)
        }

        override fun findedDevice() {
          emitFindDevicePhase(module, "found", 2)
        }

        override fun unFindDevice() {
          emitFindDevicePhase(module, "stopped", 4)
        }
      }
    )
  }
}
