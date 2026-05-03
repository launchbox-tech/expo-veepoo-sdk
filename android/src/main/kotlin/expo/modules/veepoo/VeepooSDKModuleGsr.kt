package expo.modules.veepoo

import com.inuker.bluetooth.library.Code
import com.inuker.bluetooth.library.connect.response.BleWriteResponse
import com.veepoo.protocol.VPOperateManager
import com.veepoo.protocol.listener.data.IGsrDetectListener
import com.veepoo.protocol.model.datas.GsrDetectResult
import com.veepoo.protocol.model.enums.GsrDetectAck
import com.veepoo.protocol.shareprence.VpSpGetUtil
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

private fun emitGsrResult(module: VeepooSDKModule, state: String, progress: Int, result: GsrDetectResult?) {
    module.sendEvent(GSR_TEST_RESULT, mapOf(
        "deviceId" to (module.connectedDeviceId ?: ""),
        "result" to mapOf(
            "state" to state,
            "progress" to progress,
            "emotionLevel" to result?.emotionLevel,
            "skinMoisture" to result?.skinMoisture,
            "snsActivation" to result?.snsActivation,
            "cortisolValue" to result?.cortisolValue
        )
    ))
}

fun ModuleDefinitionBuilder.defineGsr(module: VeepooSDKModule) {

    AsyncFunction("startGsrTest") { promise: Promise ->
        if (!module.tryBeginRealtimeTest("gsr", promise)) return@AsyncFunction
        val ctx = module.context
        if (!VpSpGetUtil.getVpSpVariInstance(ctx).isSupportGSR()) {
            module.endRealtimeTest("gsr")
            promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support GSR", null)
            return@AsyncFunction
        }
        val manager = VPOperateManager.getInstance() ?: run {
            module.endRealtimeTest("gsr")
            promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
            return@AsyncFunction
        }
        val listener = object : IGsrDetectListener {
            override fun onGsrDetectProgress(progress: Int) {
                emitGsrResult(module, "testing", progress, null)
            }
            override fun onGsrDetectSuccess(result: GsrDetectResult?) {
                emitGsrResult(module, "over", 100, result)
                module.endRealtimeTest("gsr")
            }
            override fun onGsrDetectFailed(ack: GsrDetectAck?) {
                val label = when (ack) {
                    GsrDetectAck.LOW_BATTERY -> "error"
                    GsrDetectAck.BUSY_MEASURING_PRESSURE, GsrDetectAck.BUSY_MEASURING_OTHER -> "deviceBusy"
                    GsrDetectAck.WEARING_CHECK_FAILED -> "notWear"
                    else -> "error"
                }
                emitGsrResult(module, label, 0, null)
                module.endRealtimeTest("gsr")
            }
            override fun onGsrDetectStop() {
                emitGsrResult(module, "over", 0, null)
                module.endRealtimeTest("gsr")
            }
        }
        manager.startDetectGsr(
            object : BleWriteResponse {
                override fun onResponse(code: Int) {
                    if (code == Code.REQUEST_SUCCESS) {
                        promise.resolve(null)
                    } else {
                        module.endRealtimeTest("gsr")
                        promise.reject("START_FAILED", "Start GSR failed: $code", null)
                    }
                }
            },
            listener
        )
    }

    AsyncFunction("stopGsrTest") { promise: Promise ->
        val manager = VPOperateManager.getInstance()
        module.endRealtimeTest("gsr")
        if (manager != null) {
            manager.stopDetectGsr(
                object : BleWriteResponse {
                    override fun onResponse(code: Int) {
                        if (code == Code.REQUEST_SUCCESS) promise.resolve(null)
                        else promise.reject("STOP_FAILED", "Stop GSR failed: $code", null)
                    }
                }
            )
        } else {
            promise.resolve(null)
        }
    }

    // PTT is iOS-only — no Android vendor API
    AsyncFunction("startPttTest") { promise: Promise ->
        promise.reject("CAPABILITY_UNSUPPORTED", "PTT test is not supported on Android — iOS only")
    }

    AsyncFunction("stopPttTest") { promise: Promise ->
        promise.resolve(null)
    }
}
