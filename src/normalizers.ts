import type {
  AutoMeasureSetting,
  BatteryInfo,
  BluetoothAuthorization,
  BluetoothState,
  BluetoothStatus,
  BloodGlucoseData,
  BloodOxygenTestResult,
  DaySummaryData,
  DeviceFunctions,
  DeviceVersion,
  FunctionStatus,
  HalfHourData,
  HeartRateTestResult,
  PasswordData,
  PermissionStatus,
  PermissionsResult,
  ReadOriginProgress,
  SleepData,
  SocialMsgData,
  SportStepData,
  StressData,
  TemperatureTestResult,
  TestState,
  OriginData,
  BloodPressureTestResult,
} from './types.js';

const bluetoothStatesByCode: BluetoothState[] = [
  'unknown',
  'resetting',
  'unsupported',
  'unauthorized',
  'poweredOff',
  'poweredOn',
];

const bluetoothAuthorizationsByCode: BluetoothAuthorization[] = [
  'notDetermined',
  'restricted',
  'denied',
  'allowedAlways',
];

const validPermissionStatuses = new Set<PermissionStatus>([
  'granted',
  'denied',
  'restricted',
  'unknown',
  'never_ask_again',
  'powered_off',
]);

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function toInt(value: unknown, fallback = 0): number {
  const number = toNumber(value);
  return number === undefined ? fallback : Math.trunc(number);
}

function toBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'open', 'support', 'supported'].includes(normalized)) return true;
    if (['false', '0', 'no', 'close', 'unsupported'].includes(normalized)) return false;
  }
  return fallback;
}

function toStringValue(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
}

function normalizeFunctionStatus(value: unknown): FunctionStatus {
  if (typeof value === 'boolean') return value ? 'support' : 'unsupported';
  if (typeof value === 'number') {
    switch (Math.trunc(value)) {
      case 0:
        return 'unsupported';
      case 1:
        return 'support';
      case 2:
        return 'open';
      case 3:
        return 'close';
      default:
        return value > 0 ? 'support' : 'unsupported';
    }
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (
      normalized.includes('support_close') ||
      normalized === 'close' ||
      normalized === 'closed'
    ) {
      return 'close';
    }
    if (
      normalized.includes('support_open') ||
      normalized === 'open' ||
      normalized === 'opened'
    ) {
      return 'open';
    }
    if (
      normalized.includes('unsupport') ||
      normalized.includes('unsupported') ||
      normalized === '0'
    ) {
      return 'unsupported';
    }
    if (
      normalized.includes('support') ||
      normalized === '1' ||
      normalized === 'true'
    ) {
      return 'support';
    }
  }
  return 'unknown';
}

function normalizeTestState(value: unknown): TestState {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized.includes('idle') || normalized === 'free') return 'idle';
    if (normalized.includes('start') || normalized.includes('open')) return 'start';
    if (
      normalized.includes('testing') ||
      normalized.includes('detect') ||
      normalized.includes('progress') ||
      normalized === 'calibration'
    ) {
      return 'testing';
    }
    if (normalized.includes('wear')) return 'notWear';
    if (normalized.includes('busy')) return 'deviceBusy';
    if (
      normalized.includes('over') ||
      normalized.includes('complete') ||
      normalized.includes('close') ||
      normalized.includes('stop')
    ) {
      return 'over';
    }
    if (
      normalized.includes('error') ||
      normalized.includes('fail') ||
      normalized.includes('unsupported') ||
      normalized.includes('invalid') ||
      normalized.includes('power')
    ) {
      return 'error';
    }
  }
  if (typeof value === 'number') {
    switch (Math.trunc(value)) {
      case 0:
        return 'start';
      case 1:
        return 'testing';
      case 2:
        return 'notWear';
      case 3:
        return 'deviceBusy';
      case 4:
        return 'over';
      default:
        return 'error';
    }
  }
  return 'error';
}

function normalizeSleepRecord(value: Record<string, unknown>): SleepData | null {
  if (Array.isArray(value.items) && isRecord(value.summary)) {
    return {
      date: toStringValue(value.date),
      items: value.items.map((item) => {
        const record = isRecord(item) ? item : {};
        return {
          date: toStringValue(record.date),
          sleepTime: toStringValue(record.sleepTime),
          wakeTime: toStringValue(record.wakeTime),
          deepSleepMinutes: toInt(record.deepSleepMinutes),
          lightSleepMinutes: toInt(record.lightSleepMinutes),
          totalSleepMinutes: toInt(record.totalSleepMinutes),
          sleepQuality: toInt(record.sleepQuality),
          sleepLine: toStringValue(record.sleepLine),
          wakeUpCount: toInt(record.wakeUpCount),
        };
      }),
      summary: {
        totalDeepSleepMinutes: toInt(value.summary.totalDeepSleepMinutes),
        totalLightSleepMinutes: toInt(value.summary.totalLightSleepMinutes),
        totalSleepMinutes: toInt(value.summary.totalSleepMinutes),
        averageSleepQuality: toInt(value.summary.averageSleepQuality),
        totalWakeUpCount: toInt(value.summary.totalWakeUpCount),
      },
    };
  }

  const sleepTime = toStringValue(value.SLEEP_TIME ?? value.sleepTime);
  const wakeTime = toStringValue(value.WAKE_TIME ?? value.wakeTime);
  if (!sleepTime && !wakeTime) return null;

  const deepSleepMinutes = Math.trunc((toNumber(value.DEEP_HOUR) ?? 0) * 60);
  const lightSleepMinutes = Math.trunc((toNumber(value.LIGHT_HOUR) ?? 0) * 60);
  const totalSleepMinutes =
    toInt(value.totalSleepMinutes, -1) >= 0
      ? toInt(value.totalSleepMinutes)
      : Math.trunc((toNumber(value.SLE_HOUR) ?? 0) * 60 + (toNumber(value.SLE_MINUTE) ?? 0));
  const sleepQuality = toInt(value.SLEEP_LEVEL ?? value.sleepQuality);
  const wakeUpCount = toInt(value.WakeUpTime ?? value.wakeUpCount);
  const date = toStringValue(value.date || (wakeTime ? wakeTime.slice(0, 10) : ''));

  return {
    date,
    items: [
      {
        date,
        sleepTime,
        wakeTime,
        deepSleepMinutes,
        lightSleepMinutes,
        totalSleepMinutes,
        sleepQuality,
        sleepLine: toStringValue(value.SLE_LINE ?? value.sleepLine),
        wakeUpCount,
      },
    ],
    summary: {
      totalDeepSleepMinutes: deepSleepMinutes,
      totalLightSleepMinutes: lightSleepMinutes,
      totalSleepMinutes,
      averageSleepQuality: sleepQuality,
      totalWakeUpCount: wakeUpCount,
    },
  };
}

function normalizeOriginItem(value: Record<string, unknown>): OriginData {
  const rawBloodGlucose = toNumber(value.bloodGlucose ?? value.glucose);
  return {
    time: toStringValue(value.time),
    heartValue: toInt(value.heartValue),
    stepValue: toInt(value.stepValue),
    calValue: toNumber(value.calValue) ?? 0,
    disValue: toNumber(value.disValue) ?? 0,
    sportValue: toInt(value.sportValue),
    systolic: toInt(value.systolic ?? value.highValue),
    diastolic: toInt(value.diastolic ?? value.lowValue),
    spo2Value: toInt(value.spo2Value),
    tempValue: toNumber(value.tempValue) ?? 0,
    stressValue: toInt(value.stressValue ?? value.stress ?? value.pressure),
    met: toNumber(value.met) ?? 0,
    oxygens: Array.isArray(value.oxygens) ? value.oxygens.map((item) => toInt(item)) : undefined,
    ppgs: Array.isArray(value.ppgs) ? value.ppgs.map((item) => toInt(item)) : undefined,
    ecgs: Array.isArray(value.ecgs) ? value.ecgs.map((item) => toInt(item)) : undefined,
    resRates: Array.isArray(value.resRates)
      ? value.resRates.map((item) => toInt(item))
      : undefined,
    sleepStates: Array.isArray(value.sleepStates)
      ? value.sleepStates.map((item) => toInt(item))
      : undefined,
    apneaResults: Array.isArray(value.apneaResults)
      ? value.apneaResults.map((item) => toInt(item))
      : undefined,
    hypoxiaTimes: Array.isArray(value.hypoxiaTimes)
      ? value.hypoxiaTimes.map((item) => toInt(item))
      : undefined,
    cardiacLoads: Array.isArray(value.cardiacLoads)
      ? value.cardiacLoads.map((item) => toInt(item))
      : undefined,
    bloodGlucose: rawBloodGlucose === undefined ? undefined : rawBloodGlucose,
  };
}

export function normalizePermissionsResult(value: unknown): PermissionsResult {
  if (typeof value === 'boolean') {
    return {
      granted: value,
      status: value ? 'granted' : 'denied',
      canAskAgain: !value,
    };
  }

  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    switch (normalized) {
      case 'granted':
        return { granted: true, status: 'granted', canAskAgain: false };
      case 'restricted':
        return { granted: false, status: 'restricted', canAskAgain: false };
      case 'never_ask_again':
        return { granted: false, status: 'never_ask_again', canAskAgain: false };
      case 'poweredoff':
      case 'powered_off':
        return { granted: false, status: 'powered_off', canAskAgain: false };
      case 'unknown':
        return { granted: false, status: 'unknown', canAskAgain: true };
      case 'denied':
      default:
        return { granted: false, status: 'denied', canAskAgain: true };
    }
  }

  if (isRecord(value)) {
    const rawGranted = value.granted;
    const rawStatus = value.status;
    const rawCanAskAgain = value.canAskAgain;

    const status =
      typeof rawStatus === 'string' && validPermissionStatuses.has(rawStatus as PermissionStatus)
        ? (rawStatus as PermissionStatus)
        : typeof rawGranted === 'boolean' && rawGranted
          ? 'granted'
          : 'denied';

    return {
      granted: typeof rawGranted === 'boolean' ? rawGranted : status === 'granted',
      status,
      canAskAgain:
        typeof rawCanAskAgain === 'boolean'
          ? rawCanAskAgain
          : status !== 'granted' &&
            status !== 'restricted' &&
            status !== 'never_ask_again' &&
            status !== 'powered_off',
    };
  }

  return { granted: false, status: 'unknown', canAskAgain: true };
}

export function normalizeBluetoothStatus(value: unknown): BluetoothStatus | unknown {
  if (!isRecord(value)) return value;

  const rawState = value.state;
  const rawAuthorization = value.authorization;

  const state =
    typeof rawState === 'number'
      ? bluetoothStatesByCode[rawState] ?? 'unknown'
      : typeof rawState === 'string'
        ? rawState
        : 'unknown';

  const authorization =
    typeof rawAuthorization === 'number'
      ? bluetoothAuthorizationsByCode[rawAuthorization] ?? 'notDetermined'
      : typeof rawAuthorization === 'string'
        ? rawAuthorization
        : 'notDetermined';

  return {
    state: state as BluetoothState,
    stateName: typeof value.stateName === 'string' ? value.stateName : state,
    authorization: authorization as BluetoothAuthorization,
    authorizationName:
      typeof value.authorizationName === 'string' ? value.authorizationName : authorization,
    isScanning: typeof value.isScanning === 'boolean' ? value.isScanning : false,
    pendingScanStart:
      typeof value.pendingScanStart === 'boolean' ? value.pendingScanStart : false,
  };
}

export function normalizeReadOriginProgressPayload(value: unknown): unknown {
  if (!isRecord(value) || !isRecord(value.progress)) return value;

  const progress = value.progress;
  const normalized: ReadOriginProgress = {
    readState:
      typeof progress.readState === 'string'
        ? (progress.readState as ReadOriginProgress['readState'])
        : 'idle',
    totalDays:
      typeof progress.totalDays === 'number' && Number.isFinite(progress.totalDays)
        ? Math.max(1, Math.trunc(progress.totalDays))
        : 1,
    currentDay:
      typeof progress.currentDay === 'number' && Number.isFinite(progress.currentDay)
        ? Math.max(1, Math.trunc(progress.currentDay))
        : 1,
    progress:
      typeof progress.progress === 'number' && Number.isFinite(progress.progress)
        ? Math.trunc(clamp(progress.progress <= 1 ? progress.progress * 100 : progress.progress, 0, 100))
        : 0,
  };

  return {
    ...value,
    progress: normalized,
  };
}

export function normalizePasswordData(value: unknown): PasswordData {
  const record = isRecord(value) ? value : {};
  const rawStatus =
    record.status ??
    record.rawStatus ??
    record.mStatus ??
    record.result ??
    'UNKNOWN';

  let status: PasswordData['status'] = 'UNKNOWN';
  if (typeof rawStatus === 'string') {
    const normalized = rawStatus.toUpperCase();
    if (normalized.includes('CHECK_SUCCESS')) status = 'CHECK_SUCCESS';
    else if (normalized.includes('CHECK_FAIL')) status = 'CHECK_FAIL';
    else if (normalized.includes('NOT_SET')) status = 'NOT_SET';
    else if (normalized.includes('SUCCESS')) status = 'SUCCESS';
    else if (normalized.includes('FAIL')) status = 'FAILED';
  }

  return {
    status,
    password: toStringValue(record.password ?? record.pwd),
    deviceNumber: toStringValue(record.deviceNumber),
    deviceVersion: toStringValue(record.deviceVersion),
    deviceTestVersion: toStringValue(record.deviceTestVersion),
    isHaveDrinkData:
      record.isHaveDrinkData === undefined ? undefined : toBoolean(record.isHaveDrinkData),
    isOpenNightTurnWrist:
      record.isOpenNightTurnWrist === undefined && record.isOpenNightTurnWriste === undefined
        ? undefined
        : normalizeFunctionStatus(
            record.isOpenNightTurnWrist ?? record.isOpenNightTurnWriste
          ),
    findPhoneFunction:
      record.findPhoneFunction === undefined
        ? undefined
        : normalizeFunctionStatus(record.findPhoneFunction),
    wearDetectFunction:
      record.wearDetectFunction === undefined
        ? undefined
        : normalizeFunctionStatus(record.wearDetectFunction),
  };
}

export function normalizeBatteryInfo(value: unknown): BatteryInfo {
  const record = isRecord(value) ? value : {};
  const state = toInt(record.state);
  const chargeState =
    state === 0 ? 'normal' : state === 1 ? 'charging' : state === 2 ? 'lowPressure' : state === 3 ? 'full' : undefined;

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
      bloodGlucoseAdjusting: normalizeFunctionStatus(
        record.bloodGlucoseAdjusting
      ),
      bloodComponent: normalizeFunctionStatus(record.bloodComponent),
      bodyComponent: normalizeFunctionStatus(record.bodyComponent),
    },
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

export function normalizeSleepDataList(value: unknown): SleepData[] {
  if (!Array.isArray(value)) {
    if (isRecord(value)) {
      const single = normalizeSleepRecord(value);
      return single ? [single] : [];
    }
    return [];
  }

  return value
    .map((item) => (isRecord(item) ? normalizeSleepRecord(item) : null))
    .filter((item): item is SleepData => item !== null);
}

export function normalizeSportStepData(value: unknown): SportStepData {
  const record = isRecord(value) ? value : {};
  return {
    date: toStringValue(record.date),
    stepCount: toInt(record.stepCount ?? record.step),
    distance: toNumber(record.distance ?? record.dis) ?? 0,
    calories: toNumber(record.calories ?? record.kcal ?? record.cal) ?? 0,
  };
}

export function normalizeOriginDataList(value: unknown): OriginData[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isRecord)
    .map((item) => normalizeOriginItem(item))
    .sort((a, b) => a.time.localeCompare(b.time));
}

export function normalizeHalfHourData(value: unknown): HalfHourData {
  const record = isRecord(value) ? value : {};
  return {
    time: toStringValue(record.time),
    heartValue: toInt(record.heartValue),
    sportValue: toInt(record.sportValue),
    stepValue: toInt(record.stepValue),
    calValue: toNumber(record.calValue) ?? 0,
    disValue: toNumber(record.disValue) ?? 0,
    diastolic: toInt(record.diastolic),
    systolic: toInt(record.systolic),
    spo2Value: toInt(record.spo2Value),
    tempValue: toNumber(record.tempValue),
    stressValue: toInt(record.stressValue),
    met: toNumber(record.met),
  };
}

export function normalizeDaySummaryData(value: unknown): DaySummaryData {
  const record = isRecord(value) ? value : {};
  return {
    date: toStringValue(record.date),
    allStep: toInt(record.allStep),
    sportList: Array.isArray(record.sportList)
      ? record.sportList
          .filter(isRecord)
          .map((item) => ({
            time: toStringValue(item.time),
            step: toInt(item.step),
            cal: toNumber(item.cal) ?? 0,
            dis: toNumber(item.dis) ?? 0,
          }))
      : [],
    rateList: Array.isArray(record.rateList)
      ? record.rateList
          .filter(isRecord)
          .map((item) => ({
            time: toStringValue(item.time),
            rate: toInt(item.rate),
          }))
      : [],
    bpList: Array.isArray(record.bpList)
      ? record.bpList
          .filter(isRecord)
          .map((item) => ({
            time: toStringValue(item.time),
            high: toInt(item.high),
            low: toInt(item.low),
          }))
      : [],
  };
}

export function normalizeAutoMeasureSettings(value: unknown): AutoMeasureSetting[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord).map((item) => ({
    protocolType: toInt(item.protocolType),
    funType: toInt(item.funType),
    isSwitchOpen: toBoolean(item.isSwitchOpen),
    stepUnit: toInt(item.stepUnit),
    isSlotModify: toBoolean(item.isSlotModify),
    isIntervalModify: toBoolean(item.isIntervalModify),
    supportStartMinute: toInt(item.supportStartMinute),
    supportEndMinute: toInt(item.supportEndMinute),
    measureInterval: toInt(item.measureInterval),
    currentStartMinute: toInt(item.currentStartMinute),
    currentEndMinute: toInt(item.currentEndMinute),
  }));
}

export function normalizeHeartRateTestResult(value: unknown): HeartRateTestResult {
  const record = isRecord(value) ? value : {};
  return {
    state: normalizeTestState(record.rawState ?? record.state),
    value: toInt(record.value),
    progress: toInt(record.progress),
  };
}

export function normalizeBloodPressureTestResult(value: unknown): BloodPressureTestResult {
  const record = isRecord(value) ? value : {};
  return {
    state: normalizeTestState(record.rawState ?? record.state),
    systolic: toInt(record.systolic ?? record.highPressure),
    diastolic: toInt(record.diastolic ?? record.lowPressure),
    pulse: toInt(record.pulse),
    progress: toInt(record.progress),
  };
}

export function normalizeBloodOxygenTestResult(value: unknown): BloodOxygenTestResult {
  const record = isRecord(value) ? value : {};
  return {
    state: normalizeTestState(record.rawState ?? record.state),
    value: toInt(record.value ?? record.oxygenValue),
    rate: toInt(record.rate ?? record.rateValue),
    progress: toInt(record.progress),
  };
}

export function normalizeTemperatureTestResult(value: unknown): TemperatureTestResult {
  const record = isRecord(value) ? value : {};
  return {
    state: normalizeTestState(record.rawState ?? record.state),
    value: toNumber(record.value ?? record.tempValue),
    originalTemp: toNumber(record.originalTemp ?? record.originalTempValue),
    progress: toInt(record.progress),
    enable: typeof record.enable === 'boolean' ? record.enable : undefined,
  };
}

export function normalizeStressData(value: unknown): StressData {
  const record = isRecord(value) ? value : {};
  return {
    stress: toInt(record.stress ?? record.value),
    timestamp: toInt(record.timestamp, Date.now()),
    progress: toInt(record.progress),
    status: toStringValue(record.status || normalizeTestState(record.rawState ?? record.state)),
    isEnd: typeof record.isEnd === 'boolean' ? record.isEnd : undefined,
  };
}

export function normalizeBloodGlucoseData(value: unknown): BloodGlucoseData {
  const record = isRecord(value) ? value : {};
  return {
    glucose: toNumber(record.glucose ?? record.bloodGlucose),
    progress: toInt(record.progress),
    level:
      record.level === undefined || typeof record.level === 'number' || typeof record.level === 'string'
        ? (record.level as string | number | undefined)
        : undefined,
    state:
      record.state === undefined
        ? normalizeTestState(record.rawState ?? record.status)
        : normalizeTestState(record.rawState ?? record.state),
    status: toStringValue(record.status),
    timestamp: toInt(record.timestamp, Date.now()),
    isEnd: typeof record.isEnd === 'boolean' ? record.isEnd : undefined,
    error: toStringValue(record.error),
  };
}
