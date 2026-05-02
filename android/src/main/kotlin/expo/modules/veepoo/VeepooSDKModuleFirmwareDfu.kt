package expo.modules.veepoo

import android.util.Log
import com.inuker.bluetooth.library.jieli.ota.JLOTAHolder
import com.jieli.jl_bt_ota.model.base.BaseError
import com.veepoo.protocol.VPOperateManager
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.ModuleDefinitionBuilder
import java.io.File
import kotlin.math.roundToInt

private fun emitFirmwareDfu(
  module: VeepooSDKModule,
  state: String,
  progress: Float,
  message: String?,
) {
  val p = progress.coerceIn(0f, 100f).roundToInt()
  val payload = mutableMapOf<String, Any>(
    "deviceId" to (module.connectedDeviceId ?: ""),
    "state" to state,
    "progress" to p
  )
  if (message != null) {
    payload["message"] = message
  }
  module.mainHandler.post {
    module.sendEvent(FIRMWARE_DFU_PROGRESS, payload)
  }
}

fun ModuleDefinitionBuilder.defineFirmwareDfu(module: VeepooSDKModule) {
  AsyncFunction("startLocalFirmwareDfu") { filePath: String, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    val path = filePath.trim()
    if (path.isEmpty()) {
      promise.reject("INVALID_ARGUMENT", "filePath is required", null)
      return@AsyncFunction
    }
    if (!File(path).isFile) {
      promise.reject("INVALID_ARGUMENT", "Firmware file does not exist at path", null)
      return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    if (!manager.isJLDevice) {
      promise.reject(
        "CAPABILITY_UNSUPPORTED",
        "Firmware DFU is only bridged for JL-platform Bands in this release",
        null
      )
      return@AsyncFunction
    }
    if (module.isFirmwareDfuActive) {
      promise.reject("REALTIME_TEST_IN_PROGRESS", "Firmware update already in progress", null)
      return@AsyncFunction
    }
    module.isFirmwareDfuActive = true
    var promiseDone = false

    fun finishOk() {
      if (promiseDone) return
      promiseDone = true
      module.isFirmwareDfuActive = false
      module.mainHandler.post { promise.resolve(null) }
    }

    fun finishErr(code: String, msg: String) {
      if (promiseDone) return
      promiseDone = true
      module.isFirmwareDfuActive = false
      module.mainHandler.post { promise.reject(code, msg, null) }
    }

    manager.startJLDeviceOTAUpgrade(
      path,
      object : JLOTAHolder.OnJLDeviceOTAListener {
        override fun onOTAStart() {
          emitFirmwareDfu(module, "start", 0f, null)
        }

        override fun onProgress(progress: Float) {
          emitFirmwareDfu(module, "updating", progress, null)
        }

        override fun onNeedReconnect(
          address: String,
          dfuLangAddress: String,
          isReconnectBySdk: Boolean
        ) {
          emitFirmwareDfu(
            module,
            "reconnecting",
            0f,
            "dfuLang=$dfuLangAddress sdkReconnect=$isReconnectBySdk"
          )
        }

        override fun onDFULangConnectSuccess(address: String) {
          emitFirmwareDfu(module, "dfuLangConnectSuccess", 0f, address)
        }

        override fun onDFULangConnectFailed(address: String) {
          emitFirmwareDfu(module, "dfuLangConnectFailed", 0f, address)
        }

        override fun onOTASuccess() {
          emitFirmwareDfu(module, "success", 100f, null)
          finishOk()
        }

        override fun onOTAFailed(error: BaseError) {
          val msg = error.message ?: "OTA failed"
          Log.e(TAG, "startLocalFirmwareDfu: OTA failed: $error")
          emitFirmwareDfu(module, "failure", 0f, msg)
          finishErr("OPERATION_FAILED", msg)
        }
      }
    )
  }
}
