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

fun ModuleDefinitionBuilder.defineOriginRead(module: VeepooSDKModule) {
  AsyncFunction("startReadOriginData") { promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    
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
          if (code == Code.REQUEST_SUCCESS) {
            Log.d(TAG, "startReadOriginData: command sent successfully")
          } else {
            Log.e(TAG, "startReadOriginData: command failed with code $code")
          }
        }
      },
      object : IOriginData3Listener {
        private val resolved = java.util.concurrent.atomic.AtomicBoolean(false)

        override fun onOriginFiveMinuteListDataChange(dataList3: List<OriginData3>?) {
          if (dataList3 != null && dataList3.isNotEmpty()) {
            Log.d(TAG, "onOriginFiveMinuteListDataChange: ${dataList3.size} records")
            
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
                Log.e(TAG, "Error processing 5-minute data item", e)
              }
            }
          }
        }
        
        override fun onOriginHalfHourDataChange(data: OriginHalfHourData?) {
          try {
            if (data != null) {
              val items = buildHalfHourItems(data)
              for (item in items) {
                module.sendEvent(ORIGIN_HALF_HOUR_DATA, mapOf(
                  "deviceId" to (module.connectedDeviceId ?: ""),
                  "data" to item
                ))
              }
            }
          } catch (e: Exception) {
            Log.e(TAG, "Error in onOriginHalfHourDataChange", e)
            module.sendEvent(ERROR, mapOf(
              "code" to "ORIGIN_DATA_ERROR",
              "message" to (e.message ?: "Unknown error processing origin data"),
              "deviceId" to (module.connectedDeviceId ?: "")
            ))
          }
        }
        
        override fun onOriginHRVOriginListDataChange(dataList: List<HRVOriginData>?) {
          if (dataList != null && dataList.isNotEmpty()) {
            Log.d(TAG, "onOriginHRVOriginListDataChange: ${dataList.size} records")
          }
        }
        
        override fun onOriginSpo2OriginListDataChange(dataList: List<Spo2hOriginData>?) {
          if (dataList != null && dataList.isNotEmpty()) {
            Log.d(TAG, "onOriginSpo2OriginListDataChange: ${dataList.size} records")
            
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
              Log.e(TAG, "Error processing SPO2 origin data", e)
            }
          }
        }
        
        override fun onReadOriginProgressDetail(day: Int, date: String?, allPack: Int, currentPack: Int) {
          try {
            val dayProgress = (if (allPack > 0) currentPack.toDouble() / allPack.toDouble() else 0.0)
              .coerceIn(0.0, 1.0)
            val currentDay = (day + 1).coerceIn(1, availableDays)
            val overallProgress = ((currentDay - 1) + dayProgress) / availableDays.toDouble()
            Log.d(TAG, "onReadOriginProgressDetail: day=$day, dayProgress=$dayProgress, overallProgress=$overallProgress")
            
            module.sendEvent(READ_ORIGIN_PROGRESS, mapOf(
              "deviceId" to (module.connectedDeviceId ?: ""),
              "progress" to mapOf(
                "readState" to "reading",
                "totalDays" to availableDays,
                "currentDay" to currentDay,
                "progress" to overallProgress.coerceIn(0.0, 1.0)
              )
            ))
          } catch (e: Exception) {
            Log.e(TAG, "Error in onReadOriginProgressDetail", e)
          }
        }
        
        override fun onReadOriginProgress(progress: Float) {
          try {
            var p = progress.toDouble()
            if (p > 1.0) p /= 100.0
            p = p.coerceIn(0.0, 1.0)
            val currentDay = kotlin.math.floor(p * availableDays).toInt().plus(1).coerceIn(1, availableDays)
            
            Log.d(TAG, "onReadOriginProgress: $p")
            
            module.sendEvent(READ_ORIGIN_PROGRESS, mapOf(
              "deviceId" to (module.connectedDeviceId ?: ""),
              "progress" to mapOf(
                "readState" to "reading",
                "totalDays" to availableDays,
                "currentDay" to currentDay,
                "progress" to p
              )
            ))
          } catch (e: Exception) {
            Log.e(TAG, "Error in onReadOriginProgress", e)
          }
        }
        
        override fun onReadTimeout(seconds: Int) {
          Log.w(TAG, "onReadTimeout: device reported read timeout (${seconds}s)")
          if (resolved.compareAndSet(false, true)) promise.resolve(null)
        }

        override fun onReadOriginComplete() {
          try {
            Log.d(TAG, "onReadOriginComplete")

            module.sendEvent(READ_ORIGIN_PROGRESS, mapOf(
              "deviceId" to (module.connectedDeviceId ?: ""),
              "progress" to mapOf(
                "readState" to "complete",
                "totalDays" to availableDays,
                "currentDay" to availableDays,
                "progress" to 1.0
              )
            ))
            
            module.sendEvent(READ_ORIGIN_COMPLETE, mapOf(
              "deviceId" to (module.connectedDeviceId ?: ""),
              "success" to true
            ))

            if (resolved.compareAndSet(false, true)) promise.resolve(null)
          } catch (e: Exception) {
            Log.e(TAG, "Error in onReadOriginComplete", e)
            module.sendEvent(READ_ORIGIN_COMPLETE, mapOf(
              "deviceId" to (module.connectedDeviceId ?: ""),
              "success" to false
            ))
            if (resolved.compareAndSet(false, true)) promise.resolve(null)
          }
        }
      },
      availableDays
    )
  }

}
