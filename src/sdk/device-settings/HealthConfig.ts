import { invokeNative } from "../../bridge/native-invoke-pipeline.js";
import {
  normalizeAutoMeasureSettings,
  normalizeSedentaryReminderSettings,
  normalizeWomenHealthSettings,
} from "../../normalizers/index.js";
import {
  validatePersonalInfo,
  validateAutoMeasureSetting,
  validateSedentaryReminderSettings,
  validateWomenHealthSettings,
} from "../../validators/index.js";
import type {
  AutoMeasureSetting,
  PersonalInfo,
  SedentaryReminderSettings,
  WomenHealthSettings,
} from "../../types/index.js";
import type { HealthConfigInterface, SubsystemRuntime } from "../subsystem-interfaces.js";

/** Health configuration: personal info, auto-measure, sedentary reminder, women health. */
export class HealthConfig implements HealthConfigInterface {
  constructor(private readonly rt: SubsystemRuntime) {}

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
}
