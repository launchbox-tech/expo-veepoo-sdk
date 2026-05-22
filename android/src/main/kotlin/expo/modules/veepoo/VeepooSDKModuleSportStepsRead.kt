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

fun ModuleDefinitionBuilder.defineSportStepsRead(module: VeepooSDKModule) {
  AsyncFunction("readSportStepData") { date: String?, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    
    Log.d(TAG, "readSportStepData: reading sport step data")
    
    val isPromiseResolved = java.util.concurrent.atomic.AtomicBoolean(false)
    var timeoutRunnable: Runnable? = null
    
    fun createEmptySportResult(): Map<String, Any> = mapOf(
      "date" to (date ?: ""),
      "stepCount" to 0,
      "distance" to 0.0,
      "calories" to 0.0
    )
    
    fun resolveSportOnce(result: Map<String, Any>) {
      if (isPromiseResolved.compareAndSet(false, true)) {
        timeoutRunnable?.let { module.mainHandler.removeCallbacks(it) }
        promise.resolve(result)
      }
    }
    
    timeoutRunnable = Runnable {
      Log.w(TAG, "readSportStepData: timeout, returning empty result")
      resolveSportOnce(createEmptySportResult())
    }
    module.mainHandler.postDelayed(timeoutRunnable!!, 15000)
    
    manager.readSportStep(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) {
            Log.e(TAG, "readSportStepData: command failed with code $code, returning empty result")
            resolveSportOnce(createEmptySportResult())
          }
        }
      },
      object : ISportDataListener {
        override fun onSportDataChange(sportData: SportData?) {
          if (sportData != null) {
            Log.d(TAG, "onSportDataChange: step=${sportData.step}, dis=${sportData.dis}, kcal=${sportData.kcal}")
            
            val result = mapOf(
              "date" to (date ?: ""),
              "stepCount" to sportData.step,
              "distance" to sportData.dis,
              "calories" to sportData.kcal
            )
            
            module.sendEvent(SPORT_STEP_DATA, mapOf(
              "deviceId" to (module.connectedDeviceId ?: ""),
              "date" to (date ?: ""),
              "data" to result
            ))
            
            resolveSportOnce(result)
          } else {
            Log.d(TAG, "onSportDataChange: sportData is null")
            resolveSportOnce(createEmptySportResult())
          }
        }
      }
    )
  }

}
