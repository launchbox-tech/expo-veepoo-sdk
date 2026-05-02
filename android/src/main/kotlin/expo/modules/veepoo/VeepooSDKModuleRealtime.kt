package expo.modules.veepoo

import expo.modules.kotlin.Promise

/**
 * Ensures at most one realtime manual health test runs at a time (aligned with iOS `ensureMeasurementCanStart`).
 */
fun VeepooSDKModule.tryBeginRealtimeTest(kind: String, promise: Promise): Boolean {
  if (!isInitialized || connectedDeviceId == null) {
    promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
    return false
  }
  val current = activeRealtimeTest
  if (current != null) {
    val message =
      if (current == kind) {
        "This realtime test is already in progress"
      } else {
        "Another realtime test is already in progress ($current)"
      }
    promise.reject("REALTIME_TEST_IN_PROGRESS", message, null)
    return false
  }
  activeRealtimeTest = kind
  return true
}

fun VeepooSDKModule.endRealtimeTest(kind: String) {
  if (activeRealtimeTest == kind) {
    activeRealtimeTest = null
  }
}
