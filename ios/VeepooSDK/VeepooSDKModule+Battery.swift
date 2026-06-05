import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {
  func handleReadBattery(promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(["level": 88, "percent": 88, "powerModel": 0, "state": 1, "bat": 0, "isPercent": true, "isLowBattery": false])
    #else
    guard let peripheralManage = self.peripheralManage else {
      promise.reject("SDK_NOT_INITIALIZED", "Peripheral manager is nil")
      return
    }
    var hasResolved = false
    // 厂商电量回调依赖 RunLoop —— 从 Expo 模块队列（无运行 RunLoop）调用时
    // 回调永远不会触发，promise 永远挂起。与 readDeviceAllData 相同的约束：
    // 必须从主线程进入。
    // The vendor battery completion is runloop-driven — invoked from the
    // Expo module queue (no running runloop) it never fires and the promise
    // hangs forever (observed 2026-06-05: "battery.read.start" with no
    // completion and no rejection). Same constraint as readDeviceAllData
    // and the heart-rate test timer; always enter from main.
    DispatchQueue.main.async {
      peripheralManage.veepooSDKReadDeviceBatteryAndChargeInfo { isPercent, chargeState, percenTypeIsLowBat, battery in
        if hasResolved { return }
        hasResolved = true
        let payload: [String: Any] = [
          "level": battery,
          "percent": isPercent ? battery : 0,
          "powerModel": 0,
          "state": chargeState.rawValue,
          "bat": 0,
          "isPercent": isPercent,
          "isLowBattery": percenTypeIsLowBat
        ]
        self.sendEvent(BATTERY_DATA, ["deviceId": self.connectedDeviceId ?? "", "data": payload])
        promise.resolve(payload)
      }
    }
    #endif
  }
}
