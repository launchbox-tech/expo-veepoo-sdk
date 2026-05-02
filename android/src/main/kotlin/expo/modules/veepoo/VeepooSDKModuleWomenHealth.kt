package expo.modules.veepoo

import android.util.Log
import com.inuker.bluetooth.library.Code
import com.veepoo.protocol.VPOperateManager
import com.veepoo.protocol.listener.base.IBleWriteResponse
import com.veepoo.protocol.listener.data.IWomenDataListener
import com.veepoo.protocol.model.datas.TimeData
import com.veepoo.protocol.model.datas.WomenData
import com.veepoo.protocol.model.enums.ESex
import com.veepoo.protocol.model.enums.EWomenOprateStatus
import com.veepoo.protocol.model.enums.EWomenStatus
import com.veepoo.protocol.model.settings.WomenSetting
import com.veepoo.protocol.shareprence.VpSpGetUtil
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

private fun parseWomenStatusKey(raw: String?): EWomenStatus {
  return when (raw?.lowercase()?.trim()) {
    "menstrual", "menes" -> EWomenStatus.MENES
    "pregnancy_prep", "preready" -> EWomenStatus.PREREADY
    "pregnancy", "preing", "gestation" -> EWomenStatus.PREING
    "postpartum", "mamami", "mommy" -> EWomenStatus.MAMAMI
    "none" -> EWomenStatus.NONE
    else -> EWomenStatus.NONE
  }
}

private fun ewomenStatusToJs(s: EWomenStatus): String {
  return when (s) {
    EWomenStatus.MENES -> "menstrual"
    EWomenStatus.PREREADY -> "pregnancy_prep"
    EWomenStatus.PREING -> "pregnancy"
    EWomenStatus.MAMAMI -> "postpartum"
    EWomenStatus.NONE -> "none"
  }
}

private fun parseYmdDate(s: String?): TimeData? {
  if (s.isNullOrBlank()) return null
  val p = s.trim().split("-")
  if (p.size != 3) return null
  val y = p[0].toIntOrNull() ?: return null
  val m = p[1].toIntOrNull() ?: return null
  val d = p[2].toIntOrNull() ?: return null
  return TimeData(y, m, d)
}

private fun timeDataToIso(td: TimeData?): String? {
  if (td == null) return null
  return try {
    String.format("%04d-%02d-%02d", td.year, td.month, td.day)
  } catch (_: Exception) {
    null
  }
}

private fun buildWomenSettingFromMap(m: Map<String, Any?>): WomenSetting {
  val status = parseWomenStatusKey(m["status"] as? String)
  val last = parseYmdDate(m["lastMenstrualDate"] as? String)
  val confinement = parseYmdDate(m["expectedDeliveryDate"] as? String)
  val babyBd = parseYmdDate(m["babyBirthday"] as? String)
  val menseLen = (m["menstrualLengthDays"] as? Number)?.toInt() ?: 5
  val menseInt = (m["menstrualCycleDays"] as? Number)?.toInt() ?: 28
  val babySexRaw = (m["babySex"] as? String)?.lowercase()
  val babySex = when (babySexRaw) {
    "male", "man" -> ESex.MAN
    "female", "woman" -> ESex.WOMAN
    else -> ESex.WOMAN
  }

  return when (status) {
    EWomenStatus.MENES, EWomenStatus.PREREADY -> {
      val l = last ?: throw IllegalArgumentException("lastMenstrualDate is required for this status")
      WomenSetting(status, menseLen, menseInt, l)
    }
    EWomenStatus.PREING -> {
      val l = last ?: throw IllegalArgumentException("lastMenstrualDate is required for pregnancy")
      val c = confinement ?: throw IllegalArgumentException("expectedDeliveryDate is required for pregnancy")
      WomenSetting(status, l, c)
    }
    EWomenStatus.MAMAMI -> {
      val l = last ?: throw IllegalArgumentException("lastMenstrualDate is required for postpartum")
      val bb = babyBd ?: throw IllegalArgumentException("babyBirthday is required for postpartum")
      WomenSetting(status, menseLen, menseInt, l, babySex, bb)
    }
    EWomenStatus.NONE -> WomenSetting(status, menseLen, menseInt, last ?: TimeData(2000, 1, 1))
  }
}

private fun womenSettingProbeToMap(obj: Any?): Map<String, Any?>? {
  if (obj == null) return null
  val o = obj
  val cls = o.javaClass
  fun intM(vararg names: String): Int? {
    for (n in names) {
      try {
        val v = cls.getMethod(n).invoke(o) ?: continue
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
  fun timeM(vararg names: String): String? {
    for (n in names) {
      try {
        val v = cls.getMethod(n).invoke(o) ?: continue
        if (v is TimeData) return timeDataToIso(v)
      } catch (_: Exception) {
      }
    }
    return null
  }
  fun statusM(): String? {
    for (n in arrayOf("getWomenStatus", "getEWomenStatus")) {
      try {
        val v = cls.getMethod(n).invoke(o) as? EWomenStatus ?: continue
        return ewomenStatusToJs(v)
      } catch (_: Exception) {
      }
    }
    return null
  }
  val out = mutableMapOf<String, Any?>()
  statusM()?.let { out["status"] = it }
  intM("getMenseLength", "getMenseLen")?.let { out["menstrualLengthDays"] = it }
  intM("getMenesInterval", "getMenseInterval")?.let { out["menstrualCycleDays"] = it }
  timeM("getMenesLasterday", "getMenesLasterday").let { if (it != null) out["lastMenstrualDate"] = it }
  timeM("getConfinementDay", "getConfinementDay").let { if (it != null) out["expectedDeliveryDate"] = it }
  timeM("getBabyBirthday", "getBabyBirthday").let { if (it != null) out["babyBirthday"] = it }
  return if (out.isEmpty()) null else out
}

private fun womenDataToMap(w: WomenData): Map<String, Any?> {
  val out = mutableMapOf<String, Any?>()
  try {
    w.oprateStatus?.let { out["operationStatus"] = it.name }
  } catch (_: Exception) {
  }
  try {
    val nested = try {
      w.javaClass.getMethod("getWomenSetting").invoke(w)
    } catch (_: Exception) {
      try {
        w.javaClass.getMethod("getSetting").invoke(w)
      } catch (_: Exception) {
        null
      }
    }
    womenSettingProbeToMap(nested)?.forEach { (k, v) -> out.putIfAbsent(k, v) }
  } catch (_: Exception) {
  }
  val any = w as Any
  val cls = any.javaClass
  for (pair in listOf(
    Triple("menstrualLengthDays", arrayOf("getMenseLength"), emptyArray<String>()),
    Triple("menstrualCycleDays", arrayOf("getMenesInterval"), emptyArray<String>()),
    Triple("lastMenstrualDate", arrayOf("getMenesLasterday"), arrayOf("menesLasterday")),
    Triple("expectedDeliveryDate", arrayOf("getConfinementDay"), arrayOf("confinementDay")),
    Triple("babyBirthday", arrayOf("getBabyBirthday"), arrayOf("babyBirthday")),
    Triple("currentMenstrualDays", arrayOf("getCurrentMenstrualDays"), arrayOf("currentMenstrualDays"))
  )) {
    val (key, methods, fields) = pair
    if (out.containsKey(key)) continue
    for (mn in methods) {
      try {
        val v = cls.getMethod(mn).invoke(any) ?: continue
        when (v) {
          is TimeData -> timeDataToIso(v)?.let { out[key] = it }
          is Int -> out[key] = v
          is Number -> out[key] = v.toInt()
          is EWomenStatus -> out.putIfAbsent("status", ewomenStatusToJs(v))
        }
        break
      } catch (_: Exception) {
      }
    }
    for (fn in fields) {
      try {
        val f = cls.getDeclaredField(fn)
        f.isAccessible = true
        val v = f.get(any) ?: continue
        when (v) {
          is TimeData -> timeDataToIso(v)?.let { out[key] = it }
          is Int -> out[key] = v
          is Number -> out[key] = v.toInt()
        }
        break
      } catch (_: Exception) {
      }
    }
  }
  return out
}

fun ModuleDefinitionBuilder.defineWomenHealth(module: VeepooSDKModule) {
  AsyncFunction("readWomenHealthSettings") { promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    val ctx = module.appContext.reactContext ?: run {
      promise.reject("CONTEXT_ERROR", "Cannot get app context", null)
      return@AsyncFunction
    }
    if (!VpSpGetUtil.getVpSpVariInstance(ctx).isSupportWomenSetting) {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support women's health settings", null)
      return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    var done = false
    manager.readWomenState(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) {
            Log.e(TAG, "readWomenHealthSettings: write code=$code")
          }
        }
      },
      object : IWomenDataListener {
        override fun onWomenDataChange(womenData: WomenData) {
          if (done) return
          when (womenData.oprateStatus) {
            EWomenOprateStatus.READ_SUCCESS -> {
              done = true
              promise.resolve(womenDataToMap(womenData))
            }
            EWomenOprateStatus.READ_FAIL -> {
              done = true
              promise.reject("READ_FAILED", "Read women's health settings failed", null)
            }
            EWomenOprateStatus.UNKONW -> {
              done = true
              promise.reject("OPERATION_FAILED", "Women's health read returned unknown status", null)
            }
            else -> {}
          }
        }
      }
    )
  }

  AsyncFunction("setWomenHealthSettings") { settings: Map<String, Any?>, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    val ctx = module.appContext.reactContext ?: run {
      promise.reject("CONTEXT_ERROR", "Cannot get app context", null)
      return@AsyncFunction
    }
    if (!VpSpGetUtil.getVpSpVariInstance(ctx).isSupportWomenSetting) {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support women's health settings", null)
      return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    val womenSetting = try {
      buildWomenSettingFromMap(settings)
    } catch (e: IllegalArgumentException) {
      promise.reject("INVALID_ARGUMENT", e.message ?: "Invalid women's health settings", null)
      return@AsyncFunction
    }
    var done = false
    manager.settingWomenState(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) {
            Log.e(TAG, "setWomenHealthSettings: write code=$code")
          }
        }
      },
      object : IWomenDataListener {
        override fun onWomenDataChange(womenData: WomenData) {
          if (done) return
          when (womenData.oprateStatus) {
            EWomenOprateStatus.SETTING_SUCCESS -> {
              done = true
              promise.resolve(null)
            }
            EWomenOprateStatus.SETTING_FAIL -> {
              done = true
              promise.reject("OPERATION_FAILED", "Set women's health settings failed", null)
            }
            EWomenOprateStatus.UNKONW -> {
              done = true
              promise.reject("OPERATION_FAILED", "Women's health set returned unknown status", null)
            }
            else -> {}
          }
        }
      },
      womenSetting
    )
  }
}
