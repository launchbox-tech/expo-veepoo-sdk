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

fun ModuleDefinitionBuilder.definePersonalInfo(module: VeepooSDKModule) {
  AsyncFunction("syncPersonalInfo") { info: Map<String, Any?>, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    
    val sex = (info["sex"] as? Number)?.toInt() ?: 1
    val height = (info["height"] as? Number)?.toInt() ?: 170
    val weight = (info["weight"] as? Number)?.toInt() ?: 65
    val age = (info["age"] as? Number)?.toInt() ?: 25
    val stepAim = (info["stepAim"] as? Number)?.toInt() ?: 8000
    val sleepAim = (info["sleepAim"] as? Number)?.toInt() ?: 480
    
    val eSex = if (sex == 1) ESex.MAN else ESex.WOMEN
    val personalInfo = PersonInfoData(eSex, height, weight, age, stepAim, sleepAim)
    
    manager.syncPersonInfo(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) {
            promise.reject("CMD_FAILED", "Sync person info failed: $code", null)
          }
        }
      },
      object : IPersonInfoDataListener {
        override fun OnPersoninfoDataChange(status: EOprateStauts?) {
          if (status == EOprateStauts.OPRATE_SUCCESS) {
            promise.resolve(true)
          } else {
            promise.reject("SYNC_FAILED", "Sync failed: $status", null)
          }
        }
      },
      personalInfo
    )
  }

}
