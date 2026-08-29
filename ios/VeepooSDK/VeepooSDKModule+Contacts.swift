import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {

  // MARK: - Helpers

  private func contactsSupported() -> Bool {
    let pkg3 = cachedDeviceFunctions["package3"] as? [String: Any]
    return pkg3?["contact_function"] as? String != "unsupported"
  }

  private func sosSupported() -> Bool {
    let pkg3 = cachedDeviceFunctions["package3"] as? [String: Any]
    // contactType == 2 means SOS contacts supported
    let contactType = (pkg3?["contact_type"] as? NSNumber)?.intValue ?? 0
    return contactType >= 2
  }

  private func contactModelToDict(_ model: VPDeviceContactsModel) -> [String: Any] {
    return [
      "contactID": model.contactID,
      "name": model.nickName,
      "phoneNumber": model.phoneNumber,
      "isSOS": model.isSOS,
    ]
  }

  // MARK: - readContacts

  func handleReadContacts(crc: Int?, promise: Promise) {
    #if targetEnvironment(simulator)
    rejectUnavailableOnSimulator(promise, "readContacts")
    #else
    guard self.isInitialized else {
      promise.reject("SDK_NOT_INITIALIZED", "SDK not initialized")
      return
    }
    guard let peripheralManage = self.peripheralManage else {
      promise.reject("DEVICE_NOT_CONNECTED", "No device connected")
      return
    }
    guard self.connectionState == .ready else {
      promise.reject("DEVICE_NOT_READY", "Device is not ready")
      return
    }
    guard contactsSupported() else {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support contacts")
      return
    }

    // iOS API: read uses VPDeviceContactsOpCodeRead with a nil opModel
    let promiseBox = self.makePromiseBox(promise)
    peripheralManage.veepooSDKSettingDeviceContacts(
      with: .read,
      opModel: nil,
      toID: 0
    ) { state, contactModels in
      switch state {
      case .complete:
        let result = (contactModels ?? []).map { self.contactModelToDict($0) }
        promiseBox.resolve(result)
      case .noFunction:
        promiseBox.reject("CAPABILITY_UNSUPPORTED", "Band does not support contacts")
      default:
        promiseBox.reject("OPERATION_FAILED", "Read contacts failed")
      }
    }
    #endif
  }

  // MARK: - addContact

  func handleAddContact(_ data: [String: Any], promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(nil)
    #else
    guard self.isInitialized else {
      promise.reject("SDK_NOT_INITIALIZED", "SDK not initialized")
      return
    }
    guard let peripheralManage = self.peripheralManage else {
      promise.reject("DEVICE_NOT_CONNECTED", "No device connected")
      return
    }
    guard self.connectionState == .ready else {
      promise.reject("DEVICE_NOT_READY", "Device is not ready")
      return
    }
    guard contactsSupported() else {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support contacts")
      return
    }

    let model = VPDeviceContactsModel()
    model.nickName = (data["name"] as? String) ?? ""
    model.phoneNumber = (data["phoneNumber"] as? String) ?? ""
    model.isSOS = (data["isSOS"] as? Bool) ?? false

    let promiseBox = self.makePromiseBox(promise)
    peripheralManage.veepooSDKSettingDeviceContacts(
      with: .add,
      opModel: model,
      toID: 0
    ) { state, _ in
      switch state {
      case .complete:
        promiseBox.resolve(nil)
      case .noFunction:
        promiseBox.reject("CAPABILITY_UNSUPPORTED", "Band does not support contacts")
      default:
        promiseBox.reject("OPERATION_FAILED", "Add contact failed")
      }
    }
    #endif
  }

  // MARK: - deleteContact

  func handleDeleteContact(contactId: Int, promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(nil)
    #else
    guard self.isInitialized else {
      promise.reject("SDK_NOT_INITIALIZED", "SDK not initialized")
      return
    }
    guard let peripheralManage = self.peripheralManage else {
      promise.reject("DEVICE_NOT_CONNECTED", "No device connected")
      return
    }
    guard self.connectionState == .ready else {
      promise.reject("DEVICE_NOT_READY", "Device is not ready")
      return
    }
    guard contactsSupported() else {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support contacts")
      return
    }

    let model = VPDeviceContactsModel()
    model.contactID = Int32(contactId)

    let promiseBox = self.makePromiseBox(promise)
    peripheralManage.veepooSDKSettingDeviceContacts(
      with: .delete,
      opModel: model,
      toID: 0
    ) { state, _ in
      switch state {
      case .complete:
        promiseBox.resolve(nil)
      case .noFunction:
        promiseBox.reject("CAPABILITY_UNSUPPORTED", "Band does not support contacts")
      default:
        promiseBox.reject("OPERATION_FAILED", "Delete contact failed")
      }
    }
    #endif
  }

  // MARK: - setContactSosState

  func handleSetContactSosState(contactId: Int, isOpen: Bool, promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(nil)
    #else
    guard self.isInitialized else {
      promise.reject("SDK_NOT_INITIALIZED", "SDK not initialized")
      return
    }
    guard let peripheralManage = self.peripheralManage else {
      promise.reject("DEVICE_NOT_CONNECTED", "No device connected")
      return
    }
    guard self.connectionState == .ready else {
      promise.reject("DEVICE_NOT_READY", "Device is not ready")
      return
    }
    guard sosSupported() else {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support SOS contacts")
      return
    }

    let model = VPDeviceContactsModel()
    model.contactID = Int32(contactId)
    model.isSOS = isOpen

    // .edit opCode sets the SOS status on an existing contact
    let promiseBox = self.makePromiseBox(promise)
    peripheralManage.veepooSDKSettingDeviceContacts(
      with: .edit,
      opModel: model,
      toID: 0
    ) { state, _ in
      switch state {
      case .complete:
        promiseBox.resolve(nil)
      case .noFunction:
        promiseBox.reject("CAPABILITY_UNSUPPORTED", "Band does not support SOS contacts")
      default:
        promiseBox.reject("OPERATION_FAILED", "Set contact SOS state failed")
      }
    }
    #endif
  }

  // MARK: - readSosCallTimes

  func handleReadSosCallTimes(promise: Promise) {
    #if targetEnvironment(simulator)
    rejectUnavailableOnSimulator(promise, "readSosCallTimes")
    #else
    guard self.isInitialized else {
      promise.reject("SDK_NOT_INITIALIZED", "SDK not initialized")
      return
    }
    guard let peripheralManage = self.peripheralManage else {
      promise.reject("DEVICE_NOT_CONNECTED", "No device connected")
      return
    }
    guard self.connectionState == .ready else {
      promise.reject("DEVICE_NOT_READY", "Device is not ready")
      return
    }
    guard sosSupported() else {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support SOS contacts")
      return
    }

    let promiseBox = self.makePromiseBox(promise)
    peripheralManage.veepooSDKSettingDeviceContactsSOSInfo(
      withOpCode: .read,
      times: 0
    ) { state, times, timesMin, timesMax in
      switch state {
      case .complete:
        promiseBox.resolve([
          "times": times,
          "minTimes": timesMin,
          "maxTimes": timesMax,
        ])
      case .noFunction:
        promiseBox.reject("CAPABILITY_UNSUPPORTED", "Band does not support SOS contacts")
      default:
        promiseBox.reject("OPERATION_FAILED", "Read SOS call times failed")
      }
    }
    #endif
  }

  // MARK: - setSosCallTimes

  func handleSetSosCallTimes(times: Int, promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(nil)
    #else
    guard self.isInitialized else {
      promise.reject("SDK_NOT_INITIALIZED", "SDK not initialized")
      return
    }
    guard let peripheralManage = self.peripheralManage else {
      promise.reject("DEVICE_NOT_CONNECTED", "No device connected")
      return
    }
    guard self.connectionState == .ready else {
      promise.reject("DEVICE_NOT_READY", "Device is not ready")
      return
    }
    guard sosSupported() else {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support SOS contacts")
      return
    }

    let promiseBox = self.makePromiseBox(promise)
    peripheralManage.veepooSDKSettingDeviceContactsSOSInfo(
      withOpCode: .setting,
      times: Int32(times)
    ) { state, _, _, _ in
      switch state {
      case .complete:
        promiseBox.resolve(nil)
      case .noFunction:
        promiseBox.reject("CAPABILITY_UNSUPPORTED", "Band does not support SOS contacts")
      default:
        promiseBox.reject("OPERATION_FAILED", "Set SOS call times failed")
      }
    }
    #endif
  }
}
