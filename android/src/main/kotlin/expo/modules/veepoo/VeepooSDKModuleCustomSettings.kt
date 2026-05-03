package expo.modules.veepoo

import android.util.Log
import com.inuker.bluetooth.library.Code
import com.veepoo.protocol.VPOperateManager
import com.veepoo.protocol.listener.base.IBleWriteResponse
import com.veepoo.protocol.listener.data.ICustomSettingDataListener
import com.veepoo.protocol.model.enums.EBloodGlucoseUnit
import com.veepoo.protocol.model.enums.ECustomStatus
import com.veepoo.protocol.model.enums.ETemperatureUnit
import com.veepoo.protocol.model.settings.CustomSetting
import com.veepoo.protocol.model.settings.CustomSettingData
import com.veepoo.protocol.shareprence.VpSpGetUtil
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

private fun customSettingDataToMap(d: CustomSettingData): Map<String, Any> {
  val tempUnit = when (d.temperatureUnit) {
    ETemperatureUnit.FAHRENHEIT -> "fahrenheit"
    else -> "celsius"
  }
  val glucoseUnit = when (d.bloodGlucoseUnit) {
    EBloodGlucoseUnit.mg_dl -> "mgdL"
    else -> "mmolL"
  }
  val skinTone = d.skinLevel.coerceIn(1, 6).let { if (it == 0) 1 else it }
  return mapOf(
    "temperatureUnit" to tempUnit,
    "bloodGlucoseUnit" to glucoseUnit,
    "skinTone" to skinTone
  )
}

fun ModuleDefinitionBuilder.defineCustomSettings(module: VeepooSDKModule) {
  AsyncFunction("readCustomSettings") { promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    var done = false
    manager.readCustomSetting(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) {
            Log.e(TAG, "readCustomSettings: write code=$code")
          }
        }
      },
      object : ICustomSettingDataListener {
        override fun OnSettingDataChange(data: CustomSettingData?) {
          if (done) return
          val d = data ?: run {
            done = true
            promise.reject("READ_FAILED", "Custom settings data null", null)
            return
          }
          when (d.status) {
            ECustomStatus.READ_SUCCESS -> {
              done = true
              val result = customSettingDataToMap(d)
              module.sendEvent(CUSTOM_SETTINGS_DATA, mapOf(
                "deviceId" to (module.connectedDeviceId ?: ""),
                "data" to result
              ))
              promise.resolve(result)
            }
            ECustomStatus.UNKNOW -> {
              done = true
              promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support custom measurement settings", null)
            }
            else -> {
              done = true
              promise.reject("READ_FAILED", "Read custom settings failed: ${d.status}", null)
            }
          }
        }
      }
    )
  }

  AsyncFunction("writeCustomSettings") { settings: Map<String, Any?>, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    // Read first to get the full current state, then apply partial overrides
    var readDone = false
    manager.readCustomSetting(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {}
      },
      object : ICustomSettingDataListener {
        override fun OnSettingDataChange(current: CustomSettingData?) {
          if (readDone) return
          val d = current ?: run {
            readDone = true
            promise.reject("READ_FAILED", "Could not read current custom settings", null)
            return
          }
          if (d.status == ECustomStatus.UNKNOW) {
            readDone = true
            promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support custom measurement settings", null)
            return
          }
          if (d.status != ECustomStatus.READ_SUCCESS) {
            readDone = true
            promise.reject("READ_FAILED", "Read failed before write: ${d.status}", null)
            return
          }
          readDone = true

          val tempUnit = when (settings["temperatureUnit"] as? String) {
            "celsius" -> ETemperatureUnit.CELSIUS
            "fahrenheit" -> ETemperatureUnit.FAHRENHEIT
            else -> d.temperatureUnit ?: ETemperatureUnit.CELSIUS
          }
          val glucoseUnit = when (settings["bloodGlucoseUnit"] as? String) {
            "mmolL" -> EBloodGlucoseUnit.mmol_L
            "mgdL" -> EBloodGlucoseUnit.mg_dl
            else -> d.bloodGlucoseUnit ?: EBloodGlucoseUnit.mmol_L
          }
          val skinToneRaw = (settings["skinTone"] as? Number)?.toInt()
          val skinTone = skinToneRaw?.coerceIn(1, 6) ?: d.skinLevel.coerceIn(1, 6)

          val customSetting = CustomSetting(
            d.isHaveMetricSystem,
            d.isMetricSystemValue,
            d.is24Hour,
            d.isOpenAutoHeartDetect,
            d.isOpenAutoBpDetect
          )
          customSetting.temperatureUnit = tempUnit
          customSetting.bloodGlucoseUnit = glucoseUnit
          val ctx = module.appContext.reactContext
          if (ctx != null && VpSpGetUtil.getVpSpVariInstance(ctx).skinType == 2) {
            customSetting.skinType = skinTone
          }
          customSetting.isOpenSportRemain = d.sportOverRemain
          customSetting.isOpenVoiceBpHeart = d.voiceBpHeart
          customSetting.isOpenFindPhoneUI = d.findPhoneUi
          customSetting.isOpenStopWatch = d.secondsWatch
          customSetting.isOpenSpo2hLowRemind = d.lowSpo2hRemain
          customSetting.isOpenWearDetectSkin = d.skin
          customSetting.isOpenAutoHRV = d.autoHrv
          customSetting.isOpenAutoInCall = d.autoIncall
          customSetting.isOpenDisconnectRemind = d.disconnectRemind
          customSetting.isOpenSOS = d.SOS
          customSetting.isOpenPPG = d.ppg
          customSetting.isOpenMusicControl = d.musicControl
          customSetting.isOpenLongClickLockScreen = d.longClickLockScreen
          customSetting.isOpenMessageScreenLight = d.messageScreenLight
          customSetting.isOpenAutoTemperatureDetect = d.autoTemperatureDetect
          customSetting.ecgAlwaysOpen = d.ecgAlwaysOpen
          customSetting.isOpenBloodGlucoseDetect = d.bloodGlucoseDetection
          customSetting.METDetect = d.METDetect
          customSetting.stressDetect = d.stressDetect
          customSetting.isOpenBloodComponentDetect = d.bloodComponentDetect

          var writeDone = false
          manager.changeCustomSetting(
            object : IBleWriteResponse {
              override fun onResponse(code: Int) {
                if (code != Code.REQUEST_SUCCESS) {
                  Log.e(TAG, "writeCustomSettings: write code=$code")
                }
              }
            },
            object : ICustomSettingDataListener {
              override fun OnSettingDataChange(result: CustomSettingData?) {
                if (writeDone) return
                val r = result ?: run {
                  writeDone = true
                  promise.reject("SET_FAILED", "Custom settings write callback null", null)
                  return
                }
                when (r.status) {
                  ECustomStatus.SETTING_SUCCESS -> {
                    writeDone = true
                    promise.resolve(null)
                  }
                  else -> {
                    writeDone = true
                    promise.reject("SET_FAILED", "Write custom settings failed: ${r.status}", null)
                  }
                }
              }
            },
            customSetting
          )
        }
      }
    )
  }
}
