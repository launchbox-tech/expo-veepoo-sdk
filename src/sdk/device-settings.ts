import { invokeNative } from "../bridge/native-invoke-pipeline.js";
import {
  normalizeAlarmList,
  normalizeAutoMeasureSettings,
  normalizeHeartRateAlarm,
  normalizeScreenLightDuration,
  normalizeScreenLightSettings,
  normalizeSedentaryReminderSettings,
  normalizeWristFlipWakeSettings,
  normalizeWomenHealthSettings,
  normalizeWatchFaceStyle,
  normalizeWeatherSettings,
  normalizeContactList,
  normalizeSosCallTimesSettings,
} from "../normalizers/index.js";
import {
  validatePersonalInfo,
  validateAutoMeasureSetting,
  validateAlarm,
  validateDeleteAlarm,
  validateDeviceTime,
  validateHeartRateAlarm,
  validateScreenLightDurationSeconds,
  validateScreenLightSettings,
  validateSedentaryReminderSettings,
  validateWristFlipWakeSettings,
  validateWomenHealthSettings,
  validateFirmwareDfuFilePath,
  validateReadWatchFaceStyleOptions,
  validateWatchFaceStyleSettings,
  validateWeatherSettings,
  validateWeatherData,
  validateNewContact,
  validateContactId,
  validateSosCallTimes,
} from "../validators/index.js";
import type {
  AutoMeasureSetting,
  DeviceAlarm,
  DeviceContact,
  HeartRateAlarm,
  Language,
  NewDeviceContact,
  OperationStatus,
  PersonalInfo,
  ScreenLightDuration,
  ScreenLightSettings,
  SedentaryReminderSettings,
  SosCallTimesSettings,
  WristFlipWakeSettings,
  WomenHealthSettings,
  WatchFaceDialType,
  WatchFaceStyle,
  WatchFaceStyleSettings,
  WeatherSettings,
  WeatherData,
} from "../types/index.js";
import type { VeepooSDKRuntime } from "./veepoo-sdk-runtime.js";

/** Device configuration: personal info, auto-measure, language, time, alarms. */
export class DeviceSettings {
  constructor(private readonly rt: VeepooSDKRuntime) {}

  syncPersonalInfo(info: PersonalInfo): Promise<boolean> {
    return invokeNative({
      validate: () => validatePersonalInfo(info),
      invoke: () => this.rt.native.syncPersonalInfo(info),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  async readAutoMeasureSetting(): Promise<AutoMeasureSetting[]> {
    return invokeNative({
      invoke: () => this.rt.native.readAutoMeasureSetting(),
      normalize: normalizeAutoMeasureSettings,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
      afterSuccess: (result: AutoMeasureSetting[]) => {
        this.rt.log("debug", "device", "autoMeasure.read", "Auto measure settings received", {
          deviceId: this.rt.state.connectedDeviceId ?? undefined,
          data: { count: result.length },
        });
      },
    });
  }

  async modifyAutoMeasureSetting(
    setting: Partial<AutoMeasureSetting>,
  ): Promise<AutoMeasureSetting[]> {
    validateAutoMeasureSetting(setting);
    this.rt.log(
      "info",
      "device",
      "autoMeasure.modify.start",
      "Modifying auto measure settings",
      {
        deviceId: this.rt.state.connectedDeviceId ?? undefined,
        data: setting,
      },
    );
    return invokeNative({
      invoke: () => this.rt.native.modifyAutoMeasureSetting(setting),
      normalize: normalizeAutoMeasureSettings,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
      afterSuccess: (result: AutoMeasureSetting[]) => {
        this.rt.log(
          "info",
          "device",
          "autoMeasure.modify.result",
          "Auto measure settings updated",
          {
            deviceId: this.rt.state.connectedDeviceId ?? undefined,
            data: { count: result.length },
          },
        );
      },
    });
  }

  setLanguage(language: Language): Promise<boolean> {
    return invokeNative({
      invoke: () => this.rt.native.setLanguage(language),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  async setDeviceTime(time?: Date): Promise<boolean> {
    validateDeviceTime(time);
    return invokeNative({
      invoke: () =>
        this.rt.native.setDeviceTime(
          time === undefined ? undefined : {
            year: time.getFullYear(),
            month: time.getMonth() + 1,
            day: time.getDate(),
            hour: time.getHours(),
            minute: time.getMinutes(),
            second: time.getSeconds(),
          },
        ),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  async readAlarms(): Promise<DeviceAlarm[]> {
    return invokeNative({
      invoke: () => this.rt.native.readAlarms(),
      normalize: normalizeAlarmList,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
      afterSuccess: (alarms: DeviceAlarm[]) => {
        this.rt.emitLocal("alarmData", { deviceId: this.rt.state.connectedDeviceId, alarms });
      },
    });
  }

  async setAlarm(alarm: DeviceAlarm): Promise<OperationStatus> {
    return invokeNative({
      validate: () => validateAlarm(alarm),
      invoke: () => this.rt.native.setAlarm(alarm),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  async deleteAlarm(alarmId: number): Promise<OperationStatus> {
    return invokeNative({
      validate: () => validateDeleteAlarm(alarmId),
      invoke: () => this.rt.native.deleteAlarm(alarmId),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  async readHeartRateAlarm(): Promise<HeartRateAlarm> {
    return invokeNative({
      invoke: () => this.rt.native.readHeartRateAlarm(),
      normalize: normalizeHeartRateAlarm,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
      afterSuccess: (data: HeartRateAlarm) => {
        this.rt.emitLocal("heartRateAlarmData", {
          deviceId: this.rt.state.connectedDeviceId ?? "",
          data,
        });
      },
    });
  }

  async setHeartRateAlarm(alarm: HeartRateAlarm): Promise<OperationStatus> {
    return invokeNative({
      validate: () => validateHeartRateAlarm(alarm),
      invoke: () => this.rt.native.setHeartRateAlarm(alarm),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
      afterSuccess: () => {
        this.rt.emitLocal("heartRateAlarmData", {
          deviceId: this.rt.state.connectedDeviceId ?? "",
          data: alarm,
        });
      },
    });
  }

  startFindDevice(): Promise<void> {
    return invokeNative({
      invoke: () => this.rt.native.startFindDevice(),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  stopFindDevice(): Promise<void> {
    return invokeNative({
      invoke: () => this.rt.native.stopFindDevice(),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  readScreenLightSettings(): Promise<ScreenLightSettings> {
    return invokeNative({
      invoke: () => this.rt.native.readScreenLightSettings(),
      normalize: normalizeScreenLightSettings,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  setScreenLightSettings(settings: ScreenLightSettings): Promise<void> {
    return invokeNative({
      validate: () => validateScreenLightSettings(settings),
      invoke: () => this.rt.native.setScreenLightSettings(settings),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  readScreenLightDuration(): Promise<ScreenLightDuration> {
    return invokeNative({
      invoke: () => this.rt.native.readScreenLightDuration(),
      normalize: normalizeScreenLightDuration,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  setScreenLightDuration(seconds: number): Promise<void> {
    return invokeNative({
      validate: () => validateScreenLightDurationSeconds(seconds),
      invoke: () => this.rt.native.setScreenLightDuration(seconds),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  readSedentaryReminder(): Promise<SedentaryReminderSettings> {
    return invokeNative({
      invoke: () => this.rt.native.readSedentaryReminder(),
      normalize: normalizeSedentaryReminderSettings,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  setSedentaryReminder(settings: SedentaryReminderSettings): Promise<void> {
    return invokeNative({
      validate: () => validateSedentaryReminderSettings(settings),
      invoke: () => this.rt.native.setSedentaryReminder(settings),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  readWristFlipWakeSettings(): Promise<WristFlipWakeSettings> {
    return invokeNative({
      invoke: () => this.rt.native.readWristFlipWakeSettings(),
      normalize: normalizeWristFlipWakeSettings,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  setWristFlipWakeSettings(settings: WristFlipWakeSettings): Promise<void> {
    return invokeNative({
      validate: () => validateWristFlipWakeSettings(settings),
      invoke: () => this.rt.native.setWristFlipWakeSettings(settings),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  readWomenHealthSettings(): Promise<WomenHealthSettings> {
    return invokeNative({
      invoke: () => this.rt.native.readWomenHealthSettings(),
      normalize: normalizeWomenHealthSettings,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  setWomenHealthSettings(settings: WomenHealthSettings): Promise<void> {
    return invokeNative({
      validate: () => validateWomenHealthSettings(settings),
      invoke: () => this.rt.native.setWomenHealthSettings(settings),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  readWeatherSettings(): Promise<WeatherSettings> {
    return invokeNative({
      invoke: () => this.rt.native.readWeatherSettings(),
      normalize: normalizeWeatherSettings,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  setWeatherSettings(settings: WeatherSettings): Promise<void> {
    return invokeNative({
      validate: () => validateWeatherSettings(settings),
      invoke: () => this.rt.native.setWeatherSettings(settings),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  pushWeatherData(data: WeatherData): Promise<void> {
    return invokeNative({
      validate: () => validateWeatherData(data),
      invoke: () => this.rt.native.pushWeatherData(data),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  /**
   * Local-file firmware DFU. Listen to `firmwareDfuProgress`. **High risk:** can brick a Band if misused.
   * Android: JL-platform Bands only (`VPOperateManager.isJLDevice`). iOS: `VPDFUOperation` local file path.
   */
  startLocalFirmwareDfu(filePath: string): Promise<void> {
    return invokeNative({
      validate: () => validateFirmwareDfuFilePath(filePath),
      invoke: () => this.rt.native.startLocalFirmwareDfu(filePath.trim()),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  readWatchFaceStyle(options?: { dialType?: WatchFaceDialType }): Promise<WatchFaceStyle> {
    return invokeNative({
      validate: () => validateReadWatchFaceStyleOptions(options),
      invoke: () =>
        this.rt.native.readWatchFaceStyle(
          options?.dialType != null ? { dialType: options.dialType } : null,
        ),
      normalize: normalizeWatchFaceStyle,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  setWatchFaceStyle(settings: WatchFaceStyleSettings): Promise<void> {
    return invokeNative({
      validate: () => validateWatchFaceStyleSettings(settings),
      invoke: () =>
        this.rt.native.setWatchFaceStyle({
          screenIndex: settings.screenIndex,
          dialType: settings.dialType ?? "default",
        }),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  async readContacts(crc?: number): Promise<DeviceContact[]> {
    return invokeNative({
      invoke: () => this.rt.native.readContacts(crc),
      normalize: normalizeContactList,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
      afterSuccess: (contacts: DeviceContact[]) => {
        this.rt.emitLocal("contactsData", {
          deviceId: this.rt.state.connectedDeviceId,
          contacts,
        });
      },
    });
  }

  addContact(contact: NewDeviceContact): Promise<void> {
    return invokeNative({
      validate: () => validateNewContact(contact),
      invoke: () => this.rt.native.addContact(contact),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  deleteContact(contactId: number): Promise<void> {
    return invokeNative({
      validate: () => validateContactId(contactId),
      invoke: () => this.rt.native.deleteContact(contactId),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  setContactSosState(contactId: number, isOpen: boolean): Promise<void> {
    return invokeNative({
      validate: () => validateContactId(contactId),
      invoke: () => this.rt.native.setContactSosState(contactId, isOpen),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  async readSosCallTimes(): Promise<SosCallTimesSettings> {
    return invokeNative({
      invoke: () => this.rt.native.readSosCallTimes(),
      normalize: normalizeSosCallTimesSettings,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
      afterSuccess: (data: SosCallTimesSettings) => {
        this.rt.emitLocal("sosCallTimesData", {
          deviceId: this.rt.state.connectedDeviceId,
          data,
        });
      },
    });
  }

  setSosCallTimes(times: number): Promise<void> {
    return invokeNative({
      validate: () => validateSosCallTimes(times),
      invoke: () => this.rt.native.setSosCallTimes(times),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }
}
