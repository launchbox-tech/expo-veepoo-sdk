package expo.modules.veepoo

import android.os.Handler
import android.os.Looper
import com.inuker.bluetooth.library.Code
import com.inuker.bluetooth.library.connect.response.BleWriteResponse
import com.veepoo.protocol.VPOperateManager
import com.veepoo.protocol.listener.base.IBleWriteResponse
import com.veepoo.protocol.listener.data.IBodyComponentReadDataListener
import com.veepoo.protocol.listener.data.IBodyComponentReadIdListener
import com.veepoo.protocol.listener.data.IDeviceManualDetectDataListener
import com.veepoo.protocol.listener.data.IECGReadDataListener
import com.veepoo.protocol.listener.data.IECGReadIdListener
import com.veepoo.protocol.listener.data.IHRVOriginDataListener
import com.veepoo.protocol.listener.data.ITemptureDataListener
import com.veepoo.protocol.model.datas.BloodGlucoseManualData
import com.veepoo.protocol.model.datas.BodyComponent
import com.veepoo.protocol.model.datas.BodyTemperatureManualData
import com.veepoo.protocol.model.datas.EcgDetectResult
import com.veepoo.protocol.model.datas.HRVOriginData
import com.veepoo.protocol.model.datas.HrvManualData
import com.veepoo.protocol.model.datas.MetoManualData
import com.veepoo.protocol.model.datas.MiniCheckupManualData
import com.veepoo.protocol.model.datas.PressureManualData
import com.veepoo.protocol.model.datas.BloodOxygenManualData
import com.veepoo.protocol.model.datas.BloodPressureManualData
import com.veepoo.protocol.model.datas.BloodComponentManualData
import com.veepoo.protocol.model.datas.EmotionManualData
import com.veepoo.protocol.model.datas.FatigueManualData
import com.veepoo.protocol.model.datas.HeartRateManualData
import com.veepoo.protocol.model.datas.SkinConductanceManualData
import com.veepoo.protocol.model.datas.TemptureData
import com.veepoo.protocol.model.datas.TimeData
import com.veepoo.protocol.model.enums.DeviceManualDataType
import com.veepoo.protocol.model.enums.EEcgDataType
import com.veepoo.protocol.model.settings.ReadOriginSetting
import com.veepoo.protocol.shareprence.VpSpGetUtil
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.ModuleDefinitionBuilder
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.concurrent.atomic.AtomicBoolean

fun ModuleDefinitionBuilder.defineStoredVitals(module: VeepooSDKModule) {

  // MARK: — Temperature

  AsyncFunction("readStoredTemperatureData") { date: String?, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null); return@AsyncFunction
    }
    val vpUtil = VpSpGetUtil.getVpSpVariInstance(module.context)
    if (!vpUtil.isSupportReadTempture()) {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support temperature history", null); return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null); return@AsyncFunction
    }
    val resolved = AtomicBoolean(false)
    val uiHandler = Handler(Looper.getMainLooper())
    val timeout = Runnable { if (resolved.compareAndSet(false, true)) promise.resolve(null) }
    uiHandler.postDelayed(timeout, 20_000)

    manager.readTemptureDataBySetting(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != com.veepoo.protocol.model.enums.Code.REQUEST_SUCCESS) {
            uiHandler.removeCallbacks(timeout)
            if (resolved.compareAndSet(false, true)) promise.resolve(null)
          }
        }
      },
      object : ITemptureDataListener {
        override fun onTemptureDataListDataChange(list: List<TemptureData>?) {
          list?.forEach { item ->
            val ts = formatUnixTs(item.mTime?.let { td ->
              String.format("%04d-%02d-%02d %02d:%02d", td.year, td.month, td.day, td.hour, td.minute)
            } ?: unixToTimestamp(0))
            module.sendEvent(STORED_TEMPERATURE_DATA, mapOf(
              "deviceId" to (module.connectedDeviceId ?: ""),
              "data" to mapOf(
                "timestamp" to ts,
                "temperature" to item.tempture.toDouble(),
                "bodyTemperature" to item.baseTempture.toDouble()
              )
            ))
          }
        }
        override fun onReadOriginProgress(progress: Float) {}
        override fun onReadOriginProgressDetail(i: Int, s: String?, i2: Int, i3: Int) {}
        override fun onReadOriginComplete() {
          uiHandler.removeCallbacks(timeout)
          if (resolved.compareAndSet(false, true)) promise.resolve(null)
        }
      },
      ReadOriginSetting(module.watchday, 0, false, 0)
    )
  }

  // MARK: — Blood Glucose

  AsyncFunction("readStoredBloodGlucoseData") { date: String?, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null); return@AsyncFunction
    }
    val vpUtil = VpSpGetUtil.getVpSpVariInstance(module.context)
    if (!vpUtil.isSupportBloodGlucose()) {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support blood glucose history", null); return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null); return@AsyncFunction
    }
    val resolved = AtomicBoolean(false)
    val uiHandler = Handler(Looper.getMainLooper())
    val timeout = Runnable { if (resolved.compareAndSet(false, true)) promise.resolve(null) }
    uiHandler.postDelayed(timeout, 20_000)

    manager.readDeviceManualData(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != com.veepoo.protocol.model.enums.Code.REQUEST_SUCCESS) {
            uiHandler.removeCallbacks(timeout)
            if (resolved.compareAndSet(false, true)) promise.resolve(null)
          }
        }
      },
      0L,
      listOf(DeviceManualDataType.BLOOD_GLUCOSE),
      emptyList(),
      object : EmptyManualListener() {
        override fun onBloodGlucoseDataChange(list: List<BloodGlucoseManualData>?) {
          list?.forEach { item ->
            module.sendEvent(STORED_BLOOD_GLUCOSE_DATA, mapOf(
              "deviceId" to (module.connectedDeviceId ?: ""),
              "data" to mapOf(
                "timestamp" to unixToTimestamp(item.timeStamp.toLong()),
                "bloodGlucose" to item.bloodGlucoseValue.toDouble(),
                "level" to (item.risk?.name?.lowercase() ?: null)
              )
            ))
          }
        }
        override fun onReadComplete() {
          uiHandler.removeCallbacks(timeout)
          if (resolved.compareAndSet(false, true)) promise.resolve(null)
        }
        override fun onReadFail() {
          uiHandler.removeCallbacks(timeout)
          if (resolved.compareAndSet(false, true)) promise.resolve(null)
        }
      }
    )
  }

  // MARK: — HRV

  AsyncFunction("readStoredHrvData") { date: String?, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null); return@AsyncFunction
    }
    val vpUtil = VpSpGetUtil.getVpSpVariInstance(module.context)
    if (!vpUtil.isSupportHRV()) {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support HRV history", null); return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null); return@AsyncFunction
    }
    val resolved = AtomicBoolean(false)
    val uiHandler = Handler(Looper.getMainLooper())
    val timeout = Runnable { if (resolved.compareAndSet(false, true)) promise.resolve(null) }
    uiHandler.postDelayed(timeout, 20_000)

    manager.readHRVOrigin(
      object : IBleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != com.veepoo.protocol.model.enums.Code.REQUEST_SUCCESS) {
            uiHandler.removeCallbacks(timeout)
            if (resolved.compareAndSet(false, true)) promise.resolve(null)
          }
        }
      },
      object : IHRVOriginDataListener {
        override fun onHRVOriginListener(data: HRVOriginData?) {
          val d = data ?: return
          val ts = d.mTime?.let { td ->
            String.format("%04d-%02d-%02d %02d:%02d", td.year, td.month, td.day, td.hour, td.minute)
          } ?: d.date ?: ""
          val rrList = d.rrValue?.toList() ?: emptyList()
          module.sendEvent(STORED_HRV_DATA, mapOf(
            "deviceId" to (module.connectedDeviceId ?: ""),
            "data" to mapOf(
              "timestamp" to ts,
              "hrv" to d.hrvValue,
              "rrIntervals" to rrList
            )
          ))
        }
        override fun onReadOriginProgress(progress: Float) {}
        override fun onReadOriginProgressDetail(i: Int, s: String?, i2: Int, i3: Int) {}
        override fun onDayHrvScore(score: Int, date: String?, type: Int) {}
        override fun onReadOriginComplete() {
          uiHandler.removeCallbacks(timeout)
          if (resolved.compareAndSet(false, true)) promise.resolve(null)
        }
      },
      0
    )
  }

  // MARK: — ECG

  AsyncFunction("readStoredEcgData") { date: String?, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null); return@AsyncFunction
    }
    val vpUtil = VpSpGetUtil.getVpSpVariInstance(module.context)
    if (!vpUtil.isSupportECG()) {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support ECG history", null); return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null); return@AsyncFunction
    }
    val resolved = AtomicBoolean(false)
    val uiHandler = Handler(Looper.getMainLooper())
    val timeout = Runnable { if (resolved.compareAndSet(false, true)) promise.resolve(null) }
    uiHandler.postDelayed(timeout, 30_000)

    val dateTime = TimeData(System.currentTimeMillis())
    manager.readECGId(
      object : BleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) {
            uiHandler.removeCallbacks(timeout)
            if (resolved.compareAndSet(false, true)) promise.resolve(null)
          }
        }
      },
      dateTime,
      EEcgDataType.ALL,
      object : IECGReadIdListener {
        override fun readIdFinish(ids: IntArray?) {
          if (ids.isNullOrEmpty()) {
            uiHandler.removeCallbacks(timeout)
            if (resolved.compareAndSet(false, true)) promise.resolve(null)
            return
          }
          manager.readECGManuallyData(
            object : BleWriteResponse {
              override fun onResponse(code: Int) {
                if (code != Code.REQUEST_SUCCESS) {
                  uiHandler.removeCallbacks(timeout)
                  if (resolved.compareAndSet(false, true)) promise.resolve(null)
                }
              }
            },
            ids,
            object : IECGReadDataListener {
              override fun readDataFinish(list: List<EcgDetectResult>?) {
                uiHandler.removeCallbacks(timeout)
                list?.forEach { item ->
                  val ts = item.timeBean?.let { td ->
                    String.format("%04d-%02d-%02d %02d:%02d:%02d", td.year, td.month, td.day, td.hour, td.minute, td.second)
                  } ?: ""
                  module.sendEvent(STORED_ECG_DATA, mapOf(
                    "deviceId" to (module.connectedDeviceId ?: ""),
                    "data" to mapOf(
                      "timestamp" to ts,
                      "duration" to item.duration,
                      "aveHeart" to item.aveHeart,
                      "aveHrv" to item.aveHrv,
                      "aveResRate" to item.aveResRate,
                      "aveQT" to item.aveQT,
                      "filterSignals" to (item.filterSignals?.toList() ?: emptyList<Int>())
                    )
                  ))
                }
                if (resolved.compareAndSet(false, true)) promise.resolve(null)
              }
              override fun readDiagnosisDataFinish(list: List<com.veepoo.protocol.model.datas.EcgDiagnosis>?) {}
            }
          )
        }
      }
    )
  }

  // MARK: — Body Composition

  AsyncFunction("readStoredBodyCompositionData") { date: String?, promise: Promise ->
    if (!module.isInitialized || module.connectedDeviceId == null) {
      promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null); return@AsyncFunction
    }
    val vpUtil = VpSpGetUtil.getVpSpVariInstance(module.context)
    if (!vpUtil.isSupportBodyComponent()) {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support body composition history", null); return@AsyncFunction
    }
    val manager = VPOperateManager.getInstance() ?: run {
      promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null); return@AsyncFunction
    }
    val resolved = AtomicBoolean(false)
    val uiHandler = Handler(Looper.getMainLooper())
    val timeout = Runnable { if (resolved.compareAndSet(false, true)) promise.resolve(null) }
    uiHandler.postDelayed(timeout, 30_000)

    manager.readBodyComponentId(
      object : BleWriteResponse {
        override fun onResponse(code: Int) {
          if (code != Code.REQUEST_SUCCESS) {
            uiHandler.removeCallbacks(timeout)
            if (resolved.compareAndSet(false, true)) promise.resolve(null)
          }
        }
      },
      object : IBodyComponentReadIdListener {
        override fun readIdFinish(ids: ArrayList<Int>?) {
          if (ids.isNullOrEmpty()) {
            uiHandler.removeCallbacks(timeout)
            if (resolved.compareAndSet(false, true)) promise.resolve(null)
            return
          }
          manager.readBodyComponentData(
            object : BleWriteResponse {
              override fun onResponse(code: Int) {
                if (code != Code.REQUEST_SUCCESS) {
                  uiHandler.removeCallbacks(timeout)
                  if (resolved.compareAndSet(false, true)) promise.resolve(null)
                }
              }
            },
            object : IBodyComponentReadDataListener {
              override fun readBodyComponentDataFinish(list: List<BodyComponent>?) {
                uiHandler.removeCallbacks(timeout)
                list?.forEach { item ->
                  val ts = item.timeBean?.let { td ->
                    String.format("%04d-%02d-%02d %02d:%02d:%02d", td.year, td.month, td.day, td.hour, td.minute, td.second)
                  } ?: ""
                  module.sendEvent(STORED_BODY_COMPOSITION_DATA, mapOf(
                    "deviceId" to (module.connectedDeviceId ?: ""),
                    "data" to mapOf(
                      "timestamp" to ts,
                      "bmi" to item.bmi.toDouble(),
                      "bodyFatPercentage" to item.bodyFatRate.toDouble(),
                      "fatMass" to item.fatRate.toDouble(),
                      "leanBodyMass" to item.fFM.toDouble(),
                      "muscleRate" to item.muscleRate.toDouble(),
                      "muscleMass" to item.muscleMass.toDouble(),
                      "subcutaneousFat" to item.subcutaneousFat.toDouble(),
                      "bodyMoisture" to item.bodyWater.toDouble(),
                      "waterContent" to item.waterContent.toDouble(),
                      "skeletalMuscleRate" to item.skeletalMuscleRate.toDouble(),
                      "boneMass" to item.boneMass.toDouble(),
                      "proportionOfProtein" to item.proteinProportion.toDouble(),
                      "proteinAmount" to item.proteinMass.toDouble(),
                      "basalMetabolicRate" to item.basalMetabolicRate.toDouble()
                    )
                  ))
                }
                if (resolved.compareAndSet(false, true)) promise.resolve(null)
              }
            },
            ids
          )
        }
      }
    )
  }
}

private fun unixToTimestamp(ts: Long): String {
  val sdf = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.US)
  return sdf.format(Date(ts * 1000))
}

private fun formatUnixTs(ts: String): String = ts

/** Stub implementations for IDeviceManualDetectDataListener to avoid boilerplate. */
private abstract class EmptyManualListener : IDeviceManualDetectDataListener {
  override fun onBloodPressureDataChange(list: List<BloodPressureManualData>?) {}
  override fun onHeartRateDataChange(list: List<HeartRateManualData>?) {}
  override fun onBloodGlucoseDataChange(list: List<BloodGlucoseManualData>?) {}
  override fun onPressureManualDataChange(list: List<PressureManualData>?) {}
  override fun onBloodOxygenDataChange(list: List<BloodOxygenManualData>?) {}
  override fun onBodyTemperatureDataChange(list: List<BodyTemperatureManualData>?) {}
  override fun onMetoManualDataChange(list: List<MetoManualData>?) {}
  override fun onHrvManualDataChange(list: List<HrvManualData>?) {}
  override fun onBloodComponentManualDataChange(list: List<BloodComponentManualData>?) {}
  override fun onMiniCheckupManualDataChange(list: List<MiniCheckupManualData>?) {}
  override fun onEmotionManualDataChange(list: List<EmotionManualData>?) {}
  override fun onFatigueManualDataChange(list: List<FatigueManualData>?) {}
  override fun onSkinConductanceManualDataChange(list: List<SkinConductanceManualData>?) {}
  override fun onReadProgress(progress: Float) {}
  override fun onReadComplete() {}
  override fun onReadFail() {}
}
