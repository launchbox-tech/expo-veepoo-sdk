package expo.modules.veepoo

import android.util.Log
import com.inuker.bluetooth.library.Code
import com.veepoo.protocol.VPOperateManager
import com.veepoo.protocol.listener.base.IBleWriteResponse
import com.veepoo.protocol.listener.data.ICameraDataListener
import com.veepoo.protocol.listener.data.IMusicControlListener
import com.veepoo.protocol.model.datas.MusicData
import com.veepoo.protocol.model.enums.ECameraStatus
import com.veepoo.protocol.shareprence.VpSpGetUtil
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

private fun emitCameraShutter(module: VeepooSDKModule, status: String) {
  module.sendEvent(
    CAMERA_SHUTTER,
    mapOf("deviceId" to (module.connectedDeviceId ?: ""), "status" to status)
  )
}

private fun emitMusicCommand(module: VeepooSDKModule, command: String) {
  module.sendEvent(
    MUSIC_REMOTE_COMMAND,
    mapOf("deviceId" to (module.connectedDeviceId ?: ""), "command" to command)
  )
}

@Suppress("UNCHECKED_CAST")
fun ModuleDefinitionBuilder.defineMedia(module: VeepooSDKModule) {

  // MARK: - Camera remote

  AsyncFunction("enterCameraMode") { promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    val ctx = module.appContext.reactContext ?: run {
      promise.reject("CONTEXT_ERROR", "Cannot get app context", null)
      return@AsyncFunction
    }
    if (!VpSpGetUtil.getVpSpVariInstance(ctx).isSupportCamera) {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support camera remote", null)
      return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }

    var promiseDone = false
    manager.startCamera(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code == Code.REQUEST_SUCCESS) {
            if (!promiseDone) { promiseDone = true; promise.resolve(null) }
          } else {
            Log.e(TAG, "enterCameraMode: write failed code=$code")
            if (!promiseDone) {
              promiseDone = true
              promise.reject("OPERATION_FAILED", "enterCameraMode write failed: $code", null)
            }
          }
        }
      },
      object : ICameraDataListener {
        override fun OnCameraDataChange(status: ECameraStatus) {
          when (status) {
            ECameraStatus.OPEN_FALI -> {
              if (!promiseDone) {
                promiseDone = true
                promise.reject("OPERATION_FAILED", "Band failed to enter camera mode", null)
              }
            }
            ECameraStatus.TAKEPHOTO_CAN -> emitCameraShutter(module, "canTake")
            ECameraStatus.TAKEPHOTO_CAN_NOT -> emitCameraShutter(module, "cannotTake")
            ECameraStatus.CLOSE_SUCCESS -> { /* handled by exitCameraMode */ }
            else -> {}
          }
        }
      }
    )
  }

  AsyncFunction("exitCameraMode") { promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    val ctx = module.appContext.reactContext ?: run {
      promise.reject("CONTEXT_ERROR", "Cannot get app context", null)
      return@AsyncFunction
    }
    if (!VpSpGetUtil.getVpSpVariInstance(ctx).isSupportCamera) {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support camera remote", null)
      return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }

    var promiseDone = false
    manager.stopCamera(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code == Code.REQUEST_SUCCESS) {
            if (!promiseDone) { promiseDone = true; promise.resolve(null) }
          } else {
            Log.e(TAG, "exitCameraMode: write failed code=$code")
            if (!promiseDone) {
              promiseDone = true
              promise.reject("OPERATION_FAILED", "exitCameraMode write failed: $code", null)
            }
          }
        }
      },
      object : ICameraDataListener {
        override fun OnCameraDataChange(status: ECameraStatus) {
          when (status) {
            ECameraStatus.CLOSE_SUCCESS -> {
              if (!promiseDone) { promiseDone = true; promise.resolve(null) }
            }
            ECameraStatus.CLOSE_FAIL -> {
              if (!promiseDone) {
                promiseDone = true
                promise.reject("OPERATION_FAILED", "Band failed to exit camera mode", null)
              }
            }
            else -> {}
          }
        }
      }
    )
  }

  // MARK: - Music remote

  // Android has no distinct "enable music control" toggle — capability is expressed by musicType.
  // Resolve immediately; host apps should check readDeviceFunctions() musicStyle before calling pushMusicData.
  AsyncFunction("setMusicControlEnabled") { _: Boolean, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    promise.resolve(null)
  }

  AsyncFunction("pushMusicData") { data: Map<String, Any?>, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    val ctx = module.appContext.reactContext ?: run {
      promise.reject("CONTEXT_ERROR", "Cannot get app context", null)
      return@AsyncFunction
    }
    val musicType = VpSpGetUtil.getVpSpVariInstance(ctx).musicType
    if (musicType != 1) {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support music control (musicType=$musicType)", null)
      return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }

    // MusicData has no no-arg constructor in this SDK; the only one is
    // (singerName, musicName, musicAlbum, musicVoiceLevel, palyStatus) — order
    // read off the constructor bytecode, since the field order in the class does
    // NOT match it. `palyStatus` is an Int flag standing in for the JS
    // `isPlaying` boolean (1 = playing, 0 = paused); the vendor ships no constant
    // for it, so this is the conventional encoding and is unverified on hardware.
    val musicData = MusicData(
      data["artist"] as? String ?: "",
      data["name"] as? String ?: "",
      data["album"] as? String ?: "",
      (data["volume"] as? Number)?.toInt() ?: 50,
      if (data["isPlaying"] as? Boolean == true) 1 else 0
    ).apply {
      musicAppId = data["appId"] as? String ?: ""
    }

    var promiseDone = false
    manager.settingMusicData(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code == Code.REQUEST_SUCCESS) {
            if (!promiseDone) { promiseDone = true; promise.resolve(null) }
          } else {
            Log.e(TAG, "pushMusicData: write failed code=$code")
            if (!promiseDone) {
              promiseDone = true
              promise.reject("OPERATION_FAILED", "pushMusicData write failed: $code", null)
            }
          }
        }
      },
      musicData,
      object : IMusicControlListener {
        override fun nextMusic() = emitMusicCommand(module, "next")
        override fun previousMusic() = emitMusicCommand(module, "previous")
        override fun pauseAndPlayMusic() = emitMusicCommand(module, "pausePlay")
        // Required by IMusicControlListener, but MusicRemoteCommand in
        // src/capabilities/music.ts is only next | previous | pause_play. There
        // is no honest mapping for these four: normalizeMusicRemoteCommand falls
        // back to "pause_play" for anything it does not recognise, so emitting
        // them would surface a volume change to JS as a play/pause toggle. Log
        // and drop rather than report a command the band did not send. Widening
        // the TS union is a separate, cross-platform API change.
        override fun pauseMusic() {
          Log.d(TAG, "pushMusicData: band sent pauseMusic — no MusicRemoteCommand for it, dropped")
        }
        override fun playMusic() {
          Log.d(TAG, "pushMusicData: band sent playMusic — no MusicRemoteCommand for it, dropped")
        }
        override fun voiceUp() {
          Log.d(TAG, "pushMusicData: band sent voiceUp — no MusicRemoteCommand for it, dropped")
        }
        override fun voiceDown() {
          Log.d(TAG, "pushMusicData: band sent voiceDown — no MusicRemoteCommand for it, dropped")
        }
        override fun oprateMusicSuccess() {}
        override fun oprateMusicFail() {
          Log.e(TAG, "pushMusicData: IMusicControlListener.oprateMusicFail")
        }
      }
    )
  }
}
