// Behavioural regression test for the Android vendor-status mappers (#212, #210).
//
// Covers `toFunctionStatus`, the 13-channel social-message map, and the 12
// device-function package keys. VeepooSDKModuleHelpers.kt keeps only the
// assignment into the module's cache, which a contract check guards; everything
// that DECIDES a value lives in VeepooFunctionStatus.kt and is run here.
//
// Compiled and run by scripts/android-function-status-check.sh together with
// android/src/main/kotlin/expo/modules/veepoo/VeepooFunctionStatus.kt itself —
// the shipped source, not a copy — against the REAL vendor classes unzipped
// from android/libs/vpprotocol-2.3.80.15.aar. That file imports the two vendor
// types and nothing else (no Android framework, no ExpoModulesCore) precisely
// so this is possible: no emulator, no Gradle, no Android SDK.
//
// Why this exists rather than another source-parsing check: #212 was a mapper
// whose output did not depend on its input. `toSupportedStatus` branched on
// Boolean/Number/String, every field it was handed was the vendor's
// EFunctionStatus ENUM, and so all 13 social-message channels answered
// "unsupported" whatever the band reported. A check that READS the call sites
// cannot see that — src/bridge-contract/verify-social-msg-keys.ts proves the
// emitter names the right 13 channels and routes each through toFunctionStatus,
// and that is all text can prove. This RUNS the mapper over every constant the
// vendor enum actually declares, which is the only way the defect shows up.
package expo.modules.veepoo

import com.veepoo.protocol.model.datas.FunctionDeviceSupportData
import com.veepoo.protocol.model.datas.FunctionSocailMsgData
import com.veepoo.protocol.model.enums.EFunctionStatus

private val failures = mutableListOf<String>()

private fun expect(actual: Any?, expected: Any?, why: String) {
  if (actual != expected) {
    failures.add(
      """
      $why
        expected: $expected
        actual:   $actual
      """.trimIndent()
    )
  }
}

/** The `FunctionStatus` vocabulary src/capabilities/device-functions/types.ts declares. */
private val DECLARED_STATUSES = setOf("unsupported", "support", "open", "close", "unknown")

/**
 * Every constant the vendor enum declares, and the JS status it must produce.
 *
 * Keyed by NAME, and checked against `EFunctionStatus.values()` for both
 * directions: a vendor upgrade that adds a constant fails here demanding a
 * decision, rather than quietly landing in the `else -> "unknown"` arm.
 */
private val EXPECTED_BY_CONSTANT = mapOf(
  "SUPPORT" to "support",
  "SUPPORT_OPEN" to "open",
  "SUPPORT_CLOSE" to "close",
  "UNSUPPORT" to "unsupported",
  // Vendor spelling. "the band did not say" — NOT the same as "the band said no".
  "UNKONW" to "unknown",
)

/**
 * The 13 bridged channels, each paired with the setter that feeds it. Used to
 * drive one channel at a time so a crossed field (two channels reading the same
 * vendor field) fails as loudly as a constant would.
 */
private val CHANNEL_SETTERS: List<Pair<String, (FunctionSocailMsgData, EFunctionStatus) -> Unit>> =
  listOf(
    "phone" to { data, status -> data.phone = status },
    "sms" to { data, status -> data.msg = status },
    "wechat" to { data, status -> data.wechat = status },
    "qq" to { data, status -> data.qq = status },
    "facebook" to { data, status -> data.facebook = status },
    "twitter" to { data, status -> data.twitter = status },
    "instagram" to { data, status -> data.instagram = status },
    "linkedin" to { data, status -> data.linkin = status },
    "whatsapp" to { data, status -> data.whats = status },
    "line" to { data, status -> data.line = status },
    "skype" to { data, status -> data.skype = status },
    "email" to { data, status -> data.gmail = status },
    "other" to { data, status -> data.other = status },
  )

/**
 * The device-function packages, each key paired with the setter that feeds it.
 * Same shape as [CHANNEL_SETTERS], and used the same way: one field at a time,
 * so a key reading another key's vendor field fails.
 *
 * The keys are the snake_case names src/capabilities/device-functions/declared-keys.ts
 * declares — JS reads a nested package strictly by declared key, and #210 was a
 * camelCase spelling being dropped in silence.
 *
 * `watch_data_day_number` is absent here on purpose: it is an Int, not a status,
 * and it is emitted conditionally. It gets its own cases below.
 */
private val PACKAGE_FIELDS:
  List<Triple<String, String, (FunctionDeviceSupportData, EFunctionStatus) -> Unit>> =
  listOf(
    Triple("package1", "blood_pressure") { data, status -> data.bp = status },
    Triple("package1", "heart_rate_detect") { data, status -> data.heartDetect = status },
    Triple("package1", "spo_h") { data, status -> data.spo2H = status },
    Triple("package1", "temperature_function") { data, status -> data.temperatureFunction = status },
    Triple("package2", "ecg_function") { data, status -> data.ecg = status },
    Triple("package2", "precision_sleep") { data, status -> data.precisionSleep = status },
    Triple("package2", "hrv_function") { data, status -> data.hrvFunction = status },
    Triple("package3", "stress_function") { data, status -> data.stress = status },
    Triple("package3", "agps_function") { data, status -> data.agps = status },
    Triple("package3", "blood_glucose") { data, status -> data.bloodGlucose = status },
    Triple("package3", "blood_component") { data, status -> data.bloodComponent = status },
    Triple("package3", "body_component") { data, status -> data.bodyComponent = status },
  )

private fun allFunctions(status: EFunctionStatus): FunctionDeviceSupportData {
  val data = FunctionDeviceSupportData()
  for ((_, _, set) in PACKAGE_FIELDS) set(data, status)
  return data
}

private fun allChannels(status: EFunctionStatus): FunctionSocailMsgData {
  val data = FunctionSocailMsgData()
  for ((_, set) in CHANNEL_SETTERS) set(data, status)
  return data
}

fun main() {
  // ── toFunctionStatus reads the vendor ENUM ─────────────────────────────────
  // The #212 defect in one assertion: distinct vendor answers must stay
  // distinct. `toSupportedStatus` collapsed all five onto "unsupported".
  val constants = EFunctionStatus.values()
  val produced = constants.map { toFunctionStatus(it) }
  expect(
    produced.toSet().size,
    constants.size,
    "toFunctionStatus must map every vendor constant to a distinct status — " +
      "collapsing them is the #212 defect (${constants.joinToString { it.name }} -> $produced)",
  )

  for (constant in constants) {
    val expected = EXPECTED_BY_CONSTANT[constant.name]
    if (expected == null) {
      failures.add(
        "EFunctionStatus.${constant.name} is new in this vendor build and has no declared " +
          "mapping — decide it in VeepooFunctionStatus.kt and add it to EXPECTED_BY_CONSTANT, " +
          "rather than letting it fall into the `else -> \"unknown\"` arm",
      )
      continue
    }
    expect(toFunctionStatus(constant), expected, "EFunctionStatus.${constant.name} maps wrong")
  }
  for (name in EXPECTED_BY_CONSTANT.keys) {
    if (constants.none { it.name == name }) {
      failures.add(
        "EXPECTED_BY_CONSTANT names $name, which this vendor build's EFunctionStatus no longer " +
          "declares — the check is testing a constant that does not exist",
      )
    }
  }

  // A band that reported nothing is absent, not denied (the #212 behaviour change).
  expect(toFunctionStatus(null), "unknown", "a null vendor status is absence, not denial")

  for (status in produced) {
    if (status !in DECLARED_STATUSES) {
      failures.add("toFunctionStatus produced \"$status\", which FunctionStatus does not declare")
    }
  }

  // ── socialMsgStatusMap wires each channel to its own vendor field ──────────
  expect(
    socialMsgStatusMap(FunctionSocailMsgData()).keys.sorted(),
    CHANNEL_SETTERS.map { it.first }.sorted(),
    "socialMsgStatusMap must emit exactly the 13 bridged channels",
  )

  for ((channel, set) in CHANNEL_SETTERS) {
    // Everything closed, one channel open: the open one must be the one set.
    val data = allChannels(EFunctionStatus.SUPPORT_CLOSE)
    set(data, EFunctionStatus.SUPPORT_OPEN)
    val result = socialMsgStatusMap(data)
    expect(result[channel], "open", "$channel must read the vendor field it is bridged to")
    for ((other, _) in CHANNEL_SETTERS) {
      if (other == channel) continue
      expect(
        result[other],
        "close",
        "$other changed when only $channel was set — the two read the same vendor field",
      )
    }
  }

  // The whole map tracks the band, not a constant: same object, four vocabularies.
  for ((status, expected) in listOf(
    EFunctionStatus.SUPPORT to "support",
    EFunctionStatus.SUPPORT_OPEN to "open",
    EFunctionStatus.SUPPORT_CLOSE to "close",
    EFunctionStatus.UNSUPPORT to "unsupported",
  )) {
    val result = socialMsgStatusMap(allChannels(status))
    expect(
      result.values.toSet(),
      setOf(expected),
      "a band answering ${status.name} on all 13 channels must read back as \"$expected\"",
    )
  }

  // What an untouched vendor struct reads back as. #212 predicted "unknown"
  // here and it is measurably not: vpprotocol-2.3.80.15 initialises all 26
  // fields to UNSUPPORT, so a channel the vendor's parser never writes is
  // reported as denied, not absent. "unknown" reaches JS only when the band's
  // own byte decodes to UNKONW — which narrows the consumer-visible behaviour
  // change the issue warned about. Pinned here because it is the vendor's
  // choice, not ours, and a vendor bump could change it under us.
  expect(
    socialMsgStatusMap(FunctionSocailMsgData()).values.toSet(),
    setOf("unsupported"),
    "the vendor seeds its own fields to UNSUPPORT — if this now reads \"unknown\", " +
      "the vendor changed its defaults and every consumer branching on " +
      "\"unsupported\" sees it",
  )

  // ── deviceFunctionPackages wires each key to its own vendor field ─────────
  // #210 was the key half of the same defect: a package key JS could not read.
  // These cases hold the wiring underneath it — a key that reports another
  // field's answer is as wrong as one JS drops, and neither shows up in text.
  expect(
    deviceFunctionPackages(FunctionDeviceSupportData()).keys.sorted(),
    PACKAGE_FIELDS.map { it.first }.distinct().sorted(),
    "deviceFunctionPackages must emit exactly the packages it bridges",
  )

  for ((packageName, key) in PACKAGE_FIELDS.map { it.first to it.second }) {
    val emitted = deviceFunctionPackages(FunctionDeviceSupportData())[packageName]
    if (emitted == null || key !in emitted) {
      failures.add("$packageName is missing $key — JS reads a package strictly by declared key")
    }
  }

  for ((packageName, key, set) in PACKAGE_FIELDS) {
    val data = allFunctions(EFunctionStatus.SUPPORT_CLOSE)
    set(data, EFunctionStatus.SUPPORT_OPEN)
    val packages = deviceFunctionPackages(data)
    expect(packages[packageName]?.get(key), "open", "$packageName.$key must read its own vendor field")
    for ((otherPackage, otherKey, _) in PACKAGE_FIELDS) {
      if (otherPackage == packageName && otherKey == key) continue
      expect(
        packages[otherPackage]?.get(otherKey),
        "close",
        "$otherPackage.$otherKey changed when only $packageName.$key was set — " +
          "the two read the same vendor field",
      )
    }
  }

  for ((status, expected) in listOf(
    EFunctionStatus.SUPPORT to "support",
    EFunctionStatus.SUPPORT_OPEN to "open",
    EFunctionStatus.SUPPORT_CLOSE to "close",
    EFunctionStatus.UNSUPPORT to "unsupported",
  )) {
    val values = deviceFunctionPackages(allFunctions(status))
      .values
      .flatMap { entries -> entries.filterKeys { it != "watch_data_day_number" }.values }
      .toSet()
    expect(
      values,
      setOf<Any>(expected),
      "a band answering ${status.name} on every function must read back as \"$expected\"",
    )
  }

  // ── watch_data_day_number is an Int, and conditionally emitted ────────────
  // The band's on-device retention window, and the one entry that is not a
  // status. Our emitter guards it with `if (data.wathcDay > 0)`, on the stated
  // reasoning that 0 means the band did not report one and JS should be able to
  // tell that from a real value.
  //
  // MEASURED, and it does not hold on vpprotocol-2.3.80.15: the field is seeded
  // to 3, and `setWathcDay` substitutes 3 for 0 in bytecode
  // (`iload_1; ifne 6; iconst_3; istore_1`). So a band that reported nothing —
  // or reported zero — reaches JS as a three-day window indistinguishable from
  // a band that really said three. The guard only ever fires on a negative,
  // which the protocol has no way to send.
  //
  // These cases pin that vendor behaviour rather than the intent, so the day it
  // changes, this fails instead of a consumer quietly trusting an invented 3.
  expect(
    deviceFunctionPackages(FunctionDeviceSupportData())["package2"]
      ?.get("watch_data_day_number"),
    3,
    "the vendor seeds wathcDay to 3, so an unreported window is emitted as 3, not left out",
  )
  run {
    val data = FunctionDeviceSupportData()
    data.wathcDay = 0
    expect(
      deviceFunctionPackages(data)["package2"]?.get("watch_data_day_number"),
      3,
      "setWathcDay coerces 0 to 3 — if this is now 0 or absent, the vendor dropped the " +
        "coercion and the > 0 guard finally means what it claims",
    )
  }
  run {
    // The only input that reaches the absent branch. Kept so the branch is
    // exercised at all, not because a band can produce it.
    val data = FunctionDeviceSupportData()
    data.wathcDay = -1
    val package2 = deviceFunctionPackages(data)["package2"]
    if (package2 != null && "watch_data_day_number" in package2) {
      failures.add("package2 emitted watch_data_day_number for a negative retention window")
    }
  }
  run {
    val data = FunctionDeviceSupportData()
    data.wathcDay = 7
    val value = deviceFunctionPackages(data)["package2"]?.get("watch_data_day_number")
    expect(value, 7, "a reported retention window must reach JS as the Int the band sent")
  }

  for (values in deviceFunctionPackages(allFunctions(EFunctionStatus.SUPPORT)).values) {
    for ((key, value) in values) {
      if (key == "watch_data_day_number") continue
      if (value !in DECLARED_STATUSES) {
        failures.add("deviceFunctionPackages emitted $key=\"$value\", which FunctionStatus does not declare")
      }
    }
  }

  if (failures.isEmpty()) {
    println("  ✓ android function-status mappers: ${constants.size} vendor constants, " +
      "${CHANNEL_SETTERS.size} social-message channels, " +
      "${PACKAGE_FIELDS.size} device-function keys")
    return
  }
  println("android-function-status-check: ${failures.size} failure(s)")
  for (failure in failures) println("\n$failure")
  kotlin.system.exitProcess(1)
}
