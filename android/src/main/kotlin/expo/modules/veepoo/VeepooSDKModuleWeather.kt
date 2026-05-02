package expo.modules.veepoo

import android.util.Log
import com.inuker.bluetooth.library.Code
import com.veepoo.protocol.VPOperateManager
import com.veepoo.protocol.listener.base.IBleWriteResponse
import com.veepoo.protocol.listener.data.IWeatherStatusDataListener
import com.veepoo.protocol.model.datas.TimeData
import com.veepoo.protocol.model.datas.WeatherData
import com.veepoo.protocol.model.datas.WeatherEvery3Hour
import com.veepoo.protocol.model.datas.WeatherEveryDay
import com.veepoo.protocol.model.datas.WeatherStatusData
import com.veepoo.protocol.model.datas.WeatherStatusSetting
import com.veepoo.protocol.model.enums.EWeatherOprateStatus
import com.veepoo.protocol.model.enums.EWeatherType
import com.veepoo.protocol.shareprence.VpSpGetUtil
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

// "YYYY-MM-DD HH:mm" → TimeData(y,m,d,h,min,0)
private fun parseDatetime(s: String): TimeData? {
  val parts = s.trim().split(" ")
  if (parts.size != 2) return null
  val date = parts[0].split("-")
  val time = parts[1].split(":")
  if (date.size != 3 || time.size < 2) return null
  return TimeData(
    date[0].toIntOrNull() ?: return null,
    date[1].toIntOrNull() ?: return null,
    date[2].toIntOrNull() ?: return null,
    time[0].toIntOrNull() ?: return null,
    time[1].toIntOrNull() ?: return null,
    0
  )
}

// "YYYY-MM-DD" → TimeData(y,m,d,0,0,0)
private fun parseDate(s: String): TimeData? {
  val parts = s.trim().split("-")
  if (parts.size != 3) return null
  return TimeData(
    parts[0].toIntOrNull() ?: return null,
    parts[1].toIntOrNull() ?: return null,
    parts[2].toIntOrNull() ?: return null,
    0, 0, 0
  )
}

@Suppress("UNCHECKED_CAST")
private fun buildWeatherDataFromMap(m: Map<String, Any?>): WeatherData {
  val cityName = (m["cityName"] as? String)?.trim()
    ?: throw IllegalArgumentException("cityName is required")
  val crc = (m["crc"] as? Number)?.toInt()
    ?: throw IllegalArgumentException("crc is required")

  val hourlyList = m["hourly"] as? List<*>
    ?: throw IllegalArgumentException("hourly is required")
  val dailyList = m["daily"] as? List<*>
    ?: throw IllegalArgumentException("daily is required")

  val hourly = hourlyList.mapIndexed { i, raw ->
    val h = raw as? Map<String, Any?> ?: throw IllegalArgumentException("hourly[$i] must be an object")
    val time = parseDatetime(h["time"] as? String ?: "")
      ?: throw IllegalArgumentException("hourly[$i].time must be \"YYYY-MM-DD HH:mm\"")
    WeatherEvery3Hour(
      time,
      (h["tempF"] as? Number)?.toInt() ?: 0,
      (h["tempC"] as? Number)?.toInt() ?: 0,
      (h["uvIndex"] as? Number)?.toInt() ?: 0,
      (h["weatherState"] as? Number)?.toInt() ?: 0,
      h["windLevel"] as? String ?: "",
      (h["visibilityM"] as? Number)?.toDouble() ?: 0.0
    )
  }

  val daily = dailyList.mapIndexed { i, raw ->
    val d = raw as? Map<String, Any?> ?: throw IllegalArgumentException("daily[$i] must be an object")
    val date = parseDate(d["date"] as? String ?: "")
      ?: throw IllegalArgumentException("daily[$i].date must be \"YYYY-MM-DD\"")
    WeatherEveryDay(
      date,
      (d["maxTempF"] as? Number)?.toInt() ?: 0,
      (d["minTempF"] as? Number)?.toInt() ?: 0,
      (d["maxTempC"] as? Number)?.toInt() ?: 0,
      (d["minTempC"] as? Number)?.toInt() ?: 0,
      (d["uvIndex"] as? Number)?.toInt() ?: 0,
      (d["weatherStateDay"] as? Number)?.toInt() ?: 0,
      (d["weatherStateNight"] as? Number)?.toInt() ?: 0,
      d["windLevel"] as? String ?: "",
      (d["visibilityM"] as? Number)?.toDouble() ?: 0.0
    )
  }

  return WeatherData(crc, cityName, 0, TimeData(0, 0, 0), hourly, daily)
}

private fun weatherStatusDataToMap(w: WeatherStatusData): Map<String, Any?> {
  val unit = if (w.weatherType == EWeatherType.F) "F" else "C"
  return mapOf("isOpen" to w.isOpen, "unit" to unit, "crc" to w.crc)
}

/** Probe VpSpGetUtil for cached weather open/unit state (populated post-connect). */
private fun readCachedWeatherState(util: VpSpGetUtil): Map<String, Any?> {
  val cls = util.javaClass
  var isOpen = false
  var unit = "C"
  var crc = 0
  for (name in arrayOf("isWeatherOpen", "getIsWeatherOpen", "isOpenWeather")) {
    try {
      isOpen = cls.getMethod(name).invoke(util) as? Boolean ?: false
      break
    } catch (_: Exception) {}
  }
  for (name in arrayOf("getWeatherType", "getEWeatherType")) {
    try {
      val v = cls.getMethod(name).invoke(util)
      unit = if (v?.toString()?.contains("F", ignoreCase = true) == true) "F" else "C"
      break
    } catch (_: Exception) {}
  }
  for (name in arrayOf("getWeatherCrc", "getWeatherCRC")) {
    try {
      crc = (cls.getMethod(name).invoke(util) as? Number)?.toInt() ?: 0
      break
    } catch (_: Exception) {}
  }
  return mapOf("isOpen" to isOpen, "unit" to unit, "crc" to crc)
}

fun ModuleDefinitionBuilder.defineWeather(module: VeepooSDKModule) {
  AsyncFunction("readWeatherSettings") { promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    val ctx = module.appContext.reactContext ?: run {
      promise.reject("CONTEXT_ERROR", "Cannot get app context", null)
      return@AsyncFunction
    }
    val util = VpSpGetUtil.getVpSpVariInstance(ctx)

    // Guard: weatherFunction capability flag
    val weatherFunctions = module.cachedDeviceFunctions["pkg1"]
    val weatherFlag = weatherFunctions?.get("weatherFunction") as? String
    if (weatherFlag != null && weatherFlag == "unsupported") {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support weather function", null)
      return@AsyncFunction
    }

    // Android SDK does not document a standalone readWeatherInfo; read from cached VpSpGetUtil state.
    // The state is populated by the SDK after password verification / deviceReady.
    promise.resolve(readCachedWeatherState(util))
  }

  AsyncFunction("setWeatherSettings") { settings: Map<String, Any?>, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    val ctx = module.appContext.reactContext ?: run {
      promise.reject("CONTEXT_ERROR", "Cannot get app context", null)
      return@AsyncFunction
    }

    val weatherFunctions = module.cachedDeviceFunctions["pkg1"]
    val weatherFlag = weatherFunctions?.get("weatherFunction") as? String
    if (weatherFlag != null && weatherFlag == "unsupported") {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support weather function", null)
      return@AsyncFunction
    }

    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    val isOpen = settings["isOpen"] as? Boolean ?: false
    val unitRaw = (settings["unit"] as? String)?.uppercase() ?: "C"
    val unit = if (unitRaw == "F") EWeatherType.F else EWeatherType.C
    val crc = (settings["crc"] as? Number)?.toInt() ?: 0
    val statusSetting = WeatherStatusSetting(crc, isOpen, unit)
    var done = false
    manager.settingWeatherStatusInfo(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) Log.e(TAG, "setWeatherSettings: write code=$code")
        }
      },
      statusSetting,
      object : IWeatherStatusDataListener {
        override fun onWeatherDataChange(data: WeatherStatusData) {
          if (done) return
          when (data.oprate) {
            EWeatherOprateStatus.SETTING_STATUS_SUCCESS -> {
              done = true
              promise.resolve(null)
            }
            EWeatherOprateStatus.SETTING_STATUS_FAIL -> {
              done = true
              promise.reject("OPERATION_FAILED", "Set weather settings failed", null)
            }
            else -> {}
          }
        }
      }
    )
  }

  AsyncFunction("pushWeatherData") { data: Map<String, Any?>, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }

    val weatherFunctions = module.cachedDeviceFunctions["pkg1"]
    val weatherFlag = weatherFunctions?.get("weatherFunction") as? String
    if (weatherFlag != null && weatherFlag == "unsupported") {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support weather function", null)
      return@AsyncFunction
    }

    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    val weatherData = try {
      buildWeatherDataFromMap(data)
    } catch (e: IllegalArgumentException) {
      promise.reject("INVALID_ARGUMENT", e.message ?: "Invalid weather data", null)
      return@AsyncFunction
    }
    var done = false
    manager.settingWeatherData(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) Log.e(TAG, "pushWeatherData: write code=$code")
        }
      },
      weatherData,
      object : IWeatherStatusDataListener {
        override fun onWeatherDataChange(data: WeatherStatusData) {
          if (done) return
          when (data.oprate) {
            EWeatherOprateStatus.SETTING_CONTENT_SUCCESS -> {
              done = true
              promise.resolve(null)
            }
            EWeatherOprateStatus.SETTING_CONTENT_FAIL -> {
              done = true
              promise.reject("OPERATION_FAILED", "Push weather data to Band failed", null)
            }
            else -> {}
          }
        }
      }
    )
  }
}
