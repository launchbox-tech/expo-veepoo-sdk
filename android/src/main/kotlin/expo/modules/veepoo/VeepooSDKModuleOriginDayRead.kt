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

fun ModuleDefinitionBuilder.defineOriginDayRead(module: VeepooSDKModule) {
  AsyncFunction("readOriginData") { dayOffset: Int, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    
    val availableDays = maxOf(module.watchday, 1)
    val safeDayOffset = dayOffset.coerceAtLeast(0)
    Log.d(TAG, "readOriginData: requested dayOffset=$dayOffset, safeDayOffset=$safeDayOffset, watchday=$availableDays")
    
    manager.readOriginDataSingleDay(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) {
            Log.e(TAG, "readOriginData: command failed with code $code")
          }
        }
      },
      object : IOriginData3Listener {
        private val dataList = mutableListOf<Map<String, Any>>()
        
        override fun onOriginFiveMinuteListDataChange(dataList3: List<OriginData3>?) {
          if (dataList3 != null && dataList3.isNotEmpty()) {
            Log.d(TAG, "onOriginFiveMinuteListDataChange: ${dataList3.size} records")
            
            for (data in dataList3) {
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
                
                dataList.add(item)
              }
            }
          }
        }
        
        override fun onOriginHalfHourDataChange(data: OriginHalfHourData?) {}
        
        override fun onOriginHRVOriginListDataChange(dataList: List<HRVOriginData>?) {}
        
        override fun onOriginSpo2OriginListDataChange(spo2List: List<Spo2hOriginData>?) {
          if (spo2List != null && spo2List.isNotEmpty()) {
            Log.d(TAG, "readOriginData: onOriginSpo2OriginListDataChange: ${spo2List.size} records")
            
            try {
              val items = mutableListOf<Map<String, Any>>()
              
              for (data in spo2List) {
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
              Log.e(TAG, "Error processing SPO2 origin data in readOriginData", e)
            }
          }
        }
        
        override fun onReadOriginProgressDetail(day: Int, date: String?, allPack: Int, currentPack: Int) {}
        
        override fun onReadOriginProgress(progress: Float) {}
        
        override fun onReadOriginComplete() {
          Log.d(TAG, "readOriginData complete: ${dataList.size} records")
          val sortedList = dataList.sortedBy { it["time"] as? String ?: "" }
          promise.resolve(sortedList)
        }
      },
      safeDayOffset,
      1,
      availableDays
    )
  }

}
