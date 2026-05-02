package expo.modules.veepoo

import android.util.Log
import com.inuker.bluetooth.library.Code
import com.veepoo.protocol.VPOperateManager
import com.veepoo.protocol.listener.base.IBleWriteResponse
import com.veepoo.protocol.listener.data.IContactOptListener
import com.veepoo.protocol.listener.data.ISOSCallTimesListener
import com.veepoo.protocol.model.datas.Contact
import com.veepoo.protocol.model.enums.EContactOpt
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

fun ModuleDefinitionBuilder.defineContacts(module: VeepooSDKModule) {

  // ── readContacts ─────────────────────────────────────────────────────────
  AsyncFunction("readContacts") { crc: Int?, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    val pkg3 = module.cachedDeviceFunctions["pkg3"]
    if (pkg3?.get("contactFunction") as? String == "unsupported") {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support contacts", null)
      return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    val effectiveCrc = crc ?: 0
    var done = false
    val listener = object : IContactOptListener {
      override fun onContactReadSuccess(contactList: List<Contact>) {
        if (done) return
        done = true
        promise.resolve(contactList.map { c ->
          mapOf(
            "contactID" to c.contactID,
            "name" to (c.name ?: ""),
            "phoneNumber" to (c.phoneNumber ?: ""),
            "isSOS" to c.isSettingSOS,
            "isSupportSOS" to c.isSupportSOS,
          )
        })
      }
      override fun onContactReadASSameCRC() {
        if (done) return
        done = true
        // CRC matches — return empty list; caller holds the cached copy
        promise.resolve(emptyList<Any>())
      }
      override fun onContactReadFailed() {
        if (done) return
        done = true
        promise.reject("OPERATION_FAILED", "Read contacts failed", null)
      }
      override fun onContactOptSuccess(opt: EContactOpt, crc: Int) {}
      override fun onContactOptFailed(opt: EContactOpt) {}
    }
    manager.readContact(
      effectiveCrc,
      listener,
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) Log.e(TAG, "readContacts: write code=$code")
        }
      }
    )
  }

  // ── addContact ────────────────────────────────────────────────────────────
  AsyncFunction("addContact") { data: Map<String, Any?>, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    val pkg3 = module.cachedDeviceFunctions["pkg3"]
    if (pkg3?.get("contactFunction") as? String == "unsupported") {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support contacts", null)
      return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    val name = (data["name"] as? String)?.trim() ?: run {
      promise.reject("INVALID_ARGUMENT", "name is required", null)
      return@AsyncFunction
    }
    val phone = (data["phoneNumber"] as? String)?.trim() ?: run {
      promise.reject("INVALID_ARGUMENT", "phoneNumber is required", null)
      return@AsyncFunction
    }
    val isSOS = data["isSOS"] as? Boolean ?: false
    val contact = Contact(0, name, phone, isSOS, false)
    var done = false
    manager.addContact(
      contact,
      object : IContactOptListener {
        override fun onContactOptSuccess(opt: EContactOpt, crc: Int) {
          if (done) return
          done = true
          promise.resolve(null)
        }
        override fun onContactOptFailed(opt: EContactOpt) {
          if (done) return
          done = true
          promise.reject("OPERATION_FAILED", "Add contact failed", null)
        }
        override fun onContactReadSuccess(contactList: List<Contact>) {}
        override fun onContactReadASSameCRC() {}
        override fun onContactReadFailed() {}
      },
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) Log.e(TAG, "addContact: write code=$code")
        }
      }
    )
  }

  // ── deleteContact ─────────────────────────────────────────────────────────
  AsyncFunction("deleteContact") { contactId: Int, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    val pkg3 = module.cachedDeviceFunctions["pkg3"]
    if (pkg3?.get("contactFunction") as? String == "unsupported") {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support contacts", null)
      return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    val contact = Contact(contactId, "", "", false, false)
    var done = false
    manager.deleteContact(
      contact,
      object : IContactOptListener {
        override fun onContactOptSuccess(opt: EContactOpt, crc: Int) {
          if (done) return
          done = true
          promise.resolve(null)
        }
        override fun onContactOptFailed(opt: EContactOpt) {
          if (done) return
          done = true
          promise.reject("OPERATION_FAILED", "Delete contact failed", null)
        }
        override fun onContactReadSuccess(contactList: List<Contact>) {}
        override fun onContactReadASSameCRC() {}
        override fun onContactReadFailed() {}
      },
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) Log.e(TAG, "deleteContact: write code=$code")
        }
      }
    )
  }

  // ── setContactSosState ────────────────────────────────────────────────────
  AsyncFunction("setContactSosState") { contactId: Int, isOpen: Boolean, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    val pkg3 = module.cachedDeviceFunctions["pkg3"]
    if (pkg3?.get("contactFunction") as? String == "unsupported") {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support contacts", null)
      return@AsyncFunction
    }
    // contactType == 2 means SOS supported
    val contactType = (pkg3?.get("contactType") as? Number)?.toInt() ?: 0
    if (contactType < 2) {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support SOS contacts", null)
      return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    val contact = Contact(contactId, "", "", isOpen, true)
    var done = false
    manager.setContactSOSState(
      isOpen,
      contact,
      object : IContactOptListener {
        override fun onContactOptSuccess(opt: EContactOpt, crc: Int) {
          if (done) return
          done = true
          promise.resolve(null)
        }
        override fun onContactOptFailed(opt: EContactOpt) {
          if (done) return
          done = true
          promise.reject("OPERATION_FAILED", "Set contact SOS state failed", null)
        }
        override fun onContactReadSuccess(contactList: List<Contact>) {}
        override fun onContactReadASSameCRC() {}
        override fun onContactReadFailed() {}
      },
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) Log.e(TAG, "setContactSosState: write code=$code")
        }
      }
    )
  }

  // ── readSosCallTimes ──────────────────────────────────────────────────────
  AsyncFunction("readSosCallTimes") { promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    val pkg3 = module.cachedDeviceFunctions["pkg3"]
    val contactType = (pkg3?.get("contactType") as? Number)?.toInt() ?: 0
    if (contactType < 2) {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support SOS contacts", null)
      return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    var done = false
    manager.readSOSCallTimes(
      object : ISOSCallTimesListener {
        override fun onSOSCallTimesReadSuccess(times: Int, minTimes: Int, maxTimes: Int) {
          if (done) return
          done = true
          promise.resolve(mapOf("times" to times, "minTimes" to minTimes, "maxTimes" to maxTimes))
        }
        override fun onSOSCallTimesReadFailed() {
          if (done) return
          done = true
          promise.reject("OPERATION_FAILED", "Read SOS call times failed", null)
        }
        override fun onSOSCallTimesSettingSuccess(times: Int) {}
        override fun onSOSCallTimesSettingFailed() {}
      },
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) Log.e(TAG, "readSosCallTimes: write code=$code")
        }
      }
    )
  }

  // ── setSosCallTimes ───────────────────────────────────────────────────────
  AsyncFunction("setSosCallTimes") { times: Int, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
      return@AsyncFunction
    }
    val pkg3 = module.cachedDeviceFunctions["pkg3"]
    val contactType = (pkg3?.get("contactType") as? Number)?.toInt() ?: 0
    if (contactType < 2) {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support SOS contacts", null)
      return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
      return@AsyncFunction
    }
    var done = false
    manager.setSOSCallTimes(
      times,
      object : ISOSCallTimesListener {
        override fun onSOSCallTimesSettingSuccess(times: Int) {
          if (done) return
          done = true
          promise.resolve(null)
        }
        override fun onSOSCallTimesSettingFailed() {
          if (done) return
          done = true
          promise.reject("OPERATION_FAILED", "Set SOS call times failed", null)
        }
        override fun onSOSCallTimesReadSuccess(times: Int, minTimes: Int, maxTimes: Int) {}
        override fun onSOSCallTimesReadFailed() {}
      }
    )
  }
}
