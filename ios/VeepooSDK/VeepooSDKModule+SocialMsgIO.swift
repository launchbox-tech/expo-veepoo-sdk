import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {
  func handleReadSocialMsgData(promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve([
      "phone": "support", "sms": "support", "wechat": "support", "qq": "support",
      "facebook": "support", "twitter": "support", "instagram": "support",
      "linkedin": "unsupported", "whatsapp": "unsupported", "line": "unsupported",
      "skype": "unsupported", "email": "support", "other": "support"
    ])
    #else
    guard let manager = self.bleManager, let model = manager.peripheralModel else {
      promise.reject("DEVICE_NOT_CONNECTED", "No device connected")
      return
    }
    let ancsData = model.deviceAncsData ?? Data()
    let result = self.parseSocialMsgData(ancsData)
    self.sendEvent(SOCIAL_MSG_DATA, ["deviceId": self.connectedDeviceId ?? "", "data": result])
    promise.resolve(result)
    #endif
  }

  func handleWriteSocialMsgData(data: [String: Any], promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve("success")
    #else
    guard let peripheralManage = self.peripheralManage else {
      promise.reject("DEVICE_NOT_CONNECTED", "No device connected")
      return
    }

    // JS channel key → VPSettingMessageSwitchType raw value
    let channelToTypeRaw: [String: Int] = [
      "phone": 2,   // VPSettingCall
      "sms": 3,     // VPSettingSMS
      "wechat": 4,  // VPSettingWechat
      "qq": 5,      // VPSettingQQ
      "facebook": 7,  // VPSettingFaceBook
      "twitter": 8,   // VPSettingTwitter
      "linkedin": 10, // VPSettingLinkedln
      "whatsapp": 11, // VPSettingwhatsapp
      "line": 12,     // VPSettingLine
      "instagram": 13, // VPSettingInstagram
      "skype": 15,    // VPSettingSkype
      "email": 16,    // VPSettingGMail
      "other": 19,    // VPSettingOtherPlatform
    ]

    var models: [VPDeviceMessageTypeModel] = []
    for (channel, value) in data {
      guard let rawType = channelToTypeRaw[channel],
            let messageType = VPSettingMessageSwitchType(rawValue: rawType),
            let status = value as? String else { continue }
      let model = VPDeviceMessageTypeModel()
      model.messageType = messageType
      model.open = status == "open"
      models.append(model)
    }

    guard !models.isEmpty else {
      promise.resolve("fail")
      return
    }

    peripheralManage.veepooSDKBatchSetting(with: models) { completeState in
      // 1=open, 2=close, 4=complete → success; 0=unknown, 3=failure → fail
      let success = completeState.rawValue == 1 || completeState.rawValue == 2 || completeState.rawValue == 4
      promise.resolve(success ? "success" : "fail")
    }
    #endif
  }
}
