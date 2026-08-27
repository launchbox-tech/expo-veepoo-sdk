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

fun ModuleDefinitionBuilder.defineSocialMsgRead(module: VeepooSDKModule) {
  AsyncFunction("readSocialMsgData") { promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    
    Log.d(TAG, "readSocialMsgData: reading social message data")
    
    manager.readSocialMsg(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) {
            Log.e(TAG, "readSocialMsgData: command failed with code $code")
          }
        }
      },
      object : ISocialMsgDataListener {
        override fun onSocialMsgSupportDataChange(data: FunctionSocailMsgData?) {
          if (data != null) {
            module.cachedSocialMsgData = data
            Log.d(TAG, "readSocialMsgData: received social message data")
            
            // Every FunctionSocailMsgData field is the vendor's EFunctionStatus
            // enum, so it must go through toFunctionStatus — the older
            // toSupportedStatus could not read an enum and answered
            // "unsupported" for all 13 channels whatever the band said (#212).
            val result = mapOf(
              "phone" to toFunctionStatus(data.phone),
              "sms" to toFunctionStatus(data.msg),
              "wechat" to toFunctionStatus(data.wechat),
              "qq" to toFunctionStatus(data.qq),
              "facebook" to toFunctionStatus(data.facebook),
              "twitter" to toFunctionStatus(data.twitter),
              "instagram" to toFunctionStatus(data.instagram),
              "linkedin" to toFunctionStatus(data.linkin),
              "whatsapp" to toFunctionStatus(data.whats),
              "line" to toFunctionStatus(data.line),
              "skype" to toFunctionStatus(data.skype),
              "email" to toFunctionStatus(data.gmail),
              "other" to toFunctionStatus(data.other)
            )
            
            module.sendEvent(SOCIAL_MSG_DATA, mapOf(
              "deviceId" to (module.connectedDeviceId ?: ""),
              "data" to result
            ))
            
            promise.resolve(result)
          } else {
            Log.d(TAG, "readSocialMsgData: data is null")
            promise.reject("READ_FAILED", "Social message data is null", null)
          }
        }
        
        override fun onSocialMsgSupportDataChange2(data: FunctionSocailMsgData?) {
          if (data != null) {
            Log.d(TAG, "readSocialMsgData: received social message data (callback 2)")
          }
        }
      }
    )
  }

}
