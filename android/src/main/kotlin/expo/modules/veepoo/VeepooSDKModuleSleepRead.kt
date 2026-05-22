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

fun ModuleDefinitionBuilder.defineSleepRead(module: VeepooSDKModule) {
  AsyncFunction("readSleepData") { date: String?, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    
    Log.d(TAG, "readSleepData: reading sleep data")
    
    val isPromiseResolved = java.util.concurrent.atomic.AtomicBoolean(false)
    var timeoutRunnable: Runnable? = null
    
    fun createEmptySleepResult(): List<Map<String, Any>> = listOf(mapOf(
      "date" to (date ?: ""),
      "items" to emptyList<Any>(),
      "summary" to mapOf(
        "totalDeepSleepMinutes" to 0,
        "totalLightSleepMinutes" to 0,
        "totalSleepMinutes" to 0,
        "averageSleepQuality" to 0,
        "totalWakeUpCount" to 0
      )
    ))
    
    fun resolveSleepOnce(result: List<Map<String, Any>>) {
      if (isPromiseResolved.compareAndSet(false, true)) {
        timeoutRunnable?.let { module.mainHandler.removeCallbacks(it) }
        promise.resolve(result)
      }
    }
    
    timeoutRunnable = Runnable {
      Log.w(TAG, "readSleepData: timeout, returning empty result")
      resolveSleepOnce(createEmptySleepResult())
    }
    module.mainHandler.postDelayed(timeoutRunnable!!, 15000)
    
    manager.readSleepData(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) {
            Log.e(TAG, "readSleepData: command failed with code $code, returning empty result")
            resolveSleepOnce(createEmptySleepResult())
          }
        }
      },
      object : ISleepDataListener {
        override fun onSleepDataChange(day: String?, sleepData: SleepData?) {
          if (sleepData != null) {
            Log.d(TAG, "onSleepDataChange: day=$day, allSleepTime=${sleepData.allSleepTime}")
            
            var sleepDownStr = ""
            if (sleepData.sleepDown != null) {
              sleepDownStr = String.format("%04d-%02d-%02d %02d:%02d:%02d",
                sleepData.sleepDown.year,
                sleepData.sleepDown.month,
                sleepData.sleepDown.day,
                sleepData.sleepDown.hour,
                sleepData.sleepDown.minute,
                sleepData.sleepDown.second
              )
            }
            
            var sleepUpStr = ""
            if (sleepData.sleepUp != null) {
              sleepUpStr = String.format("%04d-%02d-%02d %02d:%02d:%02d",
                sleepData.sleepUp.year,
                sleepData.sleepUp.month,
                sleepData.sleepUp.day,
                sleepData.sleepUp.hour,
                sleepData.sleepUp.minute,
                sleepData.sleepUp.second
              )
            }
            
            val deepSleepMinutes = sleepData.deepSleepTime
            val lightSleepMinutes = sleepData.lowSleepTime
            val totalSleepMinutes = sleepData.allSleepTime
            val sleepQuality = sleepData.sleepQulity
            val wakeUpCount = sleepData.wakeCount
            
            val item = mapOf(
              "date" to (sleepData.date ?: ""),
              "sleepTime" to sleepDownStr,
              "wakeTime" to sleepUpStr,
              "deepSleepMinutes" to deepSleepMinutes,
              "lightSleepMinutes" to lightSleepMinutes,
              "totalSleepMinutes" to totalSleepMinutes,
              "sleepQuality" to sleepQuality,
              "sleepLine" to (sleepData.sleepLine ?: ""),
              "wakeUpCount" to wakeUpCount
            )
            
            val items = listOf(item)
            
            val summary = mapOf(
              "totalDeepSleepMinutes" to deepSleepMinutes,
              "totalLightSleepMinutes" to lightSleepMinutes,
              "totalSleepMinutes" to totalSleepMinutes,
              "averageSleepQuality" to sleepQuality,
              "totalWakeUpCount" to wakeUpCount
            )
            
            val result = mapOf(
              "date" to (sleepData.date ?: ""),
              "items" to items,
              "summary" to summary
            )
            
            val resultList = listOf(result)
            
            module.sendEvent(SLEEP_DATA, mapOf(
              "deviceId" to (module.connectedDeviceId ?: ""),
              "date" to (sleepData.date ?: ""),
              "data" to resultList
            ))
            
            resolveSleepOnce(resultList)
          } else {
            Log.d(TAG, "onSleepDataChange: sleepData is null")
            resolveSleepOnce(createEmptySleepResult())
          }
        }
        
        override fun onSleepProgress(progress: Float) {
          Log.d(TAG, "onSleepProgress: $progress")
        }
        
        override fun onSleepProgressDetail(day: String?, progress: Int) {
          Log.d(TAG, "onSleepProgressDetail: day=$day, progress=$progress")
        }
        
        override fun onReadSleepComplete() {
          Log.d(TAG, "onReadSleepComplete")
        }
      },
      module.watchday
    )
  }

}
