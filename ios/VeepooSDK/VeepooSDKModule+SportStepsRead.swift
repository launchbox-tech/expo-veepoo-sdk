import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {
  // MARK: 读取运动步数数据
  func handleReadSportStepData(date: String?, promise: Promise) {
    #if !targetEnvironment(simulator)
    guard let manager = VPBleCentralManage.sharedBleManager(),
          let deviceAddress = manager.peripheralModel?.deviceAddress else {
      promise.reject("DEVICE_NOT_CONNECTED", "No device connected or address unavailable")
      return
    }
    
    let queryDate = date ?? self.getDateString(dayOffset: 0)
    let userStature: UInt = manager.peripheralModel?.deviceStature ?? 170
    
    let promiseBox = self.makePromiseBox(promise)
    DispatchQueue.main.async {
      VPDataBaseOperation.veepooSDKGetStepData(withDate: queryDate, andTableID: deviceAddress, changeUserStature: userStature) { stepDict in
        guard let dict = stepDict as? [String: Any] else {
          let emptyResult: [String: Any] = [
            "date": queryDate,
            "stepCount": 0,
            "distance": 0.0,
            "calories": 0.0
          ]
          promiseBox.resolve(emptyResult)
          return
        }
        
        let stepValue = dict["Step"]
        let disValue = dict["Dis"]
        let calValue = dict["Cal"]
        
        let step = self.getInt(stepValue)
        let disKm = self.getDouble(disValue)
        let cal = self.getDouble(calValue)
        
        let result: [String: Any] = [
          "date": queryDate,
          "stepCount": step,
          "distance": disKm,
          "calories": cal
        ]
        
        self.sendEvent(SPORT_STEP_DATA, [
          "deviceId": self.connectedDeviceId ?? "",
          "date": queryDate,
          "data": result
        ])

        promiseBox.resolve(result)
      }
    }
    #else
    promise.resolve(["date": "2024-01-01", "stepCount": 5000, "distance": 3500, "calories": 200.0])
    #endif
  }
}
