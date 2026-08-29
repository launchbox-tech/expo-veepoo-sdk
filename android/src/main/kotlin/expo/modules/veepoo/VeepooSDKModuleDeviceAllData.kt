package expo.modules.veepoo

import android.util.Log
import com.inuker.bluetooth.library.Code
import com.veepoo.protocol.VPOperateManager
import com.veepoo.protocol.listener.base.IBleWriteResponse
import com.veepoo.protocol.listener.data.*
import com.veepoo.protocol.model.datas.*
import com.veepoo.protocol.model.enums.EOprateStauts
import com.veepoo.protocol.model.enums.ESex
import com.veepoo.protocol.model.settings.*
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

fun ModuleDefinitionBuilder.defineReadDeviceAllData(module: VeepooSDKModule) {
  // iOS-only for now: Android's vendor protocol streams via listeners and has
  // no equivalent local-DB table getters to dump (cross-platform rule:
  // reject CAPABILITY_UNSUPPORTED when no vendor entry point exists).
  //
  // On the per-bucket "was this on a wrist" flag that iOS now passes through
  // verbatim: nothing is missing from the Android data itself.
  // `com.veepoo.protocol.model.datas.OriginData` carries `private int wear`,
  // so the field arrives for free the day this dump has an entry point to
  // build on. Note the spelling differs by platform and neither is renamed:
  // Android's model field is lowercase `wear`, while iOS's stored row uses the
  // vendor's capital `Wear`. What is missing here is the dump, not the field.
  //
  // Do NOT paper over that by synthesising `wear` from `readDeviceAllData`'s
  // listener stream — that is a different read path with a different shape,
  // and a partial dump that looks whole is exactly the failure this bridge
  // keeps hitting. Gap recorded in docs/vendor-api/vendor-parity-matrix.md.
  AsyncFunction("readOriginRawDump") { _: Int, promise: Promise ->
    promise.reject("CAPABILITY_UNSUPPORTED", "readOriginRawDump is iOS-only (no Android vendor DB getters)", null)
  }

  AsyncFunction("readDeviceAllData") { promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    
    Log.d(TAG, "readDeviceAllData: starting to read all device data")
    
    val availableDays = maxOf(module.watchday, 1)

    module.sendEvent(READ_ORIGIN_PROGRESS, mapOf(
      "deviceId" to (module.connectedDeviceId ?: ""),
      "progress" to mapOf(
        "readState" to "start",
        "totalDays" to availableDays,
        "currentDay" to 1,
        "progress" to 0.0
      )
    ))
    
    manager.readOriginData(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) {
            Log.e(TAG, "readDeviceAllData: command failed with code $code")
          }
        }
      },
      object : IOriginData3Listener {
        private val settled = java.util.concurrent.atomic.AtomicBoolean(false)

        override fun onOriginFiveMinuteListDataChange(dataList3: List<OriginData3>?) {
          if (dataList3 != null && dataList3.isNotEmpty()) {
            Log.d(TAG, "readDeviceAllData: onOriginFiveMinuteListDataChange: ${dataList3.size} records")
            
            for (data in dataList3) {
              try {
                val timeData = data.getmTime()
                if (timeData != null) {
                  val timeStr = String.format("%02d:%02d", timeData.hour, timeData.minute)
                  
                  val item = mutableMapOf<String, Any>(
                    "time" to timeStr,
                    "heartValue" to data.rateValue,
                    "stepValue" to data.stepValue,
                    "calValue" to data.calValue,
                    "disValue" to data.disValue,
                    "sportValue" to data.sportValue,
                    "systolic" to data.highValue,
                    "diastolic" to data.lowValue,
                    "spo2Value" to (data.oxygens?.maxOrNull() ?: 0),
                    "tempValue" to data.temperature,
                    "stressValue" to data.pressure,
                    "met" to data.met.toDouble()
                  )
                  
                  data.oxygens?.toList()?.let { item["oxygens"] = it }
                  data.ppgs?.toList()?.let { item["ppgs"] = it }
                  data.ecgs?.toList()?.let { item["ecgs"] = it }
                  data.resRates?.toList()?.let { item["resRates"] = it }
                  data.sleepStates?.toList()?.let { item["sleepStates"] = it }
                  data.apneaResults?.toList()?.let { item["apneaResults"] = it }
                  data.hypoxiaTimes?.toList()?.let { item["hypoxiaTimes"] = it }
                  data.cardiacLoads?.toList()?.let { item["cardiacLoads"] = it }
                  data.bloodGlucose.let { 
                    item["bloodGlucose"] = it
                    item["glucose"] = it.toDouble()
                  }
                  
                  module.sendEvent(ORIGIN_FIVE_MINUTE_DATA, mapOf(
                    "deviceId" to (module.connectedDeviceId ?: ""),
                    "data" to item
                  ))
                }
              } catch (e: Exception) {
                Log.e(TAG, "Error processing 5-minute data item in readDeviceAllData", e)
              }
            }
          }
        }
        
        override fun onOriginHalfHourDataChange(data: OriginHalfHourData?) {
          if (data != null) {
            val items = buildHalfHourItems(data)
            for (item in items) {
              module.sendEvent(ORIGIN_HALF_HOUR_DATA, mapOf(
                "deviceId" to (module.connectedDeviceId ?: ""),
                "data" to item
              ))
            }
          }
        }
        
        override fun onOriginHRVOriginListDataChange(dataList: List<HRVOriginData>?) {}
        
        override fun onOriginSpo2OriginListDataChange(dataList: List<Spo2hOriginData>?) {
          if (dataList != null && dataList.isNotEmpty()) {
            Log.d(TAG, "readDeviceAllData: onOriginSpo2OriginListDataChange: ${dataList.size} records")
            
            try {
              val items = mutableListOf<Map<String, Any>>()
              
              for (data in dataList) {
                val timeData = data.getmTime()
                val timeStr = if (timeData != null) {
                  String.format("%02d:%02d", timeData.hour, timeData.minute)
                } else {
                  ""
                }
                
                val item = mutableMapOf<String, Any>(
                  "time" to timeStr,
                  "date" to (data.date ?: ""),
                  "heartValue" to data.heartValue,
                  "value" to data.oxygenValue,
                  "rate" to data.respirationRate,
                  "isHypoxia" to data.isHypoxia,
                  "cardiacLoad" to data.cardiacLoad,
                  "temp1" to data.temp1,
                  "sportValue" to data.sportValue,
                  "apneaResult" to data.apneaResult,
                  "hypoxiaTime" to data.hypoxiaTime,
                  "hypopnea" to data.hypopnea,
                  "stepValue" to data.stepValue,
                  "allPackNumber" to data.allPackNumner,
                  "currentPackNumber" to data.currentPackNumber
                )
                
                items.add(item)
              }
              
              module.sendEvent(ORIGIN_SPO2_DATA, mapOf(
                "deviceId" to (module.connectedDeviceId ?: ""),
                "data" to items
              ))
            } catch (e: Exception) {
              Log.e(TAG, "Error processing SPO2 origin data in readDeviceAllData", e)
            }
          }
        }
        
        override fun onReadOriginProgressDetail(day: Int, date: String?, allPack: Int, currentPack: Int) {
          val dayProgress = (if (allPack > 0) currentPack.toDouble() / allPack.toDouble() else 0.0)
            .coerceIn(0.0, 1.0)
          val currentDay = (day + 1).coerceIn(1, availableDays)
          val overallProgress = ((currentDay - 1) + dayProgress) / availableDays.toDouble()
          Log.d(TAG, "readDeviceAllData: onReadOriginProgressDetail: day=$day, dayProgress=$dayProgress, overallProgress=$overallProgress")
          
          module.sendEvent(READ_ORIGIN_PROGRESS, mapOf(
            "deviceId" to (module.connectedDeviceId ?: ""),
            "progress" to mapOf(
              "readState" to "reading",
              "totalDays" to availableDays,
              "currentDay" to currentDay,
              "progress" to (overallProgress.coerceIn(0.0, 1.0) * 100).toInt()
            )
          ))
        }
        
        override fun onReadOriginProgress(progress: Float) {
          var p = progress.toDouble()
          if (p <= 1.0) p *= 100.0
          p = p.coerceIn(0.0, 100.0)
          val dayProgress = p / 100.0
          val currentDay = kotlin.math.floor(dayProgress * availableDays).toInt().plus(1).coerceIn(1, availableDays)

          Log.d(TAG, "readDeviceAllData: onReadOriginProgress: $p")

          module.sendEvent(READ_ORIGIN_PROGRESS, mapOf(
            "deviceId" to (module.connectedDeviceId ?: ""),
            "progress" to mapOf(
              "readState" to "reading",
              "totalDays" to availableDays,
              "currentDay" to currentDay,
              "progress" to p.toInt()
            )
          ))
        }

        override fun onReadTimeout(seconds: Int) {
          Log.w(TAG, "readDeviceAllData: device reported read timeout (${seconds}s)")
          if (settled.compareAndSet(false, true)) promise.resolve(false)
        }

        override fun onReadOriginComplete() {
          Log.d(TAG, "readDeviceAllData: onReadOriginComplete")

          module.sendEvent(READ_ORIGIN_PROGRESS, mapOf(
            "deviceId" to (module.connectedDeviceId ?: ""),
            "progress" to mapOf(
              "readState" to "complete",
              "totalDays" to availableDays,
              "currentDay" to availableDays,
              "progress" to 100
            )
          ))
          
          module.sendEvent(READ_ORIGIN_COMPLETE, mapOf(
            "deviceId" to (module.connectedDeviceId ?: ""),
            "success" to true
          ))

          if (settled.compareAndSet(false, true)) promise.resolve(true)
        }
      },
      availableDays
    )
  }

}
