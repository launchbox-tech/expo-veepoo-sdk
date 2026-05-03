package expo.modules.veepoo

import android.util.Log
import com.inuker.bluetooth.library.Code
import com.veepoo.protocol.VPOperateManager
import com.veepoo.protocol.listener.base.IBleWriteResponse
import com.veepoo.protocol.listener.data.IResponseListener
import com.veepoo.protocol.model.settings.DeviceTimeSetting
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.ModuleDefinitionBuilder
import java.util.Calendar

fun ModuleDefinitionBuilder.defineTime(module: VeepooSDKModule) {
  AsyncFunction("setDeviceTime") { timeMap: Map<String, Any?>?, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }

    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }

    val cal = Calendar.getInstance()
    val setting = if (timeMap == null) {
      DeviceTimeSetting(
        cal.get(Calendar.YEAR),
        cal.get(Calendar.MONTH) + 1,
        cal.get(Calendar.DAY_OF_MONTH),
        cal.get(Calendar.HOUR_OF_DAY),
        cal.get(Calendar.MINUTE),
        cal.get(Calendar.SECOND)
      )
    } else {
      DeviceTimeSetting(
        (timeMap["year"] as? Number)?.toInt() ?: cal.get(Calendar.YEAR),
        (timeMap["month"] as? Number)?.toInt() ?: (cal.get(Calendar.MONTH) + 1),
        (timeMap["day"] as? Number)?.toInt() ?: cal.get(Calendar.DAY_OF_MONTH),
        (timeMap["hour"] as? Number)?.toInt() ?: cal.get(Calendar.HOUR_OF_DAY),
        (timeMap["minute"] as? Number)?.toInt() ?: cal.get(Calendar.MINUTE),
        (timeMap["second"] as? Number)?.toInt() ?: cal.get(Calendar.SECOND)
      )
    }

    Log.d(TAG, "setDeviceTime: year=${setting.year} month=${setting.month} day=${setting.day} hour=${setting.hour} minute=${setting.minute} second=${setting.second}")

    var resolved = false
    manager.settingTime(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) {
            Log.e(TAG, "setDeviceTime: BLE write failed code=$code")
            if (!resolved) {
              resolved = true
              promise.resolve(false)
            }
          }
        }
      },
      object : IResponseListener {
        override fun response(result: Int) {
          if (resolved) return
          resolved = true
          Log.d(TAG, "setDeviceTime: device responded result=$result")
          promise.resolve(true)
        }
      },
      setting
    )
  }
}
