import type {
  BatteryInfo,
  DeviceAlarm,
  DeviceFunctions,
  DeviceVersion,
  FindDevicePhase,
  HeartRateAlarm,
  ScreenLightDuration,
  ScreenLightSettings,
  SedentaryReminderSettings,
  SocialMsgData,
  WatchFaceDialType,
  WatchFaceStyle,
  WristFlipWakeSettings,
} from '../types/index.js';
import { isRecord, toInt, toBoolean, toStringValue, normalizeFunctionStatus } from './shared.js';

const supportedFunctionKeys = [
  'phone',
  'sms',
  'wechat',
  'qq',
  'facebook',
  'twitter',
  'instagram',
  'linkedin',
  'whatsapp',
  'line',
  'skype',
  'email',
  'other',
] as const;

export function normalizeBatteryInfo(value: unknown): BatteryInfo {
  const record = isRecord(value) ? value : {};
  const state = toInt(record.state);
  const chargeState =
    state === 0 ? 'normal'
    : state === 1 ? 'charging'
    : state === 2 ? 'lowPressure'
    : state === 3 ? 'full'
    : undefined;

  return {
    level: toInt(record.level, toInt(record.percent)),
    percent: toInt(record.percent, toInt(record.level)),
    powerModel: toInt(record.powerModel),
    state,
    bat: toInt(record.bat),
    isPercent: toBoolean(record.isPercent, true),
    isLowBattery: toBoolean(record.isLowBattery),
    chargeState,
  };
}

export function normalizeDeviceFunctions(value: unknown): DeviceFunctions {
  const record = isRecord(value) ? value : {};
  if (
    isRecord(record.package1) ||
    isRecord(record.package2) ||
    isRecord(record.package3) ||
    isRecord(record.package4) ||
    isRecord(record.package5)
  ) {
    return {
      package1: isRecord(record.package1)
        ? Object.fromEntries(
            Object.entries(record.package1)
              .filter(([key]) => key !== 'type')
              .map(([key, item]) => [key, normalizeFunctionStatus(item)])
          )
        : undefined,
      package2: isRecord(record.package2)
        ? Object.fromEntries(
            Object.entries(record.package2)
              .filter(([key]) => key !== 'type')
              .map(([key, item]) =>
                typeof item === 'number' ? [key, item] : [key, normalizeFunctionStatus(item)]
              )
          )
        : undefined,
      package3: isRecord(record.package3)
        ? Object.fromEntries(
            Object.entries(record.package3)
              .filter(([key]) => key !== 'type')
              .map(([key, item]) =>
                typeof item === 'number' ? [key, item] : [key, normalizeFunctionStatus(item)]
              )
          )
        : undefined,
      package4: isRecord(record.package4)
        ? Object.fromEntries(
            Object.entries(record.package4).map(([key, item]) => [key, normalizeFunctionStatus(item)])
          )
        : undefined,
      package5: isRecord(record.package5)
        ? Object.fromEntries(
            Object.entries(record.package5).map(([key, item]) => [key, normalizeFunctionStatus(item)])
          ) as unknown as DeviceFunctions['package5']
        : undefined,
    };
  }

  return {
    package1: {
      bloodPressure: normalizeFunctionStatus(record.Bp ?? record.bp),
      drinking: normalizeFunctionStatus(record.Drink ?? record.drink),
      sedentaryRemind: normalizeFunctionStatus(record.Longseat ?? record.longseat),
      heartRateWarning: normalizeFunctionStatus(record.HeartWaring ?? record.heartWaring),
      weChatSport: normalizeFunctionStatus(record.WeChatSport ?? record.weChatSport),
      camera: normalizeFunctionStatus(record.Camera ?? record.camera),
      fatigue: normalizeFunctionStatus(record.Fatigue ?? record.fatigue),
      spoH: normalizeFunctionStatus(record.SpoH ?? record.spoH),
      spo2HAdjustment: normalizeFunctionStatus(record.SpoHAdjuster ?? record.spoHAdjuster),
      spoHBreathBreak: normalizeFunctionStatus(record.SpoHBreathBreak ?? record.spoHBreathBreak),
      woman: normalizeFunctionStatus(record.Woman ?? record.woman),
      alarm: normalizeFunctionStatus(record.Alarm2 ?? record.alarm2),
      newCalcSport: normalizeFunctionStatus(record.newCalcSport),
      ambulatoryBPAdjustment: normalizeFunctionStatus(record.AngioAdjuster ?? record.angioAdjuster),
      screenLight: normalizeFunctionStatus(record.SreenLight ?? record.sreenLight),
      heartRateDetect: normalizeFunctionStatus(record.HeartDetect ?? record.heartDetect),
      nightTurnSetting: normalizeFunctionStatus(record.NightTurnSetting ?? record.nightTurnSetting),
      textAlarm: normalizeFunctionStatus(record.textAlarm),
      temperatureFunction: normalizeFunctionStatus(record.temperatureFunction),
    },
    package2: {
      countDown: normalizeFunctionStatus(record.CountDown ?? record.countDown),
      sportModelFunction: normalizeFunctionStatus(record.SportModel ?? record.sportModel),
      hidFunction: normalizeFunctionStatus(record.hidFuction ?? record.hidFunction),
      screenStyleFunction: normalizeFunctionStatus(record.screenStyleFunction),
      breathFunction: normalizeFunctionStatus(record.beathFunction ?? record.breathFunction),
      hrvFunction: normalizeFunctionStatus(record.hrvFunction),
      weatherFunction: normalizeFunctionStatus(record.weatherFunction),
      screenLightTime: normalizeFunctionStatus(record.screenLightTime),
      precisionSleep: normalizeFunctionStatus(record.precisionSleep),
      ecgFunction: normalizeFunctionStatus(record.ecg),
      multSportMode: normalizeFunctionStatus(record.multSportModel),
      lowPower: normalizeFunctionStatus(record.lowPower),
      sleepTag: toInt(record.sleepTag),
      watchDataDayNumber: toInt(record.WathcDay ?? record.wathcDay),
      contactMsgLength: toInt(record.contactMsgLength),
      allMsgLength: toInt(record.allMsgLength),
      sportModelDay: toInt(record.sportmodelday),
      screenstyle: toInt(record.screenstyle),
      weatherStyle: toInt(record.weatherStyle),
      originProtocolVersion: toInt(record.originProtcolVersion),
      ecgType: toInt(record.ecgType),
    },
    package3: {
      bigDataTranType: toInt(record.bitDataTranType ?? record.bigDataTranType),
      watchUiServerCount: toInt(record.watchUiServerCount),
      watchUiCustomCount: toInt(record.watchUiCoustomCount ?? record.watchUiCustomCount),
      temperatureFunction: normalizeFunctionStatus(record.temperatureFunction),
      temperatureType: toInt(record.temptureType ?? record.temperatureType),
      cpuType: toInt(record.cpuType),
      stressFunction: normalizeFunctionStatus(record.stress),
      musicStyle: toInt(record.musicStyle),
      findDeviceByPhoneFunction: normalizeFunctionStatus(
        record.findDeviceByPhone ?? record.findDeviceByPhoneFunction
      ),
      agpsFunction: normalizeFunctionStatus(record.agps),
      bloodGlucose: toInt(record.bloodGlucoseType ?? record.bloodGlucose),
      bloodGlucoseAdjusting: normalizeFunctionStatus(record.bloodGlucoseAdjusting),
      bloodComponent: normalizeFunctionStatus(record.bloodComponent),
      bodyComponent: normalizeFunctionStatus(record.bodyComponent),
    },
  };
}

function repeatStringToWeekdays(repeatStr: string): number[] {
  const days: number[] = [];
  for (let i = 0; i < 7; i++) {
    if (repeatStr[i] === '1') days.push(7 - i);
  }
  return days.sort((a, b) => a - b);
}

export function normalizeAlarmList(value: unknown): DeviceAlarm[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => isRecord(item))
    .map((item) => {
      const repeatRaw = typeof item.repeat === 'string' ? item.repeat : '0000000';
      const repeat = Array.isArray(item.repeat)
        ? (item.repeat as number[])
        : repeatStringToWeekdays(repeatRaw);
      const alarm: DeviceAlarm = {
        id: toInt(item.id, 0),
        enabled: toBoolean(item.enabled, false),
        hour: toInt(item.hour, 0),
        minute: toInt(item.minute, 0),
        repeat,
      };
      if (item.scene !== undefined && item.scene !== null) {
        alarm.scene = toInt(item.scene);
      }
      if (typeof item.text === 'string' && item.text.length > 0) {
        alarm.text = item.text;
      }
      if (item.type === 'normal' || item.type === 'text') {
        alarm.type = item.type;
      }
      return alarm;
    });
}

export function normalizeHeartRateAlarm(value: unknown): HeartRateAlarm {
  const record = isRecord(value) ? value : {};
  return {
    enabled: toBoolean(record.enabled, false),
    highThreshold: toInt(record.highThreshold),
    lowThreshold: toInt(record.lowThreshold),
  };
}

const FIND_DEVICE_PHASES: readonly FindDevicePhase[] = [
  'unsupported',
  'searching',
  'found',
  'timeout',
  'stopped',
];

export function normalizeScreenLightSettings(value: unknown): ScreenLightSettings {
  const record = isRecord(value) ? value : {};
  const base: ScreenLightSettings = {
    nightStartHour: toInt(record.nightStartHour),
    nightStartMinute: toInt(record.nightStartMinute),
    nightEndHour: toInt(record.nightEndHour),
    nightEndMinute: toInt(record.nightEndMinute),
    nightLevel: toInt(record.nightLevel),
    dayLevel: toInt(record.dayLevel),
    autoAdjust: toBoolean(record.autoAdjust, false),
    maxLevel: toInt(record.maxLevel, 5),
  };
  if (record.lastManualDayLevel !== undefined && record.lastManualDayLevel !== null) {
    base.lastManualDayLevel = toInt(record.lastManualDayLevel);
  }
  return base;
}

export function normalizeScreenLightDuration(value: unknown): ScreenLightDuration {
  const record = isRecord(value) ? value : {};
  const out: ScreenLightDuration = {
    currentSeconds: toInt(record.currentSeconds),
    minSeconds: toInt(record.minSeconds),
    maxSeconds: toInt(record.maxSeconds),
  };
  if (record.recommendSeconds !== undefined && record.recommendSeconds !== null) {
    out.recommendSeconds = toInt(record.recommendSeconds);
  }
  return out;
}

export function normalizeSedentaryReminderSettings(
  value: unknown,
): SedentaryReminderSettings {
  const record = isRecord(value) ? value : {};
  return {
    startHour: toInt(record.startHour),
    startMinute: toInt(record.startMinute),
    endHour: toInt(record.endHour),
    endMinute: toInt(record.endMinute),
    thresholdMinutes: toInt(record.thresholdMinutes, 60),
    enabled: toBoolean(record.enabled, false),
  };
}

export function normalizeWristFlipWakeSettings(value: unknown): WristFlipWakeSettings {
  const record = isRecord(value) ? value : {};
  const base: WristFlipWakeSettings = {
    enabled: toBoolean(record.enabled, false),
    startHour: toInt(record.startHour),
    startMinute: toInt(record.startMinute),
    endHour: toInt(record.endHour),
    endMinute: toInt(record.endMinute),
    sensitivityLevel: toInt(record.sensitivityLevel, 5),
  };
  if (record.supportsCustomTimeWindow !== undefined && record.supportsCustomTimeWindow !== null) {
    base.supportsCustomTimeWindow = toBoolean(record.supportsCustomTimeWindow, false);
  }
  if (record.defaultSensitivityLevel !== undefined && record.defaultSensitivityLevel !== null) {
    base.defaultSensitivityLevel = toInt(record.defaultSensitivityLevel);
  }
  return base;
}

export function normalizeFindDeviceStatePayload(value: unknown): {
  deviceId: string;
  phase: FindDevicePhase;
  rawState?: number;
} {
  const record = isRecord(value) ? value : {};
  const phaseRaw = toStringValue(record.phase);
  const phase: FindDevicePhase = (FIND_DEVICE_PHASES as readonly string[]).includes(
    phaseRaw
  )
    ? (phaseRaw as FindDevicePhase)
    : 'unsupported';
  const raw = record.rawState;
  const rawState =
    typeof raw === 'number' && Number.isFinite(raw) ? Math.trunc(raw) : undefined;
  return {
    deviceId: toStringValue(record.deviceId),
    phase,
    rawState,
  };
}

export function normalizeWatchFaceStyle(value: unknown): WatchFaceStyle {
  const record = isRecord(value) ? value : {};
  const raw = String(toStringValue(record.dialType, 'default')).toLowerCase();
  const dialType: WatchFaceDialType =
    raw === 'market' || raw === 'photo' ? raw : 'default';
  const op = record.operationSuccess;
  return {
    dialType,
    screenIndex: toInt(record.screenIndex),
    ...(typeof op === 'boolean' ? { operationSuccess: op } : {}),
  };
}

export function normalizeSocialMsgData(value: unknown): SocialMsgData {
  const record = isRecord(value) ? value : {};
  return Object.fromEntries(
    supportedFunctionKeys.map((key) => [key, normalizeFunctionStatus(record[key])])
  ) as unknown as SocialMsgData;
}

export function normalizeDeviceVersion(value: unknown): DeviceVersion {
  const record = isRecord(value) ? value : {};
  return {
    hardwareVersion: toStringValue(record.hardwareVersion),
    firmwareVersion: toStringValue(record.firmwareVersion),
    softwareVersion: toStringValue(record.softwareVersion),
    deviceNumber: toStringValue(record.deviceNumber),
    newVersion: toStringValue(record.newVersion),
    description: toStringValue(record.description),
  };
}
