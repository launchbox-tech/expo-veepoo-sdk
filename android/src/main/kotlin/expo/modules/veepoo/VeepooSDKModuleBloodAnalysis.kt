package expo.modules.veepoo

import com.inuker.bluetooth.library.Code
import com.inuker.bluetooth.library.connect.response.BleWriteResponse
import com.veepoo.protocol.VPOperateManager
import com.veepoo.protocol.listener.data.IBloodComponentDetectListener
import com.veepoo.protocol.model.datas.BloodComponent
import com.veepoo.protocol.model.enums.EBloodComponentDetectState
import com.veepoo.protocol.shareprence.VpSpGetUtil
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

private fun bloodComponentToValues(c: BloodComponent?): Map<String, Any>? {
    if (c == null) return null
    return mapOf(
        "uricAcid" to c.uricAcid.toDouble(),
        "totalCholesterol" to c.tCHO.toDouble(),
        "triglyceride" to c.tAG.toDouble(),
        "highDensityLipoprotein" to c.hDL.toDouble(),
        "lowDensityLipoprotein" to c.lDL.toDouble()
    )
}

private fun emitBloodAnalysisResult(module: VeepooSDKModule, state: String, progress: Int, component: BloodComponent?) {
    module.sendEvent(BLOOD_ANALYSIS_TEST_RESULT, mapOf(
        "deviceId" to (module.connectedDeviceId ?: ""),
        "result" to mapOf(
            "state" to state,
            "progress" to progress,
            "values" to bloodComponentToValues(component)
        )
    ))
}

fun ModuleDefinitionBuilder.defineBloodAnalysis(module: VeepooSDKModule) {

    AsyncFunction("startBloodAnalysisTest") { promise: Promise ->
        if (!module.tryBeginRealtimeTest("bloodAnalysis", promise)) return@AsyncFunction
        val ctx = module.context
        if (!VpSpGetUtil.getVpSpVariInstance(ctx).isSupportBloodComponentDetect()) {
            module.endRealtimeTest("bloodAnalysis")
            promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support blood analysis", null)
            return@AsyncFunction
        }
        val manager = VPOperateManager.getInstance() ?: run {
            module.endRealtimeTest("bloodAnalysis")
            promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
            return@AsyncFunction
        }
        val listener = object : IBloodComponentDetectListener {
            override fun onDetecting(progress: Int, component: BloodComponent?) {
                emitBloodAnalysisResult(module, "testing", progress, component)
            }
            override fun onDetectComplete(component: BloodComponent?) {
                emitBloodAnalysisResult(module, "over", 100, component)
                module.endRealtimeTest("bloodAnalysis")
            }
            override fun onDetectFailed(state: EBloodComponentDetectState?) {
                val label = when (state) {
                    EBloodComponentDetectState.LOW_POWER -> "error"
                    EBloodComponentDetectState.BUSY -> "deviceBusy"
                    EBloodComponentDetectState.WEAR_ERROR -> "notWear"
                    else -> "error"
                }
                emitBloodAnalysisResult(module, label, 0, null)
                module.endRealtimeTest("bloodAnalysis")
            }
            override fun onDetectStop() {
                emitBloodAnalysisResult(module, "over", 0, null)
                module.endRealtimeTest("bloodAnalysis")
            }
        }
        manager.startDetectBloodComponent(
            object : BleWriteResponse {
                override fun onResponse(code: Int) {
                    if (code == Code.REQUEST_SUCCESS) {
                        promise.resolve(null)
                    } else {
                        module.endRealtimeTest("bloodAnalysis")
                        promise.reject("START_FAILED", "Start blood analysis failed: $code", null)
                    }
                }
            },
            false,
            listener
        )
    }

    AsyncFunction("stopBloodAnalysisTest") { promise: Promise ->
        val manager = VPOperateManager.getInstance()
        module.endRealtimeTest("bloodAnalysis")
        if (manager != null) {
            manager.stopDetectBloodComponent(
                object : BleWriteResponse {
                    override fun onResponse(code: Int) {
                        if (code == Code.REQUEST_SUCCESS) promise.resolve(null)
                        else promise.reject("STOP_FAILED", "Stop blood analysis failed: $code", null)
                    }
                }
            )
        } else {
            promise.resolve(null)
        }
    }
}
