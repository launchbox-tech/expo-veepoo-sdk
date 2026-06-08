package expo.modules.veepoo

import com.inuker.bluetooth.library.Code
import com.inuker.bluetooth.library.connect.response.BleWriteResponse
import com.veepoo.protocol.VPOperateManager
import com.veepoo.protocol.listener.IMiniCheckupOptListener
import com.veepoo.protocol.model.datas.MiniCheckupDetailData
import com.veepoo.protocol.model.datas.MiniCheckupResultData
import com.veepoo.protocol.model.enums.EMiniCheckupTestErrorCode
import com.veepoo.protocol.shareprence.VpSpGetUtil
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

fun ModuleDefinitionBuilder.defineHealthGlance(module: VeepooSDKModule) {

    AsyncFunction("startHealthGlanceTest") { promise: Promise ->
        if (!module.tryBeginRealtimeTest("healthGlance", promise)) return@AsyncFunction
        val ctx = module.context
        if (!VpSpGetUtil.getVpSpVariInstance(ctx).isSupportMiniCheckup) {
            module.endRealtimeTest("healthGlance")
            promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support health glance", null)
            return@AsyncFunction
        }
        val manager = VPOperateManager.getInstance() ?: run {
            module.endRealtimeTest("healthGlance")
            promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
            return@AsyncFunction
        }
        manager.startMiniCheckup(
            object : BleWriteResponse {
                override fun onResponse(code: Int) {
                    if (code == Code.REQUEST_SUCCESS) {
                        promise.resolve(null)
                    } else {
                        module.endRealtimeTest("healthGlance")
                        promise.reject("START_FAILED", "Start health glance failed: $code", null)
                    }
                }
            },
            object : IMiniCheckupOptListener {
                override fun onMiniCheckupTestProgress(progress: Int) {
                    module.sendEvent(HEALTH_GLANCE_TEST_RESULT, mapOf(
                        "deviceId" to (module.connectedDeviceId ?: ""),
                        "result" to mapOf("state" to "testing", "progress" to progress, "rawState" to "progress", "isEnd" to false)
                    ))
                }
                override fun onMiniCheckupSuccess(data: MiniCheckupResultData?) {
                    module.endRealtimeTest("healthGlance")
                    module.sendEvent(HEALTH_GLANCE_TEST_RESULT, mapOf(
                        "deviceId" to (module.connectedDeviceId ?: ""),
                        "result" to buildResultMap(data, "over", true)
                    ))
                }
                override fun onMiniCheckupDetailTestSuccess(data: MiniCheckupDetailData?) {
                    // Detail result — emit as a supplementary complete event
                    module.sendEvent(HEALTH_GLANCE_TEST_RESULT, mapOf(
                        "deviceId" to (module.connectedDeviceId ?: ""),
                        "result" to buildDetailMap(data)
                    ))
                }
                override fun onMiniCheckupTestFailed(err: EMiniCheckupTestErrorCode?) {
                    module.endRealtimeTest("healthGlance")
                    val state = when (err) {
                        EMiniCheckupTestErrorCode.FUNCTION_NOT_SUPPORT -> "error"
                        EMiniCheckupTestErrorCode.DEVICE_BUSY -> "deviceBusy"
                        EMiniCheckupTestErrorCode.LOW_POWER -> "error"
                        EMiniCheckupTestErrorCode.WEARING_ABNORMALITY -> "notWear"
                        EMiniCheckupTestErrorCode.ECG_LEAD_DETACHMENT -> "notWear"
                        else -> "error"
                    }
                    module.sendEvent(HEALTH_GLANCE_TEST_RESULT, mapOf(
                        "deviceId" to (module.connectedDeviceId ?: ""),
                        "result" to mapOf("state" to state, "rawState" to (err?.name ?: "unknown"), "isEnd" to true)
                    ))
                }
                override fun onMiniCheckupStopSuccess() {
                    module.endRealtimeTest("healthGlance")
                    module.sendEvent(HEALTH_GLANCE_TEST_RESULT, mapOf(
                        "deviceId" to (module.connectedDeviceId ?: ""),
                        "result" to mapOf("state" to "over", "rawState" to "stop", "isEnd" to true)
                    ))
                }
            }
        )
    }

    AsyncFunction("stopHealthGlanceTest") { promise: Promise ->
        val manager = VPOperateManager.getInstance()
        module.endRealtimeTest("healthGlance")
        if (manager != null) {
            manager.stopMiniCheckup(
                object : BleWriteResponse {
                    override fun onResponse(code: Int) {
                        if (code == Code.REQUEST_SUCCESS) promise.resolve(null)
                        else promise.reject("STOP_FAILED", "Stop health glance failed: $code", null)
                    }
                },
                object : IMiniCheckupOptListener {
                    override fun onMiniCheckupTestProgress(progress: Int) {}
                    override fun onMiniCheckupSuccess(data: MiniCheckupResultData?) {}
                    override fun onMiniCheckupDetailTestSuccess(data: MiniCheckupDetailData?) {}
                    override fun onMiniCheckupTestFailed(err: EMiniCheckupTestErrorCode?) {}
                    override fun onMiniCheckupStopSuccess() {}
                }
            )
        } else {
            promise.resolve(null)
        }
    }
}

private fun buildResultMap(data: MiniCheckupResultData?, state: String, isEnd: Boolean): Map<String, Any?> {
    val m = mutableMapOf<String, Any?>(
        "state" to state,
        "rawState" to state,
        "isEnd" to isEnd
    )
    if (data != null) {
        m["heartRate"] = data.heartRate
        m["bloodOxygen"] = data.bloodOxygen
        m["stress"] = data.stress
        m["hrv"] = data.hrv
        m["bodyTemperature"] = data.bodyTemperature.toDouble()
        m["systolic"] = data.systolicBloodPressure
        m["diastolic"] = data.diastolicBloodPressure
        m["bloodSugar"] = data.bloodGlucose.toDouble()
        m["fatigueLevel"] = data.fatigue
    }
    return m
}

private fun buildDetailMap(data: MiniCheckupDetailData?): Map<String, Any?> {
    val m = mutableMapOf<String, Any?>(
        "state" to "complete",
        "rawState" to "detail",
        "isEnd" to true
    )
    if (data != null) {
        m["heartRate"] = data.heartRate
        m["bloodOxygen"] = data.bloodOxygen
        m["stress"] = data.stress
        m["hrv"] = data.hrv
        m["bodyTemperature"] = data.bodyTemperature.toDouble()
        m["systolic"] = data.bpAirPump?.systolicBloodPressure ?: data.bpPhotoelectric?.systolicBloodPressure
        m["diastolic"] = data.bpAirPump?.diastolicBloodPressure ?: data.bpPhotoelectric?.diastolicBloodPressure
        m["bloodSugar"] = data.bloodGlucose.toDouble()
        m["fatigueLevel"] = data.fatigue
    }
    return m
}
