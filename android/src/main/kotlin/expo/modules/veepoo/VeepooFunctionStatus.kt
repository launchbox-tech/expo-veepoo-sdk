package expo.modules.veepoo

import com.veepoo.protocol.model.datas.FunctionDeviceSupportData
import com.veepoo.protocol.model.datas.FunctionSocailMsgData
import com.veepoo.protocol.model.enums.EFunctionStatus

/**
 * The vendor-status mappers, kept in one file that imports the two vendor types
 * and NOTHING else — no Android framework, no ExpoModulesCore.
 *
 * That constraint is deliberate and load-bearing:
 * scripts/android-function-status-check.sh compiles this exact file against
 * vpprotocol's own classes and runs the mappers over every constant
 * `EFunctionStatus` declares. #212 was a mapper whose output did not depend on
 * its input, which no amount of reading the call sites can catch — so these two
 * functions have to stay compilable on their own. Adding an Android or Expo
 * import here breaks that check, and the mappers lose their only executable
 * test. Put such code in VeepooSDKModuleHelpers.kt instead.
 */

/**
 * Converts the vendor's `EFunctionStatus` to the `FunctionStatus` vocabulary JS
 * declares. This is the ONLY converter for a vendor status: the previous
 * `toSupportedStatus` branched on Boolean/Number/String, so an enum matched
 * nothing and fell through to "unsupported" — the band's real answer never left
 * Kotlin (#210 for device functions, #212 for social messages).
 *
 * `UNKONW` (vendor spelling) maps to "unknown", NOT "unsupported" — a band that
 * did not report a capability must stay distinguishable from one that said no.
 */
fun toFunctionStatus(status: EFunctionStatus?): String {
  return when (status) {
    EFunctionStatus.SUPPORT -> "support"
    EFunctionStatus.SUPPORT_OPEN -> "open"
    EFunctionStatus.SUPPORT_CLOSE -> "close"
    EFunctionStatus.UNSUPPORT -> "unsupported"
    else -> "unknown"
  }
}

/**
 * The 13 social-message channels this module bridges, keyed as
 * `SOCIAL_MSG_CHANNELS` in src/capabilities/social-msg.ts spells them. The
 * vendor struct carries 26; the other 13 are deliberate scope, not an omission.
 *
 * Every field is an `EFunctionStatus`, so every one goes through
 * [toFunctionStatus]. Two checks hold this shape: the contract check keeps the
 * keys agreed with iOS and JS and requires each value to be a
 * `toFunctionStatus(data.…)` call over a distinct field, and the executable
 * check drives one channel at a time so a crossed field is caught too.
 */
fun socialMsgStatusMap(data: FunctionSocailMsgData): Map<String, String> {
  return mapOf(
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
    "other" to toFunctionStatus(data.other),
  )
}

/**
 * The device-function packages, built from what the band reported at password
 * verification. Keys are the snake_case names
 * `src/capabilities/device-functions/declared-keys.ts` declares: JS reads a
 * nested package strictly by declared key, so a camelCase spelling here is
 * silently dropped rather than surfaced — that was #210.
 *
 * `wathcDay` (vendor spelling) is the band's on-device retention window: how
 * many days of history it will re-serve. It belongs INSIDE package2, because
 * the JS normalizer only reads the nested package object and a value emitted
 * beside it never reaches JS.
 *
 * The `> 0` guard was written to leave the key out when the band reported no
 * window, so JS could tell that from a real value. On vpprotocol-2.3.80.15 it
 * does NOT achieve that, and the executable check pins why: the field is seeded
 * to 3 and `setWathcDay` substitutes 3 for 0, so an unreported window arrives
 * as an ordinary-looking three days. The guard is kept because it costs nothing
 * and becomes true again the day the vendor drops the coercion — but a consumer
 * must not read `watch_data_day_number == 3` as something the band said.
 *
 * The caller assigns this into `cachedDeviceFunctions`; the building is here so
 * scripts/android-function-status-check.sh can run it. See this file's header
 * for why that means no Android import may appear in it.
 */
fun deviceFunctionPackages(data: FunctionDeviceSupportData): Map<String, Map<String, Any>> {
  val package1 = mapOf(
    "blood_pressure" to toFunctionStatus(data.bp),
    "heart_rate_detect" to toFunctionStatus(data.heartDetect),
    "spo_h" to toFunctionStatus(data.spo2H),
    "temperature_function" to toFunctionStatus(data.temperatureFunction),
  )
  val package2 = buildMap<String, Any> {
    put("ecg_function", toFunctionStatus(data.ecg))
    put("precision_sleep", toFunctionStatus(data.precisionSleep))
    put("hrv_function", toFunctionStatus(data.hrvFunction))
    if (data.wathcDay > 0) put("watch_data_day_number", data.wathcDay)
  }
  val package3 = mapOf(
    "stress_function" to toFunctionStatus(data.stress),
    "agps_function" to toFunctionStatus(data.agps),
    "blood_glucose" to toFunctionStatus(data.bloodGlucose),
    "blood_component" to toFunctionStatus(data.bloodComponent),
    "body_component" to toFunctionStatus(data.bodyComponent),
  )
  // The keys below are package NAMES, not fields. The contract check stops its
  // slice here for that reason, exactly as it does on the iOS side.
  return mapOf("package1" to package1, "package2" to package2, "package3" to package3)
}
