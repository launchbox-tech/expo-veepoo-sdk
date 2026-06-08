import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {
  // MARK: 开始压力测试
  func handleStartStressTest(promise: Promise) {
    #if !targetEnvironment(simulator)
    guard self.ensureMeasurementCanStart(type: "stress", promise: promise) else {
      return
    }
    guard let peripheralManage = self.peripheralManage else { return }

    let stressType = self.bleManager?.peripheralModel?.stressType ?? 0
    print("[Stress] starting — stressType: \(stressType)")

    // PROVEN via vp_sdk_logs.txt: the band streams `89 06 01 00 <progress> <stress>`
    // climbing from 0→100 over ~17s, with the stress value in the progress-100
    // frame. Our old handler treated the FIRST callback — an early .complete/.over
    // with progress 0 — as terminal and sent stop (`89 06 02`), killing the
    // measurement at 0%. Fix: ignore an early .complete/.over until the band has
    // real output (progress >= 100 or stress > 0). Only genuine error states stop
    // early. A watchdog ends cleanly if the band never streams to completion.
    var finished = false
    let finalize: (String, Int, Int, Int) -> Void = { status, rawState, prog, stressVal in
      if finished { return }
      finished = true
      peripheralManage.veepooSDK_stressTestStart(false) { _, _, _ in }
      self.finishMeasurement(type: "stress", reason: "terminal_\(status)_\(rawState)")
      self.sendEvent(STRESS_DATA, [
        "deviceId": self.connectedDeviceId ?? "",
        "data": ["stress": stressVal, "progress": prog, "rawState": rawState, "status": status, "isEnd": true]
      ])
    }

    peripheralManage.veepooSDK_stressTestStart(true) { state, progress, stress in
      print("[Stress] cb state=\(state.rawValue) progress=\(progress) stress=\(stress)")
      if finished { return }

      switch state {
      case .noFunction: finalize("unsupported", Int(state.rawValue), progress, stress); return
      case .deviceBusy: finalize("deviceBusy", Int(state.rawValue), progress, stress); return
      case .lowPower:   finalize("lowPower", Int(state.rawValue), progress, stress); return
      case .notWear:    finalize("notWear", Int(state.rawValue), progress, stress); return
      case .over, .complete:
        // Real completion only once the band actually produced output. An early
        // .complete/.over with progress 0 + stress 0 is the start-ack — ignore it.
        if progress >= 100 || stress > 0 {
          finalize(state == .over ? "over" : "complete", Int(state.rawValue), progress, max(stress, 0))
          return
        }
      @unknown default: break
      }

      // Still measuring — surface progress and keep listening (do NOT stop).
      self.sendEvent(STRESS_DATA, [
        "deviceId": self.connectedDeviceId ?? "",
        "data": ["stress": stress, "progress": progress, "rawState": state.rawValue, "status": "testing", "isEnd": false]
      ])
    }

    // Watchdog: don't hang at 0% if the band never streams to completion.
    DispatchQueue.main.asyncAfter(deadline: .now() + 35) {
      if !finished {
        print("[Stress] watchdog timeout — no completion in 35s")
        finalize("timeout", -1, 0, 0)
      }
    }

    promise.resolve(nil)
    #else
    promise.resolve(nil)
    #endif
  }

  // MARK: 停止压力测试
  func handleStopStressTest(promise: Promise) {
    #if !targetEnvironment(simulator)
    self.peripheralManage?.veepooSDK_stressTestStart(false) { _, _, _ in }
    self.finishMeasurement(type: "stress", reason: "manual_stop")
    #endif
    promise.resolve(nil)
  }
}
