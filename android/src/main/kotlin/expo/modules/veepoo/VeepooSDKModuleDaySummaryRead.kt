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

fun ModuleDefinitionBuilder.defineDaySummaryRead(module: VeepooSDKModule) {
  AsyncFunction("readDaySummaryData") { dayOffset: Int, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    
    Log.d(TAG, "readDaySummaryData: reading day summary data for dayOffset=$dayOffset")
    
    val calendar = java.util.Calendar.getInstance()
    calendar.add(java.util.Calendar.DAY_OF_MONTH, -dayOffset)
    val dateFormat = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault())
    val dateStr = dateFormat.format(calendar.time)
    
    val sportList = mutableListOf<Map<String, Any>>()
    val rateList = mutableListOf<Map<String, Any>>()
    val bpList = mutableListOf<Map<String, Any>>()
    var allStep = 0
    
    val isPromiseResolved = java.util.concurrent.atomic.AtomicBoolean(false)
    var timeoutRunnable: Runnable? = null
    
    fun resolveOnce(result: Map<String, Any>) {
      if (isPromiseResolved.compareAndSet(false, true)) {
        timeoutRunnable?.let { module.mainHandler.removeCallbacks(it) }
        promise.resolve(result)
      }
    }
    
    timeoutRunnable = Runnable {
      Log.w(TAG, "readDaySummaryData: timeout, returning collected data")
      val result = mapOf(
        "date" to dateStr,
        "allStep" to allStep,
        "sportList" to sportList.toList(),
        "rateList" to rateList.toList(),
        "bpList" to bpList.toList()
      )
      resolveOnce(result)
    }
    module.mainHandler.postDelayed(timeoutRunnable!!, 20000)
    
    val availableDays = maxOf(module.watchday, 1)
    val safeDayOffset = dayOffset.coerceAtLeast(0)

    manager.readOriginDataSingleDay(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) {
            Log.e(TAG, "readDaySummaryData: command failed with code $code")
          }
        }
      },
      object : IOriginData3Listener {
        override fun onOriginFiveMinuteListDataChange(dataList3: MutableList<OriginData3>?) {}
        
        override fun onOriginHalfHourDataChange(data: OriginHalfHourData?) {
          if (data != null) {
            allStep = data.allStep
            
            data.halfHourSportDatas?.forEach { sport ->
              val time = sport.time
              if (time != null) {
                sportList.add(mapOf(
                  "time" to String.format("%02d:%02d", time.hour, time.minute),
                  "step" to sport.stepValue,
                  "cal" to sport.calValue,
                  "dis" to sport.disValue
                ))
              }
            }
            
            data.halfHourRateDatas?.forEach { rate ->
              val time = rate.time
              if (time != null) {
                rateList.add(mapOf(
                  "time" to String.format("%02d:%02d", time.hour, time.minute),
                  "rate" to rate.rateValue
                ))
              }
            }
            
            data.halfHourBps?.forEach { bp ->
              val time = bp.time
              if (time != null) {
                bpList.add(mapOf(
                  "time" to String.format("%02d:%02d", time.hour, time.minute),
                  "high" to bp.highValue,
                  "low" to bp.lowValue
                ))
              }
            }
          }
        }
        
        override fun onOriginHRVOriginListDataChange(dataList: MutableList<HRVOriginData>?) {}
        
        override fun onOriginSpo2OriginListDataChange(dataList: MutableList<Spo2hOriginData>?) {}
        
        override fun onReadOriginProgressDetail(day: Int, date: String?, allPack: Int, currentPack: Int) {}
        
        override fun onReadOriginProgress(progress: Float) {}
        
        override fun onReadOriginComplete() {
          Log.d(TAG, "readDaySummaryData complete: allStep=$allStep, sportList=${sportList.size}, rateList=${rateList.size}, bpList=${bpList.size}")
          
          val sortedSportList = sportList.sortedBy { it["time"] as? String ?: "" }
          val sortedRateList = rateList.sortedBy { it["time"] as? String ?: "" }
          val sortedBpList = bpList.sortedBy { it["time"] as? String ?: "" }
          
          val result = mapOf(
            "date" to dateStr,
            "allStep" to allStep,
            "sportList" to sortedSportList,
            "rateList" to sortedRateList,
            "bpList" to sortedBpList
          )
          resolveOnce(result)
        }
      },
      safeDayOffset,
      1,
      availableDays
    )
  }
}
