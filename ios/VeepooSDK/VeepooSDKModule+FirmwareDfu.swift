import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {
  /// Maps `DeviceDFUState` raw values from `VPPublicDefine.h`.
  private func iosDfuStateString(raw: Int) -> String {
    switch raw {
    case 0: return "fileNotExist"
    case 1: return "start"
    case 2: return "updating"
    case 3: return "success"
    case 4: return "failure"
    case 5: return "prepared"
    case 6: return "reboot"
    default: return "unknown"
    }
  }

  func handleStartLocalFirmwareDfu(filePath: String, promise: Promise) {
    #if targetEnvironment(simulator)
    promise.reject(
      "CAPABILITY_UNSUPPORTED",
      "Firmware DFU is not available in the iOS Simulator"
    )
    #else
    let path = filePath.trimmingCharacters(in: .whitespacesAndNewlines)
    if path.isEmpty {
      promise.reject("INVALID_ARGUMENT", "filePath is required")
      return
    }
    guard self.isInitialized else {
      promise.reject("SDK_NOT_INITIALIZED", "SDK not initialized")
      return
    }
    guard self.connectedDeviceId != nil else {
      promise.reject("DEVICE_NOT_CONNECTED", "No device connected")
      return
    }
    guard self.connectionState == .ready else {
      promise.reject("DEVICE_NOT_READY", "Device is not ready")
      return
    }
    if self.isFirmwareDfuActive {
      promise.reject("REALTIME_TEST_IN_PROGRESS", "Firmware update already in progress")
      return
    }

    self.isFirmwareDfuActive = true
    let op = VPDFUOperation.dfuOperationShare()
    op.veepooSDKStartDfu(withFilePath: path, result: { [weak self] progress, state in
      guard let self = self else { return }
      let raw = Int(state.rawValue)
      let st = self.iosDfuStateString(raw: raw)
      let p = Int(min(100, max(0, progress.rounded())))
      let payload: [String: Any] = [
        "deviceId": self.connectedDeviceId ?? "",
        "progress": p,
        "state": st
      ]
      DispatchQueue.main.async {
        self.sendEvent(FIRMWARE_DFU_PROGRESS, payload)
        switch raw {
        case 3:
          if self.isFirmwareDfuActive {
            self.isFirmwareDfuActive = false
            promise.resolve(nil)
          }
        case 0, 4:
          if self.isFirmwareDfuActive {
            self.isFirmwareDfuActive = false
            let msg = st == "fileNotExist"
              ? "Firmware file missing or invalid"
              : "Firmware update failed"
            promise.reject("OPERATION_FAILED", msg)
          }
        default:
          break
        }
      }
    })
    #endif
  }
}
