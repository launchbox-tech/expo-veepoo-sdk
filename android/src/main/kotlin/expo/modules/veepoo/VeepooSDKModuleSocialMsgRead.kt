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
            
            val result = mapOf(
              "phone" to toSupportedStatus(data.phone),
              "sms" to toSupportedStatus(data.msg),
              "wechat" to toSupportedStatus(data.wechat),
              "qq" to toSupportedStatus(data.qq),
              "facebook" to toSupportedStatus(data.facebook),
              "twitter" to toSupportedStatus(data.twitter),
              "instagram" to toSupportedStatus(data.instagram),
              "linkedin" to toSupportedStatus(data.linkin),
              "whatsapp" to toSupportedStatus(data.whats),
              "line" to toSupportedStatus(data.line),
              "skype" to toSupportedStatus(data.skype),
              "email" to toSupportedStatus(data.gmail),
              "other" to toSupportedStatus(data.other)
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
