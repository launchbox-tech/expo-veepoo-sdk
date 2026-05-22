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
    
    DispatchQueue.main.async {
      VPDataBaseOperation.veepooSDKGetStepData(withDate: queryDate, andTableID: deviceAddress, changeUserStature: userStature) { stepDict in
        guard let dict = stepDict as? [String: Any] else {
          let emptyResult: [String: Any] = [
            "date": queryDate,
            "stepCount": 0,
            "distance": 0.0,
            "calories": 0.0
          ]
          promise.resolve(emptyResult)
          return
        }
        
        let stepValue: Any = dict["Step"]
        let disValue: Any = dict["Dis"]
        let calValue: Any = dict["Cal"]
        
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
        
        promise.resolve(result)
      }
    }
    #endif
  }
}
