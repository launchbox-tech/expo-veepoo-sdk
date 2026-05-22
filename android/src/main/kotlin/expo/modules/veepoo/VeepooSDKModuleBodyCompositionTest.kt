package expo.modules.veepoo

import com.inuker.bluetooth.library.Code
import com.veepoo.protocol.VPOperateManager
import com.veepoo.protocol.listener.base.IBleWriteResponse
import com.veepoo.protocol.listener.data.*
import com.veepoo.protocol.model.datas.*
import com.veepoo.protocol.model.enums.EBPDetectModel
import com.veepoo.protocol.model.enums.EBloodGlucoseRiskLevel
import com.veepoo.protocol.model.enums.EBloodGlucoseStatus
import com.veepoo.protocol.shareprence.VpSpGetUtil
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

fun ModuleDefinitionBuilder.defineBodyCompositionTest(module: VeepooSDKModule) {
  AsyncFunction("startBodyCompositionTest") { promise: Promise ->
    if (!module.tryBeginRealtimeTest("bodyComposition", promise)) {
      return@AsyncFunction
    }
    val ctx = module.context
    if (!VpSpGetUtil.getVpSpVariInstance(ctx).isSupportBodyComponent) {
      module.endRealtimeTest("bodyComposition")
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support body composition", null)
      return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      module.endRealtimeTest("bodyComposition")
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }

    manager.startDetectBodyComponent(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code == Code.REQUEST_SUCCESS) {
            promise.resolve(null)
          } else {
            module.endRealtimeTest("bodyComposition")
            promise.reject("START_FAILED", "Start body composition failed: $code", null)
          }
        }
      },
      object : IBodyComponentDetectListener {
        override fun onDetecting(progress: Int, leadState: Int) {
          module.sendEvent(BODY_COMPOSITION_TEST_RESULT, mapOf(
            "deviceId" to (module.connectedDeviceId ?: ""),
            "result" to mapOf(
              "state" to "testing",
              "progress" to progress,
              "lead" to leadState,
              "rawState" to "detecting",
              "isEnd" to false
            )
          ))
        }

        override fun onDetectSuccess(bodyComponent: BodyComponent) {
          module.endRealtimeTest("bodyComposition")
          module.sendEvent(BODY_COMPOSITION_TEST_RESULT, mapOf(
            "deviceId" to (module.connectedDeviceId ?: ""),
            "result" to mapOf(
              "state" to "complete",
              "progress" to 100,
              "rawState" to "success",
              "isEnd" to true,
              "composition" to bodyComponentToCompositionMap(bodyComponent)
            )
          ))
        }

        override fun onDetectFailed(detectState: com.veepoo.protocol.model.enums.DetectState) {
          module.endRealtimeTest("bodyComposition")
          module.sendEvent(BODY_COMPOSITION_TEST_RESULT, mapOf(
            "deviceId" to (module.connectedDeviceId ?: ""),
            "result" to mapOf(
              "state" to detectStateToBodyCompLabel(detectState),
              "progress" to 0,
              "rawState" to detectStateRawForJs(detectState),
              "isEnd" to true
            )
          ))
        }

        override fun onDetectStop() {
          module.endRealtimeTest("bodyComposition")
          module.sendEvent(BODY_COMPOSITION_TEST_RESULT, mapOf(
            "deviceId" to (module.connectedDeviceId ?: ""),
            "result" to mapOf(
              "state" to "over",
              "progress" to 100,
              "rawState" to "stop",
              "isEnd" to true
            )
          ))
        }
      }
    )
  }

  AsyncFunction("stopBodyCompositionTest") { promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    module.endRealtimeTest("bodyComposition")
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    manager.stopDetectBodyComponent(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code == Code.REQUEST_SUCCESS) {
            promise.resolve(null)
          } else {
            promise.reject("STOP_FAILED", "Stop body composition failed: $code", null)
          }
        }
      }
    )
}
/**
 * Body composition helpers are defensive against vpprotocol refactors: no hard-coded enum constant
 * names (use [Enum.name] + ordinal), and numeric fields are resolved via getters, boolean accessors,
 * and declared fields.
 */
private fun readBodyNumeric(bean: Any, methods: Array<String>, fields: Array<String> = emptyArray()): Double? {
  val cls = bean.javaClass
  for (n in methods) {
    try {
      val m = cls.getMethod(n)
      val v = m.invoke(bean) ?: continue
      val d = when (v) {
        is Float -> v.toDouble()
        is Double -> v
        is Int -> v.toDouble()
        is Long -> v.toDouble()
        is Number -> v.toDouble()
        else -> null
      }
      if (d != null) return d
    } catch (_: Exception) {
    }
  }
  for (name in fields) {
    try {
      val f = cls.getDeclaredField(name)
      f.isAccessible = true
      val v = f.get(bean) ?: continue
      val d = when (v) {
        is Float -> v.toDouble()
        is Double -> v
        is Int -> v.toDouble()
        is Long -> v.toDouble()
        is Number -> v.toDouble()
        else -> null
      }
      if (d != null) return d
    } catch (_: Exception) {
    }
  }
  return null
}

private fun bodyComponentToCompositionMap(b: BodyComponent): Map<String, Any?> {
  val out = mutableMapOf<String, Any?>()
  val bean: Any = b
  readBodyNumeric(bean, arrayOf("getBMI", "getBmi", "getbmi"), arrayOf("BMI", "bmi"))?.let { out["bmi"] = it }
  readBodyNumeric(bean, arrayOf("getBodyFatRate", "getBodyFatPercentage"), arrayOf("bodyFatRate", "bodyFatPercentage"))?.let { out["bodyFatPercentage"] = it }
  readBodyNumeric(bean, arrayOf("getFatRate", "getFatMass"), arrayOf("fatRate", "fatMass"))?.let { out["fatMassKg"] = it }
  readBodyNumeric(bean, arrayOf("getFFM", "getFfm", "getLeanBodyMass"), arrayOf("FFM", "ffm", "leanBodyMass"))?.let { out["leanBodyMassKg"] = it }
  readBodyNumeric(bean, arrayOf("getMuscleRate"), arrayOf("muscleRate"))?.let { out["muscleRate"] = it }
  readBodyNumeric(bean, arrayOf("getMuscleMass"), arrayOf("muscleMass"))?.let { out["muscleMassKg"] = it }
  readBodyNumeric(bean, arrayOf("getSubcutaneousFat"), arrayOf("subcutaneousFat"))?.let { out["subcutaneousFatPercentage"] = it }
  readBodyNumeric(bean, arrayOf("getBodyWater", "getBodyMoisture"), arrayOf("bodyWater", "bodyMoisture"))?.let { out["bodyWaterPercentage"] = it }
  readBodyNumeric(bean, arrayOf("getWaterContent"), arrayOf("waterContent"))?.let { out["waterMassKg"] = it }
  readBodyNumeric(bean, arrayOf("getSkeletalMuscleRate"), arrayOf("skeletalMuscleRate"))?.let { out["skeletalMuscleRate"] = it }
  readBodyNumeric(bean, arrayOf("getBoneMass"), arrayOf("boneMass"))?.let { out["boneMassKg"] = it }
  readBodyNumeric(bean, arrayOf("getProteinProportion", "getProportionOfProtein"), arrayOf("proteinProportion", "proportionOfProtein"))?.let { out["proteinPercentage"] = it }
  readBodyNumeric(bean, arrayOf("getProteinMass"), arrayOf("proteinMass"))?.let { out["proteinMassKg"] = it }
  readBodyNumeric(bean, arrayOf("getBasalMetabolicRate"), arrayOf("basalMetabolicRate"))?.let { out["basalMetabolicRateKcal"] = it }

  probeIntMember(bean, "getDuration", "getMeasurementDuration", "duration")?.let { out["measurementDurationSeconds"] = it }
  probeIntMember(bean, "getIdType", "getIDType", "idType")?.let { out["sourceIdType"] = it }

  val tb = probeTimeBean(bean)
  if (tb != null) out["measurementTime"] = tb
  return out
}

private fun probeIntMember(target: Any, vararg names: String): Int? {
  val cls = target.javaClass
  for (name in names) {
    try {
      val m = cls.getMethod(name)
      val v = m.invoke(target) ?: continue
      return when (v) {
        is Int -> v
        is Number -> v.toInt()
        else -> null
      }
    } catch (_: Exception) {
    }
    try {
      val f = cls.getDeclaredField(name)
      f.isAccessible = true
      val v = f.get(target) ?: continue
      return when (v) {
        is Int -> v
        is Number -> v.toInt()
        else -> null
      }
    } catch (_: Exception) {
    }
  }
  return null
}

private fun probeTimeBean(bean: Any): Map<String, Int>? {
  val cls = bean.javaClass
  val tb: Any? = try {
    try {
      cls.getMethod("getTimeBean").invoke(bean)
    } catch (_: Exception) {
      try {
        cls.getDeclaredField("timeBean").apply { isAccessible = true }.get(bean)
      } catch (_: Exception) {
        null
      }
    }
  } catch (_: Exception) {
    null
  } ?: return null
  val hour = probeIntMember(tb, "getHour", "getH", "hour")
  val minute = probeIntMember(tb, "getMinute", "getM", "minute")
  if (hour == null && minute == null) return null
  return mapOf("hour" to (hour ?: 0), "minute" to (minute ?: 0))
}

/** JS `rawState`: vendor enum name for debugging. */
private fun detectStateRawForJs(ds: com.veepoo.protocol.model.enums.DetectState): String = ds.name

/**
 * Map vendor [DetectState] without referencing enum constants (renames / code generation safe).
 * Prefer [Enum.name] tokens; fall back to typical ordinal order from vendor docs.
 */
private fun detectStateToBodyCompLabel(ds: com.veepoo.protocol.model.enums.DetectState): String {
  val e = ds as Enum<*>
  val name = e.name.lowercase()
  if (name.contains("progress")) return "testing"
  if (name.contains("success")) return "complete"
  if (name.contains("fail")) return "error"
  if (name.contains("busy")) return "deviceBusy"
  if (name.contains("low") && name.contains("power")) return "lowPower"
  if (name == "low_power" || name.contains("lowpower")) return "lowPower"
  return when (e.ordinal) {
    0 -> "testing"
    1 -> "complete"
    2 -> "error"
    3 -> "deviceBusy"
    4 -> "lowPower"
    else -> "error"
  }
}
