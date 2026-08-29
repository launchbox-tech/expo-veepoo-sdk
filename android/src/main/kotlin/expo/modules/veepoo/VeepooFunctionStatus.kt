package expo.modules.veepoo

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
