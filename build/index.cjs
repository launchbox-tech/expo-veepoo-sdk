Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
//#endregion
let expo_modules_core = require("expo-modules-core");
let react_native = require("react-native");
let react = require("react");
react = __toESM(react);
let react_jsx_runtime = require("react/jsx-runtime");
//#region src/native-veepoo-sdk.ts
const LINKING_ERROR = "The package 'expo-veepoo-sdk' doesn't seem to be linked. Make sure:\n\n- You rebuilt the app after installing the package\n- You are not using Expo Go (this module requires a development build)\n";
let NativeModule;
try {
	NativeModule = (0, expo_modules_core.requireNativeModule)("VeepooSDK");
} catch {
	NativeModule = new Proxy({}, { get() {
		throw new Error(LINKING_ERROR);
	} });
}
//#endregion
//#region src/shared/deep-keys.ts
function toSnakeCase(key) {
	return key.replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2").replace(/([a-z\d])([A-Z])/g, "$1_$2").toLowerCase();
}
function toCamelCase(key) {
	return key.replace(/_([a-z\d])/g, (_, c) => c.toUpperCase());
}
function deepSnakeKeys(value) {
	if (Array.isArray(value)) return value.map(deepSnakeKeys);
	if (value !== null && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [toSnakeCase(k), deepSnakeKeys(v)]));
	return value;
}
function deepCamelKeys(value) {
	if (Array.isArray(value)) return value.map(deepCamelKeys);
	if (value !== null && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [toCamelCase(k), deepCamelKeys(v)]));
	return value;
}
//#endregion
//#region src/shared/primitives.ts
function isRecord(value) {
	return typeof value === "object" && value !== null;
}
function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max);
}
function toNumber(value) {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string") {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) return parsed;
	}
}
function toInt(value, fallback = 0) {
	const number = toNumber(value);
	return number === void 0 ? fallback : Math.trunc(number);
}
function toBoolean(value, fallback = false) {
	if (typeof value === "boolean") return value;
	if (typeof value === "number") return value !== 0;
	if (typeof value === "string") {
		const normalized = value.trim().toLowerCase();
		if ([
			"true",
			"1",
			"yes",
			"open",
			"support",
			"supported"
		].includes(normalized)) return true;
		if ([
			"false",
			"0",
			"no",
			"close",
			"unsupported"
		].includes(normalized)) return false;
	}
	return fallback;
}
function toStringValue(value, fallback = "") {
	if (typeof value === "string") return value;
	if (typeof value === "number" || typeof value === "boolean") return String(value);
	return fallback;
}
function normalizeFunctionStatus(value) {
	if (typeof value === "boolean") return value ? "support" : "unsupported";
	if (typeof value === "number") switch (Math.trunc(value)) {
		case 0: return "unsupported";
		case 1: return "support";
		case 2: return "open";
		case 3: return "close";
		default: return value > 0 ? "support" : "unsupported";
	}
	if (typeof value === "string") {
		const normalized = value.trim().toLowerCase();
		if (normalized.includes("support_close") || normalized === "close" || normalized === "closed") return "close";
		if (normalized.includes("support_open") || normalized === "open" || normalized === "opened") return "open";
		if (normalized.includes("unsupport") || normalized.includes("unsupported") || normalized === "0") return "unsupported";
		if (normalized.includes("support") || normalized === "1" || normalized === "true") return "support";
	}
	return "unknown";
}
function normalizeTestState(value) {
	if (typeof value === "string") {
		const normalized = value.trim().toLowerCase();
		if (normalized.includes("idle") || normalized === "free") return "idle";
		if (normalized.includes("start") || normalized.includes("open")) return "start";
		if (normalized.includes("testing") || normalized.includes("detect") || normalized.includes("progress") || normalized === "calibration") return "testing";
		if (normalized.includes("wear")) return "not_wear";
		if (normalized.includes("busy")) return "device_busy";
		if (normalized.includes("over") || normalized.includes("complete") || normalized.includes("close") || normalized.includes("stop")) return "over";
		if (normalized.includes("error") || normalized.includes("fail") || normalized.includes("unsupported") || normalized.includes("invalid") || normalized.includes("power")) return "error";
	}
	if (typeof value === "number") switch (Math.trunc(value)) {
		case 0: return "start";
		case 1: return "testing";
		case 2: return "not_wear";
		case 3: return "device_busy";
		case 4: return "over";
		default: return "error";
	}
	return "error";
}
//#endregion
//#region src/bridge/event-envelope.ts
/** Identity normalizer for events whose envelope needs no value-level rewriting. */
const passthrough = () => (raw) => raw;
/**
* Spread the envelope, replace one inner-payload field with its normalized
* shape. `fallbackKey` lets a few events tolerate native sending the inner
* payload under either of two camelCase keys.
*/
function wrapInner(field, normalize, options) {
	return (raw) => {
		const p = isRecord(raw) ? raw : {};
		const primary = p[field];
		const value = options?.fallbackKey !== void 0 && primary === void 0 ? p[options.fallbackKey] : primary;
		return {
			...p,
			[field]: normalize(value)
		};
	};
}
//#endregion
//#region src/capabilities/alarms/normalizers.ts
function repeatStringToWeekdays(repeatStr) {
	const days = [];
	for (let i = 0; i < 7; i++) if (repeatStr[i] === "1") days.push(7 - i);
	return days.sort((a, b) => a - b);
}
function normalizeAlarmItem(item) {
	const repeatRaw = typeof item.repeat === "string" ? item.repeat : "0000000";
	const repeat = Array.isArray(item.repeat) ? item.repeat : repeatStringToWeekdays(repeatRaw);
	const alarm = {
		id: toInt(item.id, 0),
		enabled: toBoolean(item.enabled, false),
		hour: toInt(item.hour, 0),
		minute: toInt(item.minute, 0),
		repeat
	};
	if (item.scene !== void 0 && item.scene !== null) alarm.scene = toInt(item.scene);
	if (typeof item.text === "string" && item.text.length > 0) alarm.text = item.text;
	if (item.type === "normal" || item.type === "text") alarm.type = item.type;
	return alarm;
}
function normalizeAlarmList(value) {
	if (!Array.isArray(value)) return [];
	const alarms = [];
	for (const item of value) if (isRecord(item)) alarms.push(normalizeAlarmItem(item));
	return alarms;
}
function normalizeHeartRateAlarm(value) {
	const record = isRecord(value) ? value : {};
	return {
		enabled: toBoolean(record.enabled, false),
		high_threshold: toInt(record.highThreshold ?? record.high_threshold),
		low_threshold: toInt(record.lowThreshold ?? record.low_threshold)
	};
}
function normalizeSpo2Alarm(value) {
	const record = isRecord(value) ? value : {};
	return {
		enabled: toBoolean(record.enabled, false),
		low_threshold: toInt(record.lowThreshold ?? record.low_threshold)
	};
}
//#endregion
//#region src/capabilities/battery.ts
function normalizeBatteryInfo(value) {
	const record = isRecord(value) ? value : {};
	const state = toInt(record.state);
	const charge_state = state === 0 ? "normal" : state === 1 ? "charging" : state === 2 ? "low_pressure" : state === 3 ? "full" : void 0;
	return {
		level: toInt(record.level, toInt(record.percent)),
		percent: toInt(record.percent, toInt(record.level)),
		power_model: toInt(record.powerModel ?? record.power_model),
		state,
		bat: toInt(record.bat),
		is_percent: toBoolean(record.isPercent ?? record.is_percent, true),
		is_low_battery: toBoolean(record.isLowBattery ?? record.is_low_battery),
		charge_state
	};
}
var BatteryCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	readBattery() {
		this.ctx.log("debug", "device", "battery.read.start", "Reading battery info", {});
		return this.ctx.invoke({
			invoke: () => this.ctx.native.readBattery(),
			normalize: normalizeBatteryInfo,
			afterSuccess: (result) => {
				this.ctx.log("debug", "device", "battery.read.result", "Battery info received", { data: result });
			}
		});
	}
};
//#endregion
//#region src/capabilities/bt-status.ts
const BT_STATE_MAP = {
	0: "disconnected",
	1: "connected",
	2: "pairing"
};
function normalizeDeviceBTState(value) {
	if (typeof value === "number") return BT_STATE_MAP[value] ?? "disconnected";
	if (typeof value === "string") {
		if (value === "connected") return "connected";
		if (value === "pairing") return "pairing";
	}
	return "disconnected";
}
function normalizeDeviceBTStatus(value) {
	if (!isRecord(value)) return {
		is_bt_open: false,
		is_auto_connect: false,
		is_audio_open: false,
		has_pair_info: false,
		state: "disconnected"
	};
	return {
		is_bt_open: toBoolean(value.isBTOpen ?? value.is_bt_open),
		is_auto_connect: toBoolean(value.isAutoCon ?? value.isAutoConnect ?? value.is_auto_connect),
		is_audio_open: toBoolean(value.isAudioOpen ?? value.is_audio_open),
		has_pair_info: toBoolean(value.isHavePairInfo ?? value.hasPairInfo ?? value.has_pair_info),
		state: normalizeDeviceBTState(value.status ?? value.state)
	};
}
var BtStatusCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	readDeviceBTStatus() {
		return this.ctx.invoke({
			invoke: () => this.ctx.native.readDeviceBTStatus(),
			normalize: normalizeDeviceBTStatus
		});
	}
	setDeviceBTSwitch(open) {
		return this.ctx.invoke({ invoke: () => this.ctx.native.setDeviceBTSwitch(open) });
	}
};
//#endregion
//#region src/capabilities/camera.ts
/**
* Normalizes camera shutter status from native.
* Android: ECameraStatus string (TAKEPHOTO_CAN / TAKEPHOTO_CAN_NOT or already mapped).
* iOS: 'canTake' / 'cannotTake' passed directly.
*/
function normalizeCameraShutterStatus(value) {
	const s = typeof value === "string" ? value : "";
	if (s === "canTake" || s === "TAKEPHOTO_CAN") return "canTake";
	return "cannotTake";
}
var CameraCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	enterCameraMode() {
		return this.ctx.invoke({ invoke: () => this.ctx.native.enterCameraMode() });
	}
	exitCameraMode() {
		return this.ctx.invoke({ invoke: () => this.ctx.native.exitCameraMode() });
	}
};
//#endregion
//#region src/capabilities/contacts/normalizers.ts
function normalizeContact(raw) {
	if (!isRecord(raw)) return null;
	const name = toStringValue(raw.name ?? raw.nickName);
	const phone_number = toStringValue(raw.phoneNumber ?? raw.phone_number);
	if (!name && !phone_number) return null;
	return {
		contact_id: toInt(raw.contactID ?? raw.contactId ?? raw.contact_id ?? raw.id),
		name,
		phone_number,
		is_sos: toBoolean(raw.isSOS ?? raw.is_sos ?? raw.isSettingSOS),
		is_support_sos: raw.isSupportSOS !== void 0 || raw.is_support_sos !== void 0 ? toBoolean(raw.isSupportSOS ?? raw.is_support_sos) : void 0
	};
}
function normalizeContactList(value) {
	if (!Array.isArray(value)) return [];
	return value.flatMap((item) => {
		const c = normalizeContact(item);
		return c !== null ? [c] : [];
	});
}
//#endregion
//#region src/capabilities/device-functions/normalizers/package1.ts
function normalizePackage1(record) {
	if (isRecord(record.package1)) return Object.fromEntries(Object.entries(record.package1).flatMap(([key, item]) => key === "type" ? [] : [[key, normalizeFunctionStatus(item)]]));
	return {
		blood_pressure: normalizeFunctionStatus(record.Bp ?? record.bp),
		drinking: normalizeFunctionStatus(record.Drink ?? record.drink),
		sedentary_remind: normalizeFunctionStatus(record.Longseat ?? record.longseat),
		heart_rate_warning: normalizeFunctionStatus(record.HeartWaring ?? record.heartWaring),
		we_chat_sport: normalizeFunctionStatus(record.WeChatSport ?? record.weChatSport),
		camera: normalizeFunctionStatus(record.Camera ?? record.camera),
		fatigue: normalizeFunctionStatus(record.Fatigue ?? record.fatigue),
		spo_h: normalizeFunctionStatus(record.SpoH ?? record.spoH),
		spo2_h_adjustment: normalizeFunctionStatus(record.SpoHAdjuster ?? record.spoHAdjuster),
		spo_h_breath_break: normalizeFunctionStatus(record.SpoHBreathBreak ?? record.spoHBreathBreak),
		woman: normalizeFunctionStatus(record.Woman ?? record.woman),
		alarm: normalizeFunctionStatus(record.Alarm2 ?? record.alarm2),
		new_calc_sport: normalizeFunctionStatus(record.newCalcSport),
		ambulatory_bp_adjustment: normalizeFunctionStatus(record.AngioAdjuster ?? record.angioAdjuster),
		screen_light: normalizeFunctionStatus(record.SreenLight ?? record.sreenLight),
		heart_rate_detect: normalizeFunctionStatus(record.HeartDetect ?? record.heartDetect),
		night_turn_setting: normalizeFunctionStatus(record.NightTurnSetting ?? record.nightTurnSetting),
		text_alarm: normalizeFunctionStatus(record.textAlarm),
		temperature_function: normalizeFunctionStatus(record.temperatureFunction)
	};
}
//#endregion
//#region src/capabilities/device-functions/normalizers/package2.ts
function normalizePackage2(record) {
	if (isRecord(record.package2)) return Object.fromEntries(Object.entries(record.package2).flatMap(([key, item]) => key === "type" ? [] : [[key, typeof item === "number" ? item : normalizeFunctionStatus(item)]]));
	return {
		count_down: normalizeFunctionStatus(record.CountDown ?? record.countDown),
		sport_model_function: normalizeFunctionStatus(record.SportModel ?? record.sportModel),
		hid_function: normalizeFunctionStatus(record.hidFuction ?? record.hidFunction),
		screen_style_function: normalizeFunctionStatus(record.screenStyleFunction),
		breath_function: normalizeFunctionStatus(record.beathFunction ?? record.breathFunction),
		hrv_function: normalizeFunctionStatus(record.hrvFunction),
		weather_function: normalizeFunctionStatus(record.weatherFunction),
		screen_light_time: normalizeFunctionStatus(record.screenLightTime),
		precision_sleep: normalizeFunctionStatus(record.precisionSleep),
		ecg_function: normalizeFunctionStatus(record.ecg),
		mult_sport_mode: normalizeFunctionStatus(record.multSportModel),
		low_power: normalizeFunctionStatus(record.lowPower),
		sleep_tag: toInt(record.sleepTag),
		watch_data_day_number: toInt(record.WathcDay ?? record.wathcDay),
		contact_msg_length: toInt(record.contactMsgLength),
		all_msg_length: toInt(record.allMsgLength),
		sport_model_day: toInt(record.sportmodelday),
		screenstyle: toInt(record.screenstyle),
		weather_style: toInt(record.weatherStyle),
		origin_protocol_version: toInt(record.originProtcolVersion),
		ecg_type: toInt(record.ecgType)
	};
}
//#endregion
//#region src/capabilities/device-functions/normalizers/package3.ts
function normalizePackage3(record) {
	if (isRecord(record.package3)) return Object.fromEntries(Object.entries(record.package3).flatMap(([key, item]) => key === "type" ? [] : [[key, typeof item === "number" ? item : normalizeFunctionStatus(item)]]));
	return {
		big_data_tran_type: toInt(record.bitDataTranType ?? record.bigDataTranType),
		watch_ui_server_count: toInt(record.watchUiServerCount),
		watch_ui_custom_count: toInt(record.watchUiCoustomCount ?? record.watchUiCustomCount),
		temperature_function: normalizeFunctionStatus(record.temperatureFunction),
		temperature_type: toInt(record.temptureType ?? record.temperatureType),
		cpu_type: toInt(record.cpuType),
		stress_function: normalizeFunctionStatus(record.stress),
		music_style: toInt(record.musicStyle),
		find_device_by_phone_function: normalizeFunctionStatus(record.findDeviceByPhone ?? record.findDeviceByPhoneFunction),
		agps_function: normalizeFunctionStatus(record.agps),
		blood_glucose: toInt(record.bloodGlucoseType ?? record.bloodGlucose),
		blood_glucose_adjusting: normalizeFunctionStatus(record.bloodGlucoseAdjusting),
		blood_component: normalizeFunctionStatus(record.bloodComponent),
		body_component: normalizeFunctionStatus(record.bodyComponent)
	};
}
//#endregion
//#region src/capabilities/device-functions/normalizers/package4-5.ts
function normalizePackage4(record) {
	if (!isRecord(record.package4)) return void 0;
	return Object.fromEntries(Object.entries(record.package4).map(([key, item]) => [key, normalizeFunctionStatus(item)]));
}
function normalizePackage5(record) {
	if (!isRecord(record.package5)) return void 0;
	return Object.fromEntries(Object.entries(record.package5).map(([key, item]) => [key, normalizeFunctionStatus(item)]));
}
//#endregion
//#region src/capabilities/device-functions/normalizers/index.ts
function normalizeDeviceFunctions(value) {
	const record = isRecord(value) ? value : {};
	if (isRecord(record.package1) || isRecord(record.package2) || isRecord(record.package3) || isRecord(record.package4) || isRecord(record.package5)) return {
		package1: normalizePackage1(record),
		package2: normalizePackage2(record),
		package3: normalizePackage3(record),
		package4: normalizePackage4(record),
		package5: normalizePackage5(record)
	};
	return {
		package1: normalizePackage1(record),
		package2: normalizePackage2(record),
		package3: normalizePackage3(record)
	};
}
//#endregion
//#region src/capabilities/device-version.ts
function normalizeDeviceVersion(value) {
	const record = isRecord(value) ? value : {};
	return {
		hardware_version: toStringValue(record.hardwareVersion ?? record.hardware_version),
		firmware_version: toStringValue(record.firmwareVersion ?? record.firmware_version),
		software_version: toStringValue(record.softwareVersion ?? record.software_version),
		device_number: toStringValue(record.deviceNumber ?? record.device_number),
		new_version: toStringValue(record.newVersion ?? record.new_version),
		description: toStringValue(record.description)
	};
}
var DeviceVersionCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	readDeviceVersion() {
		return this.ctx.invoke({
			invoke: () => this.ctx.native.readDeviceVersion(),
			normalize: normalizeDeviceVersion,
			afterSuccess: (result) => {
				this.ctx.log("debug", "device", "device.version.read", "Device version received", { data: result });
			}
		});
	}
};
//#endregion
//#region src/capabilities/dfu.ts
const FIRMWARE_DFU_STATES = [
	"file_not_exist",
	"start",
	"updating",
	"success",
	"failure",
	"prepared",
	"reboot",
	"reconnecting",
	"dfu_lang_connect_success",
	"dfu_lang_connect_failed",
	"unknown"
];
const FIRMWARE_DFU_STATE_VALUE_MAP = {
	fileNotExist: "file_not_exist",
	dfuLangConnectSuccess: "dfu_lang_connect_success",
	dfuLangConnectFailed: "dfu_lang_connect_failed"
};
function normalizeFirmwareDfuProgress(value) {
	const p = isRecord(value) ? value : {};
	const stateRaw = toStringValue(p.state, "unknown");
	const stateMapped = FIRMWARE_DFU_STATE_VALUE_MAP[stateRaw] ?? stateRaw;
	const state = FIRMWARE_DFU_STATES.includes(stateMapped) ? stateMapped : "unknown";
	let message;
	if (p.message !== void 0 && p.message !== null) message = String(p.message);
	const out = {
		device_id: toStringValue(p.deviceId ?? p.device_id) ?? "",
		progress: clamp(toInt(p.progress) ?? 0, 0, 100),
		state
	};
	if (message !== void 0) out.message = message;
	return out;
}
function validateFirmwareDfuFilePath(filePath) {
	if (typeof filePath !== "string" || filePath.trim().length === 0) throw {
		code: "INVALID_ARGUMENT",
		message: "filePath is required"
	};
	if (filePath.length > 4096) throw {
		code: "INVALID_ARGUMENT",
		message: "filePath is too long"
	};
}
var DfuCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	/**
	* Local-file firmware DFU. Listen to `firmwareDfuProgress`. **High risk:** can brick a Band if misused.
	* Android: JL-platform Bands only (`VPOperateManager.isJLDevice`). iOS: `VPDFUOperation` local file path.
	*/
	startLocalFirmwareDfu(filePath) {
		return this.ctx.invoke({
			validate: () => validateFirmwareDfuFilePath(filePath),
			invoke: () => this.ctx.native.startLocalFirmwareDfu(filePath.trim())
		});
	}
};
//#endregion
//#region src/capabilities/find-device.ts
const FIND_DEVICE_PHASES = [
	"unsupported",
	"searching",
	"found",
	"timeout",
	"stopped"
];
function normalizeFindDeviceStatePayload(value) {
	const record = isRecord(value) ? value : {};
	const phaseRaw = toStringValue(record.phase);
	const phase = FIND_DEVICE_PHASES.includes(phaseRaw) ? phaseRaw : "unsupported";
	const raw = record.rawState ?? record.raw_state;
	const raw_state = typeof raw === "number" && Number.isFinite(raw) ? Math.trunc(raw) : void 0;
	return {
		device_id: toStringValue(record.deviceId ?? record.device_id),
		phase,
		raw_state
	};
}
var FindDeviceCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	startFindDevice() {
		return this.ctx.invoke({ invoke: () => this.ctx.native.startFindDevice() });
	}
	stopFindDevice() {
		return this.ctx.invoke({ invoke: () => this.ctx.native.stopFindDevice() });
	}
};
//#endregion
//#region src/capabilities/sport-mode/types.ts
/** Ordinal→SportMode mapping (indices 1–127; index 0 = 'common' meaning no sport active). */
const SPORT_MODE_ORDINALS = [
	"common",
	"outdoor_run",
	"outdoor_walk",
	"indoor_run",
	"indoor_walk",
	"hiking",
	"stair_stepper",
	"outdoor_cycle",
	"stationary_bike",
	"elliptical",
	"rowing_machine",
	"mountaineering",
	"swimming",
	"sit_ups",
	"skiing",
	"jump_rope",
	"yoga",
	"table_tennis",
	"basketball",
	"volleyball",
	"football",
	"badminton",
	"tennis",
	"climb_stairs",
	"fitness",
	"weightlifting",
	"diving",
	"boxing",
	"gym_ball",
	"squat_training",
	"triathlon",
	"dance",
	"hiit",
	"rock_climbing",
	"sports",
	"balls",
	"fitness_game",
	"free_time",
	"aerobics",
	"gymnastics",
	"floor_exercise",
	"horizontal_bar",
	"parallel_bars",
	"trampoline",
	"track_and_field",
	"marathon",
	"push_ups",
	"dumbbell",
	"rugby",
	"handball",
	"baseball_softball",
	"baseball",
	"hockey",
	"golf",
	"bowling",
	"billiards",
	"rowing",
	"sailboat",
	"skating",
	"curling",
	"ice_puck",
	"sled",
	"strong_walk",
	"treadmill",
	"trail_running",
	"race_walking",
	"mountain_biking",
	"bmx",
	"orienteering",
	"fishing",
	"hunting",
	"skateboard",
	"roller_skating",
	"parkour",
	"atv",
	"motocross",
	"climbing_machine",
	"spinning_bike",
	"indoor_fitness",
	"mixed_aerobic",
	"cross_training",
	"bodybuilding_exercise",
	"group_gymnastics",
	"kickboxing",
	"strength_training",
	"stepping_training",
	"core_training",
	"flexibility_training",
	"free_training",
	"pilates",
	"battle_rope",
	"square_dance",
	"ballroom_dancing",
	"belly_dance",
	"ballet",
	"hip_hop",
	"zumba",
	"latin_dance",
	"jazz",
	"hip_hop_dance",
	"pole_dancing",
	"break_dance",
	"national_dance",
	"modern_dance",
	"disco",
	"tap_dance",
	"wrestling",
	"martial_arts",
	"tai_chi",
	"muay_thai",
	"judo",
	"taekwondo",
	"karate",
	"free_sparring",
	"swordsmanship",
	"jujitsu",
	"fencing",
	"beach_soccer",
	"beach_volleyball",
	"softball",
	"squash",
	"croquet",
	"cricket",
	"polo",
	"wallball",
	"takraw_ball",
	"dodgeball",
	"water_polo"
];
//#endregion
//#region src/capabilities/shared/collect-stream.ts
/**
* Stream-read collector (ADR 0015): one vendor command, N data events, a
* dedicated completion event. Subscribes BEFORE firing the command (events
* may start before the command promise settles), collects every data event,
* resolves on completion, and guards with a stall watchdog — a command the
* Band silently drops never completes, so `stallMs` of event silence rejects
* with `TIMEOUT` instead of hanging the caller forever. Progress events
* (when the read has them) re-arm the watchdog — a slow transfer streaming
* progress is alive, not stalled. All listeners are removed on every exit
* path.
*/
function collectStream(ctx, opts) {
	const { start, dataEvent, pick, onItem, completeEvent, isFailure, onComplete: onCompletePayload, progress, stallMs } = opts;
	return new Promise((resolve, reject) => {
		const items = [];
		let stall = null;
		let settled = false;
		const settle = (outcome) => {
			if (settled) return;
			settled = true;
			if (stall) clearTimeout(stall);
			ctx.off(dataEvent, onData);
			ctx.off(completeEvent, onComplete);
			if (progress) ctx.off(progress.event, onProgress);
			outcome();
		};
		const armStall = () => {
			if (settled) return;
			if (stall) clearTimeout(stall);
			stall = setTimeout(() => settle(() => reject({
				code: "TIMEOUT",
				message: `${dataEvent} stream stalled (${stallMs}ms of silence)`
			})), stallMs);
		};
		const onData = (payload) => {
			armStall();
			const item = pick(payload);
			items.push(item);
			onItem?.(item);
		};
		const onProgress = (payload) => {
			armStall();
			progress?.onProgress?.(payload);
		};
		const onComplete = (payload) => {
			onCompletePayload?.(payload);
			const failure = isFailure?.(payload) ?? null;
			settle(() => failure === null ? resolve(items) : reject({
				code: "OPERATION_FAILED",
				message: failure
			}));
		};
		ctx.on(dataEvent, onData);
		ctx.on(completeEvent, onComplete);
		if (progress) ctx.on(progress.event, onProgress);
		armStall();
		start().catch((err) => settle(() => reject(err)));
	});
}
//#endregion
//#region src/capabilities/historical-query.ts
const SPORT_MODE_SET = new Set(SPORT_MODE_ORDINALS);
/**
* Native exercise payloads carry the sport name in the native tables'
* camelCase ("outdoorRun"); the JS surface is snake_case `SportMode`
* (ADR 0004/0013). `deepSnakeKeys` rewrites keys, never values — so the
* `type` VALUE is converted here, validated against the canonical ordinal
* list, and nulled when unknown (matching the declared `SportMode | null`).
*/
function normalizeExerciseSessionInner(raw) {
	if (!isRecord(raw)) return raw;
	const type = typeof raw.type === "string" ? raw.type.replace(/([A-Z])/g, "_$1").toLowerCase() : null;
	return {
		...raw,
		type: type !== null && SPORT_MODE_SET.has(type) ? type : null
	};
}
var HistoricalQueryCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	readDeviceAllData() {
		return this.ctx.invoke({ invoke: () => this.ctx.native.readDeviceAllData() });
	}
	startReadOriginData() {
		this.ctx.log("info", "read", "read.origin.start", "Starting origin data read", {});
		return this.ctx.invoke({ invoke: () => this.ctx.native.startReadOriginData() });
	}
	/**
	* Unfiltered per-day dump of the vendor SDK's local DB tables (iOS-only;
	* Android rejects CAPABILITY_UNSUPPORTED). Raw vendor field names and
	* units — the "get-everything" sink for host-side raw capture; promote
	* modalities to typed storage after the real shapes are known.
	*/
	readOriginRawDump(dayOffset) {
		return this.ctx.invoke({ invoke: () => this.ctx.native.readOriginRawDump(dayOffset) });
	}
	/** Precision-sleep sessions (gate: precise-sleep support). Raw vendor shape. */
	readAccurateSleepData(date) {
		return this.ctx.invoke({ invoke: () => this.ctx.native.readAccurateSleepData(date ?? null) });
	}
	/** Stored offline ECG records. Raw vendor shape. */
	readStoredEcgData(date) {
		return this.ctx.invoke({ invoke: () => this.ctx.native.readStoredEcgData(date ?? null) });
	}
	/** Stored HRV records. Raw vendor shape. */
	readStoredHrvData(date) {
		return this.ctx.invoke({ invoke: () => this.ctx.native.readStoredHrvData(date ?? null) });
	}
	/** Stored temperature records. Raw vendor shape. */
	readStoredTemperatureData(date) {
		return this.ctx.invoke({ invoke: () => this.ctx.native.readStoredTemperatureData(date ?? null) });
	}
	/** Stored blood-glucose records. Raw vendor shape. */
	readStoredBloodGlucoseData(date) {
		return this.ctx.invoke({ invoke: () => this.ctx.native.readStoredBloodGlucoseData(date ?? null) });
	}
	/** Stored body-composition records. Raw vendor shape. */
	readStoredBodyCompositionData(date) {
		return this.ctx.invoke({ invoke: () => this.ctx.native.readStoredBodyCompositionData(date ?? null) });
	}
	/**
	* Stream-read collector (ADR 0015): fires the exercise-history read and
	* resolves with every stored session once `exercise_read_complete` arrives.
	* `exercise_read_progress` events re-arm the stall watchdog (slow ≠ dead)
	* and stream to `onProgress` for host progress bars. Rejects
	* `CAPABILITY_UNSUPPORTED` when the Band has no exercise history (distinct
	* from a supported Band with zero stored workouts → `[]`),
	* `OPERATION_FAILED` when the vendor aborts (`success: false`), and
	* `TIMEOUT` after {@link EXERCISE_STALL_MS} of event silence.
	*/
	readExerciseSessions(opts) {
		this.ctx.log("info", "read", "read.exercise.start", "Starting exercise history read", {});
		return collectStream(this.ctx, {
			start: () => this.ctx.invoke({ invoke: () => this.ctx.native.startReadExerciseData() }),
			dataEvent: "exercise_session_data",
			pick: (payload) => payload.session,
			onItem: opts?.onSession,
			completeEvent: "exercise_read_complete",
			isFailure: (payload) => payload.success ? null : "exercise read aborted by the Band (invalid state)",
			onComplete: opts?.onComplete,
			progress: {
				event: "exercise_read_progress",
				onProgress: (payload) => {
					opts?.onProgress?.(payload.progress);
				}
			},
			stallMs: EXERCISE_STALL_MS
		});
	}
};
/** Max silence between exercise-stream events before the read is declared
* dead. The vendor app budgets 60s for its whole `readSportModelOrigin` step;
* per-event silence of 30s is far past any live transfer's inter-packet gap. */
const EXERCISE_STALL_MS = 3e4;
//#endregion
//#region src/capabilities/music.ts
/** Normalizes a music remote command string from native. */
function normalizeMusicRemoteCommand(value) {
	const s = typeof value === "string" ? value : "";
	if (s === "next") return "next";
	if (s === "previous") return "previous";
	if (s === "pausePlay" || s === "pause_play") return "pause_play";
	return "pause_play";
}
function validateMusicData(data) {
	if (typeof data.name !== "string" || data.name.trim().length === 0) throw {
		code: "INVALID_ARGUMENT",
		message: "name is required"
	};
	if (typeof data.artist !== "string" || data.artist.trim().length === 0) throw {
		code: "INVALID_ARGUMENT",
		message: "artist is required"
	};
	if (!Number.isInteger(data.volume) || data.volume < 1 || data.volume > 100) throw {
		code: "INVALID_ARGUMENT",
		message: "volume must be an integer between 1 and 100"
	};
}
var MusicCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	setMusicControlEnabled(enabled) {
		return this.ctx.invoke({ invoke: () => this.ctx.native.setMusicControlEnabled(enabled) });
	}
	pushMusicData(data) {
		return this.ctx.invoke({
			validate: () => validateMusicData(data),
			invoke: () => this.ctx.native.pushMusicData(deepCamelKeys(data))
		});
	}
};
//#endregion
//#region src/capabilities/origin-data/normalizers.ts
function normalizeOriginItem(value) {
	const rawBloodGlucose = toNumber(value.bloodGlucose ?? value.glucose);
	return {
		time: toStringValue(value.time),
		heart_value: toInt(value.heartValue ?? value.heart_value),
		step_value: toInt(value.stepValue ?? value.step_value),
		cal_value: toNumber(value.calValue ?? value.cal_value) ?? 0,
		dis_value: toNumber(value.disValue ?? value.dis_value) ?? 0,
		sport_value: toInt(value.sportValue ?? value.sport_value),
		systolic: toInt(value.systolic ?? value.highValue),
		diastolic: toInt(value.diastolic ?? value.lowValue),
		spo2_value: toInt(value.spo2Value ?? value.spo2_value),
		temp_value: toNumber(value.tempValue ?? value.temp_value) ?? 0,
		stress_value: toInt(value.stressValue ?? value.stress_value ?? value.stress ?? value.pressure),
		met: toNumber(value.met) ?? 0,
		oxygens: Array.isArray(value.oxygens) ? value.oxygens.map((item) => toInt(item)) : void 0,
		ppgs: Array.isArray(value.ppgs) ? value.ppgs.map((item) => toInt(item)) : void 0,
		ecgs: Array.isArray(value.ecgs) ? value.ecgs.map((item) => toInt(item)) : void 0,
		res_rates: Array.isArray(value.resRates ?? value.res_rates) ? (value.resRates ?? value.res_rates).map((item) => toInt(item)) : void 0,
		sleep_states: Array.isArray(value.sleepStates ?? value.sleep_states) ? (value.sleepStates ?? value.sleep_states).map((item) => toInt(item)) : void 0,
		apnea_results: Array.isArray(value.apneaResults ?? value.apnea_results) ? (value.apneaResults ?? value.apnea_results).map((item) => toInt(item)) : void 0,
		hypoxia_times: Array.isArray(value.hypoxiaTimes ?? value.hypoxia_times) ? (value.hypoxiaTimes ?? value.hypoxia_times).map((item) => toInt(item)) : void 0,
		cardiac_loads: Array.isArray(value.cardiacLoads ?? value.cardiac_loads) ? (value.cardiacLoads ?? value.cardiac_loads).map((item) => toInt(item)) : void 0,
		blood_glucose: rawBloodGlucose === void 0 ? void 0 : rawBloodGlucose
	};
}
function normalizeOriginDataList(value) {
	if (!Array.isArray(value)) return [];
	const normalized = [];
	for (const item of value) if (isRecord(item)) normalized.push(normalizeOriginItem(item));
	return normalized.sort((a, b) => a.time.localeCompare(b.time));
}
function normalizeHalfHourData(value) {
	const record = isRecord(value) ? value : {};
	return {
		time: toStringValue(record.time),
		heart_value: toInt(record.heartValue ?? record.heart_value),
		sport_value: toInt(record.sportValue ?? record.sport_value),
		step_value: toInt(record.stepValue ?? record.step_value),
		cal_value: toNumber(record.calValue ?? record.cal_value) ?? 0,
		dis_value: toNumber(record.disValue ?? record.dis_value) ?? 0,
		diastolic: toInt(record.diastolic),
		systolic: toInt(record.systolic),
		spo2_value: toInt(record.spo2Value ?? record.spo2_value),
		temp_value: toNumber(record.tempValue ?? record.temp_value),
		stress_value: toInt(record.stressValue ?? record.stress_value),
		met: toNumber(record.met)
	};
}
/**
* Bespoke envelope for the `read_origin_progress` event: the inner payload
* lives under `progress` and carries camelCase keys that need clamping and
* sane defaults. Returns the original envelope with the normalized `progress`.
*/
function normalizeReadOriginProgressPayload(value) {
	if (!isRecord(value) || !isRecord(value.progress)) return value;
	const progress = value.progress;
	const normalized = {
		read_state: typeof progress.readState === "string" ? progress.readState : "idle",
		total_days: typeof progress.totalDays === "number" && Number.isFinite(progress.totalDays) ? Math.max(1, Math.trunc(progress.totalDays)) : 1,
		current_day: typeof progress.currentDay === "number" && Number.isFinite(progress.currentDay) ? Math.max(1, Math.trunc(progress.currentDay)) : 1,
		progress: typeof progress.progress === "number" && Number.isFinite(progress.progress) ? Math.trunc(clamp(progress.progress <= 1 ? progress.progress * 100 : progress.progress, 0, 100)) : 0
	};
	return {
		...value,
		progress: normalized
	};
}
function normalizeSpo2OriginData(value) {
	const record = isRecord(value) ? value : {};
	return {
		time: toStringValue(record.time),
		date: toStringValue(record.date),
		heart_value: toInt(record.heartValue ?? record.heart_value),
		value: toInt(record.value),
		rate: toInt(record.rate),
		is_hypoxia: toInt(record.isHypoxia ?? record.is_hypoxia),
		cardiac_load: toInt(record.cardiacLoad ?? record.cardiac_load),
		temp1: toInt(record.temp1),
		sport_value: toInt(record.sportValue ?? record.sport_value),
		apnea_result: toInt(record.apneaResult ?? record.apnea_result),
		hypoxia_time: toInt(record.hypoxiaTime ?? record.hypoxia_time),
		hypopnea: toInt(record.hypopnea),
		step_value: toInt(record.stepValue ?? record.step_value),
		all_pack_number: toInt(record.allPackNumber ?? record.all_pack_number),
		current_pack_number: toInt(record.currentPackNumber ?? record.current_pack_number)
	};
}
//#endregion
//#region src/capabilities/realtime-tests/normalizers.ts
function normalizeHeartRateTestResult(value) {
	const record = isRecord(value) ? value : {};
	return {
		state: normalizeTestState(record.rawState ?? record.state),
		value: toInt(record.value),
		progress: toInt(record.progress)
	};
}
function normalizeBloodPressureTestResult(value) {
	const record = isRecord(value) ? value : {};
	return {
		state: normalizeTestState(record.rawState ?? record.state),
		systolic: toInt(record.systolic ?? record.highPressure),
		diastolic: toInt(record.diastolic ?? record.lowPressure),
		pulse: toInt(record.pulse),
		progress: toInt(record.progress)
	};
}
function normalizeBloodOxygenTestResult(value) {
	const record = isRecord(value) ? value : {};
	return {
		state: normalizeTestState(record.rawState ?? record.state),
		value: toInt(record.value ?? record.oxygenValue),
		rate: toInt(record.rate ?? record.rateValue),
		progress: toInt(record.progress)
	};
}
function normalizeTemperatureTestResult(value) {
	const record = isRecord(value) ? value : {};
	return {
		state: normalizeTestState(record.rawState ?? record.state),
		value: toNumber(record.value ?? record.tempValue),
		original_temp: toNumber(record.originalTemp ?? record.original_temp ?? record.originalTempValue),
		progress: toInt(record.progress),
		enable: typeof record.enable === "boolean" ? record.enable : void 0
	};
}
function normalizeWaveform(value) {
	if (!Array.isArray(value)) return void 0;
	const out = [];
	for (const x of value) {
		const n = typeof x === "number" ? x : toInt(x);
		if (n !== void 0) out.push(n);
	}
	return out.length ? out : void 0;
}
function normalizeHrvTestResult(value) {
	const record = isRecord(value) ? value : {};
	return {
		state: normalizeTestState(record.rawState ?? record.state),
		value: toInt(record.value ?? record.hrv),
		progress: toInt(record.progress),
		raw_state: typeof record.rawState === "string" ? record.rawState : void 0
	};
}
function normalizeEcgTestResult(value) {
	const record = isRecord(value) ? value : {};
	const int = (v) => {
		const n = toNumber(v);
		return n === void 0 ? void 0 : Math.trunc(n);
	};
	const mv = (v) => {
		const n = toNumber(v);
		return n === void 0 ? void 0 : n / 100;
	};
	const rhythm = Array.isArray(record.rhythmDiagnosis) ? record.rhythmDiagnosis.filter((s) => typeof s === "string" && s.length > 0) : void 0;
	return {
		state: normalizeTestState(record.rawState ?? record.state),
		progress: toInt(record.progress),
		heart_rate: toInt(record.heartRate ?? record.hr),
		hrv: toInt(record.hrv),
		raw_state: typeof record.rawState === "string" ? record.rawState : void 0,
		waveform: normalizeWaveform(record.waveform),
		qt_ms: int(record.qtMs),
		sdnn_ms: int(record.sdnnMs),
		rmssd_ms: int(record.rmssdMs),
		qrs_duration_ms: int(record.qrsDurationMs),
		qrs_amplitude_mv: mv(record.qrsAmpX100),
		st_amplitude_mv: mv(record.stAmpX100),
		mental_stress_index: int(record.mentalStressIndex),
		fatigue_index: int(record.fatigueIndex),
		min_hr: int(record.minHr),
		max_hr: int(record.maxHr),
		rhythm_diagnosis: rhythm && rhythm.length > 0 ? rhythm : void 0
	};
}
function normalizeFatigueTestResult(value) {
	const record = isRecord(value) ? value : {};
	return {
		state: normalizeTestState(record.rawState ?? record.state),
		progress: toInt(record.progress),
		level: toInt(record.level ?? record.fatigueLevel),
		raw_state: typeof record.rawState === "string" ? record.rawState : void 0
	};
}
function normalizeBreathingTestResult(value) {
	const record = isRecord(value) ? value : {};
	return {
		state: normalizeTestState(record.rawState ?? record.state),
		progress: toInt(record.progress),
		rate: toInt(record.rate ?? record.breathingRate),
		raw_state: typeof record.rawState === "string" ? record.rawState : void 0
	};
}
function normalizeBodyCompositionMetrics(value) {
	if (!isRecord(value)) return void 0;
	const r = value;
	const mt = r.measurementTime;
	const timeRec = isRecord(mt) ? mt : void 0;
	return {
		date: typeof r.date === "string" ? r.date : void 0,
		test_time: typeof r.testTime === "string" ? r.testTime : void 0,
		is_device_test: typeof r.isDeviceTest === "boolean" ? r.isDeviceTest : void 0,
		stature_cm: toInt(r.statureCm ?? r.stature),
		weight_kg: toInt(r.weightKg ?? r.weight),
		gender: toInt(r.gender),
		bmi: toNumber(r.bmi),
		body_fat_percentage: toNumber(r.bodyFatPercentage),
		fat_mass_kg: toNumber(r.fatMassKg ?? r.fatMass),
		lean_body_mass_kg: toNumber(r.leanBodyMassKg ?? r.leanBodyMass),
		muscle_rate: toNumber(r.muscleRate),
		muscle_mass_kg: toNumber(r.muscleMassKg ?? r.muscleMass),
		subcutaneous_fat_percentage: toNumber(r.subcutaneousFatPercentage ?? r.subcutaneousFat),
		body_water_percentage: toNumber(r.bodyWaterPercentage ?? r.bodyMoisture),
		water_mass_kg: toNumber(r.waterMassKg ?? r.waterContent),
		skeletal_muscle_rate: toNumber(r.skeletalMuscleRate),
		bone_mass_kg: toNumber(r.boneMassKg ?? r.boneMass),
		protein_percentage: toNumber(r.proteinPercentage ?? r.proportionOfProtein),
		protein_mass_kg: toNumber(r.proteinMassKg ?? r.proteinAmount),
		basal_metabolic_rate_kcal: toNumber(r.basalMetabolicRateKcal ?? r.basalMetabolicRate),
		measurement_duration_seconds: toInt(r.measurementDurationSeconds ?? r.duration),
		source_id_type: toInt(r.sourceIdType ?? r.idType),
		measurement_time: timeRec ? {
			year: toInt(timeRec.year),
			month: toInt(timeRec.month),
			day: toInt(timeRec.day),
			hour: toInt(timeRec.hour),
			minute: toInt(timeRec.minute)
		} : void 0
	};
}
function normalizeBodyCompositionTestResult(value) {
	const record = isRecord(value) ? value : {};
	const raw = record.rawState;
	return {
		state: normalizeTestState(record.state),
		progress: toInt(record.progress),
		lead: toInt(record.lead),
		raw_state: typeof raw === "string" || typeof raw === "number" ? raw : void 0,
		is_end: typeof record.isEnd === "boolean" ? record.isEnd : void 0,
		composition: normalizeBodyCompositionMetrics(record.composition)
	};
}
function normalizeHealthGlanceResult(value) {
	const r = isRecord(value) ? value : {};
	const raw = r.rawState;
	const pos = (v) => {
		const n = toNumber(v);
		return typeof n === "number" && n > 0 ? n : void 0;
	};
	return {
		state: normalizeTestState(r.state),
		progress: toInt(r.progress),
		raw_state: typeof raw === "string" || typeof raw === "number" ? raw : void 0,
		is_end: typeof r.isEnd === "boolean" ? r.isEnd : void 0,
		heart_rate: pos(r.heartRate),
		blood_oxygen: pos(r.bloodOxygen),
		stress: pos(r.stress),
		hrv: pos(r.hrv),
		body_temperature: pos(r.bodyTemperature),
		systolic: pos(r.systolic),
		diastolic: pos(r.diastolic),
		blood_sugar: pos(r.bloodSugar),
		fatigue_level: pos(r.fatigueLevel)
	};
}
function normalizeStressData(value) {
	const record = isRecord(value) ? value : {};
	return {
		stress: toInt(record.stress ?? record.value),
		timestamp: toInt(record.timestamp, Date.now()),
		progress: toInt(record.progress),
		status: toStringValue(record.status || normalizeTestState(record.rawState ?? record.state)),
		is_end: typeof record.isEnd === "boolean" ? record.isEnd : void 0
	};
}
function normalizeBloodGlucoseData(value) {
	const record = isRecord(value) ? value : {};
	return {
		glucose: toNumber(record.glucose ?? record.bloodGlucose),
		progress: toInt(record.progress),
		level: record.level === void 0 || typeof record.level === "number" || typeof record.level === "string" ? record.level : void 0,
		state: record.state === void 0 ? normalizeTestState(record.rawState ?? record.status) : normalizeTestState(record.rawState ?? record.state),
		status: toStringValue(record.status),
		timestamp: toInt(record.timestamp, Date.now()),
		is_end: typeof record.isEnd === "boolean" ? record.isEnd : void 0,
		error: toStringValue(record.error)
	};
}
function normalizeGsrTestResult(value) {
	const record = isRecord(value) ? value : {};
	const elRaw = record.emotionLevel ?? record.emotion_level;
	return {
		state: normalizeTestState(record.state),
		progress: toInt(record.progress) ?? 0,
		emotion_level: elRaw != null ? toInt(elRaw) : null,
		skin_moisture: toNumber(record.skinMoisture ?? record.skin_moisture) ?? null,
		sns_activation: toNumber(record.snsActivation ?? record.sns_activation) ?? null,
		cortisol_value: toNumber(record.cortisolValue ?? record.cortisol_value) ?? null
	};
}
function normalizeBloodAnalysisValues(value) {
	if (!isRecord(value)) return null;
	const r = value;
	return {
		uric_acid: toNumber(r.uricAcid ?? r.uric_acid) ?? 0,
		total_cholesterol: toNumber(r.totalCholesterol ?? r.total_cholesterol) ?? 0,
		triglyceride: toNumber(r.triglyceride) ?? 0,
		high_density_lipoprotein: toNumber(r.highDensityLipoprotein ?? r.high_density_lipoprotein) ?? 0,
		low_density_lipoprotein: toNumber(r.lowDensityLipoprotein ?? r.low_density_lipoprotein) ?? 0
	};
}
function normalizeBloodAnalysisTestResult(value) {
	const record = isRecord(value) ? value : {};
	return {
		state: normalizeTestState(record.state),
		progress: toInt(record.progress) ?? 0,
		values: isRecord(record.values) ? normalizeBloodAnalysisValues(record.values) : null
	};
}
function normalizePttTestResult(value) {
	const record = isRecord(value) ? value : {};
	return {
		heart_rate: toInt(record.heartRate ?? record.heart_rate) ?? 0,
		hrv: toInt(record.hrv) ?? 0,
		qt_interval: toInt(record.qtInterval ?? record.qt_interval) ?? 0,
		signal_quality: toInt(record.signalQuality ?? record.signal_quality) ?? 0,
		progress: toInt(record.progress) ?? 0
	};
}
//#endregion
//#region src/capabilities/realtime-tests/registry.ts
/**
* Single source of truth for realtime-test metadata.
*
* Each row binds a modality key (`heart_rate`, `ecg`, …) to its result event
* name, the envelope field holding the payload, the result normalizer, and —
* for tests the capability initiates — a `control` surface that dispatches the
* matching native start/stop methods. The bridge's `event-registry.ts` derives
* its result-event defs from this table, and `RealtimeTestsCapability` uses
* `control` to dispatch `startTest()` / `stopTest()`.
*
* Adding a new realtime test = one row.
*/
const REALTIME_TEST_DEFINITIONS = {
	heart_rate: {
		event: "heart_rate_test_result",
		eventField: "result",
		logScope: "test",
		normalize: normalizeHeartRateTestResult,
		control: {
			start: (n) => n.startHeartRateTest(),
			stop: (n) => n.stopHeartRateTest()
		}
	},
	blood_pressure: {
		event: "blood_pressure_test_result",
		eventField: "result",
		logScope: "test",
		normalize: normalizeBloodPressureTestResult,
		control: {
			start: (n) => n.startBloodPressureTest(),
			stop: (n) => n.stopBloodPressureTest()
		}
	},
	blood_oxygen: {
		event: "blood_oxygen_test_result",
		eventField: "result",
		logScope: "test",
		normalize: normalizeBloodOxygenTestResult,
		control: {
			start: (n) => n.startBloodOxygenTest(),
			stop: (n) => n.stopBloodOxygenTest()
		}
	},
	temperature: {
		event: "temperature_test_result",
		eventField: "result",
		logScope: "test",
		normalize: normalizeTemperatureTestResult,
		control: {
			start: (n) => n.startTemperatureTest(),
			stop: (n) => n.stopTemperatureTest()
		}
	},
	stress: {
		event: "stress_data",
		eventField: "data",
		logScope: "test",
		normalize: normalizeStressData,
		control: {
			start: (n) => n.startStressTest(),
			stop: (n) => n.stopStressTest()
		}
	},
	blood_glucose: {
		event: "blood_glucose_data",
		eventField: "data",
		logScope: "test",
		normalize: normalizeBloodGlucoseData,
		control: {
			start: (n) => n.startBloodGlucoseTest(),
			stop: (n) => n.stopBloodGlucoseTest()
		}
	},
	hrv: {
		event: "hrv_test_result",
		eventField: "result",
		logScope: "test",
		normalize: normalizeHrvTestResult,
		control: {
			start: (n) => n.startHrvTest(),
			stop: (n) => n.stopHrvTest()
		}
	},
	ecg: {
		event: "ecg_test_result",
		eventField: "result",
		logScope: "test",
		normalize: normalizeEcgTestResult,
		control: {
			start: (n, opts) => n.startEcgTest(opts ? deepCamelKeys(opts) : void 0),
			stop: (n) => n.stopEcgTest()
		}
	},
	fatigue: {
		event: "fatigue_test_result",
		eventField: "result",
		logScope: "test",
		normalize: normalizeFatigueTestResult,
		control: {
			start: (n) => n.startFatigueTest(),
			stop: (n) => n.stopFatigueTest()
		}
	},
	breathing: {
		event: "breathing_test_result",
		eventField: "result",
		logScope: "test",
		normalize: normalizeBreathingTestResult,
		control: {
			start: (n) => n.startBreathingTest(),
			stop: (n) => n.stopBreathingTest()
		}
	},
	body_composition: {
		event: "body_composition_test_result",
		eventField: "result",
		logScope: "test",
		normalize: normalizeBodyCompositionTestResult,
		control: {
			start: (n) => n.startBodyCompositionTest(),
			stop: (n) => n.stopBodyCompositionTest()
		}
	},
	health_glance: {
		event: "health_glance_test_result",
		eventField: "result",
		logScope: "test",
		normalize: normalizeHealthGlanceResult,
		control: {
			start: (n) => n.startHealthGlanceTest(),
			stop: (n) => n.stopHealthGlanceTest()
		}
	},
	blood_analysis: {
		event: "blood_analysis_test_result",
		eventField: "result",
		logScope: "device",
		normalize: normalizeBloodAnalysisTestResult
	},
	gsr: {
		event: "gsr_test_result",
		eventField: "result",
		logScope: "device",
		normalize: normalizeGsrTestResult
	},
	ptt: {
		event: "ptt_test_result",
		eventField: "result",
		logScope: "device",
		normalize: normalizePttTestResult
	}
};
/**
* String-literal map of {@link RealtimeTestModality} values, derived from the
* registry. Useful for autocompletion: `RealtimeTest.heart_rate`.
*/
const RealtimeTest = Object.fromEntries(Object.entries(REALTIME_TEST_DEFINITIONS).filter(([, def]) => def.control !== void 0).map(([k]) => [k, k]));
/** Snake-case event name → camelCase native emitter name. */
function eventNameToNative(event) {
	return event.replace(/_([a-z\d])/g, (_m, c) => c.toUpperCase());
}
//#endregion
//#region src/capabilities/band-discovery/normalizers.ts
const bluetoothStatesByCode = [
	"unknown",
	"resetting",
	"unsupported",
	"unauthorized",
	"powered_off",
	"powered_on"
];
const bluetoothAuthorizationsByCode = [
	"not_determined",
	"restricted",
	"denied",
	"allowed_always"
];
const bluetoothStateValueMap = {
	poweredOff: "powered_off",
	poweredOn: "powered_on"
};
const bluetoothAuthValueMap = {
	notDetermined: "not_determined",
	allowedAlways: "allowed_always"
};
const validPermissionStatuses = new Set([
	"granted",
	"denied",
	"restricted",
	"unknown",
	"never_ask_again",
	"powered_off"
]);
function normalizePermissionsResult(value) {
	if (typeof value === "boolean") return {
		granted: value,
		status: value ? "granted" : "denied",
		can_ask_again: !value
	};
	if (typeof value === "string") switch (value.toLowerCase()) {
		case "granted": return {
			granted: true,
			status: "granted",
			can_ask_again: false
		};
		case "restricted": return {
			granted: false,
			status: "restricted",
			can_ask_again: false
		};
		case "never_ask_again": return {
			granted: false,
			status: "never_ask_again",
			can_ask_again: false
		};
		case "poweredoff":
		case "powered_off": return {
			granted: false,
			status: "powered_off",
			can_ask_again: false
		};
		case "unknown": return {
			granted: false,
			status: "unknown",
			can_ask_again: true
		};
		default: return {
			granted: false,
			status: "denied",
			can_ask_again: true
		};
	}
	if (isRecord(value)) {
		const rawGranted = value.granted;
		const rawStatus = value.status;
		const rawCanAskAgain = value.canAskAgain ?? value.can_ask_again;
		const status = typeof rawStatus === "string" && validPermissionStatuses.has(rawStatus) ? rawStatus : typeof rawGranted === "boolean" && rawGranted ? "granted" : "denied";
		return {
			granted: typeof rawGranted === "boolean" ? rawGranted : status === "granted",
			status,
			can_ask_again: typeof rawCanAskAgain === "boolean" ? rawCanAskAgain : status !== "granted" && status !== "restricted" && status !== "never_ask_again" && status !== "powered_off"
		};
	}
	return {
		granted: false,
		status: "unknown",
		can_ask_again: true
	};
}
function normalizeBluetoothStatus(value) {
	if (!isRecord(value)) return value;
	const rawState = value.state;
	const rawAuthorization = value.authorization;
	const stateRaw = typeof rawState === "number" ? bluetoothStatesByCode[rawState] ?? "unknown" : typeof rawState === "string" ? bluetoothStateValueMap[rawState] ?? rawState : "unknown";
	const authRaw = typeof rawAuthorization === "number" ? bluetoothAuthorizationsByCode[rawAuthorization] ?? "not_determined" : typeof rawAuthorization === "string" ? bluetoothAuthValueMap[rawAuthorization] ?? rawAuthorization : "not_determined";
	return {
		state: stateRaw,
		state_name: typeof value.stateName === "string" ? value.stateName : stateRaw,
		authorization: authRaw,
		authorization_name: typeof value.authorizationName === "string" ? value.authorizationName : authRaw,
		is_scanning: toBoolean(value.isScanning, false),
		pending_scan_start: toBoolean(value.pendingScanStart, false)
	};
}
//#endregion
//#region src/capabilities/session/normalizers.ts
function normalizePasswordData(value) {
	const record = isRecord(value) ? value : {};
	const rawStatus = record.status ?? record.rawStatus ?? record.mStatus ?? record.result ?? "UNKNOWN";
	let status = "UNKNOWN";
	if (typeof rawStatus === "string") {
		const normalized = rawStatus.toUpperCase();
		if (normalized.includes("CHECK_SUCCESS")) status = "CHECK_SUCCESS";
		else if (normalized.includes("CHECK_FAIL")) status = "CHECK_FAIL";
		else if (normalized.includes("NOT_SET")) status = "NOT_SET";
		else if (normalized.includes("SUCCESS")) status = "SUCCESS";
		else if (normalized.includes("FAIL")) status = "FAILED";
	}
	const numericStatus = record.rawStatus ?? record.raw_status;
	return {
		status,
		...typeof numericStatus === "number" && { raw_status: numericStatus },
		password: toStringValue(record.password ?? record.pwd),
		device_number: toStringValue(record.deviceNumber ?? record.device_number),
		device_version: toStringValue(record.deviceVersion ?? record.device_version),
		device_test_version: toStringValue(record.deviceTestVersion ?? record.device_test_version),
		is_have_drink_data: (record.isHaveDrinkData ?? record.is_have_drink_data) === void 0 ? void 0 : toBoolean(record.isHaveDrinkData ?? record.is_have_drink_data),
		is_open_night_turn_wrist: (record.isOpenNightTurnWrist ?? record.isOpenNightTurnWriste ?? record.is_open_night_turn_wrist) === void 0 ? void 0 : normalizeFunctionStatus(record.isOpenNightTurnWrist ?? record.isOpenNightTurnWriste ?? record.is_open_night_turn_wrist),
		find_phone_function: (record.findPhoneFunction ?? record.find_phone_function) === void 0 ? void 0 : normalizeFunctionStatus(record.findPhoneFunction ?? record.find_phone_function),
		wear_detect_function: (record.wearDetectFunction ?? record.wear_detect_function) === void 0 ? void 0 : normalizeFunctionStatus(record.wearDetectFunction ?? record.wear_detect_function)
	};
}
//#endregion
//#region src/capabilities/sleep-data/normalizers.ts
function normalizeSleepRecord(value) {
	if (Array.isArray(value.items) && isRecord(value.summary)) return {
		date: toStringValue(value.date),
		items: value.items.map((item) => {
			const record = isRecord(item) ? item : {};
			return {
				date: toStringValue(record.date),
				sleep_time: toStringValue(record.sleepTime ?? record.sleep_time),
				wake_time: toStringValue(record.wakeTime ?? record.wake_time),
				deep_sleep_minutes: toInt(record.deepSleepMinutes ?? record.deep_sleep_minutes),
				light_sleep_minutes: toInt(record.lightSleepMinutes ?? record.light_sleep_minutes),
				total_sleep_minutes: toInt(record.totalSleepMinutes ?? record.total_sleep_minutes),
				sleep_quality: toInt(record.sleepQuality ?? record.sleep_quality),
				sleep_line: toStringValue(record.sleepLine ?? record.sleep_line),
				wake_up_count: toInt(record.wakeUpCount ?? record.wake_up_count)
			};
		}),
		summary: {
			total_deep_sleep_minutes: toInt(value.summary.totalDeepSleepMinutes ?? value.summary.total_deep_sleep_minutes),
			total_light_sleep_minutes: toInt(value.summary.totalLightSleepMinutes ?? value.summary.total_light_sleep_minutes),
			total_sleep_minutes: toInt(value.summary.totalSleepMinutes ?? value.summary.total_sleep_minutes),
			average_sleep_quality: toInt(value.summary.averageSleepQuality ?? value.summary.average_sleep_quality),
			total_wake_up_count: toInt(value.summary.totalWakeUpCount ?? value.summary.total_wake_up_count)
		}
	};
	const sleep_time = toStringValue(value.SLEEP_TIME ?? value.sleepTime ?? value.sleep_time);
	const wake_time = toStringValue(value.WAKE_TIME ?? value.wakeTime ?? value.wake_time);
	if (!sleep_time && !wake_time) return null;
	const deep_sleep_minutes = Math.trunc((toNumber(value.DEEP_HOUR) ?? 0) * 60);
	const light_sleep_minutes = Math.trunc((toNumber(value.LIGHT_HOUR) ?? 0) * 60);
	const total_sleep_minutes = toInt(value.totalSleepMinutes ?? value.total_sleep_minutes, -1) >= 0 ? toInt(value.totalSleepMinutes ?? value.total_sleep_minutes) : Math.trunc((toNumber(value.SLE_HOUR) ?? 0) * 60 + (toNumber(value.SLE_MINUTE) ?? 0));
	const sleep_quality = toInt(value.SLEEP_LEVEL ?? value.sleepQuality ?? value.sleep_quality);
	const wake_up_count = toInt(value.WakeUpTime ?? value.wakeUpCount ?? value.wake_up_count);
	const date = toStringValue(value.date || (wake_time ? wake_time.slice(0, 10) : ""));
	return {
		date,
		items: [{
			date,
			sleep_time,
			wake_time,
			deep_sleep_minutes,
			light_sleep_minutes,
			total_sleep_minutes,
			sleep_quality,
			sleep_line: toStringValue(value.SLE_LINE ?? value.sleepLine ?? value.sleep_line),
			wake_up_count
		}],
		summary: {
			total_deep_sleep_minutes: deep_sleep_minutes,
			total_light_sleep_minutes: light_sleep_minutes,
			total_sleep_minutes,
			average_sleep_quality: sleep_quality,
			total_wake_up_count: wake_up_count
		}
	};
}
function normalizeSleepDataList(value) {
	if (!Array.isArray(value)) {
		if (isRecord(value)) {
			const single = normalizeSleepRecord(value);
			return single ? [single] : [];
		}
		return [];
	}
	return value.map((item) => isRecord(item) ? normalizeSleepRecord(item) : null).filter((item) => item !== null);
}
//#endregion
//#region src/capabilities/social-msg.ts
const supportedFunctionKeys = [
	"phone",
	"sms",
	"wechat",
	"qq",
	"facebook",
	"twitter",
	"instagram",
	"linkedin",
	"whatsapp",
	"line",
	"skype",
	"email",
	"other"
];
function normalizeSocialMsgData(value) {
	const record = typeof value === "object" && value !== null ? value : {};
	return Object.fromEntries(supportedFunctionKeys.map((key) => [key, normalizeFunctionStatus(record[key])]));
}
const VALID_FUNCTION_STATUSES = new Set([
	"unsupported",
	"support",
	"open",
	"close",
	"unknown"
]);
function validateSocialMsgData(data) {
	const keys = Object.keys(data);
	if (keys.length === 0) throw {
		code: "INVALID_ARGUMENT",
		message: "data must contain at least one channel"
	};
	for (const key of keys) {
		const value = data[key];
		if (!VALID_FUNCTION_STATUSES.has(value)) throw {
			code: "INVALID_ARGUMENT",
			message: `${key} must be a valid FunctionStatus`
		};
	}
}
var SocialMsgCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	readSocialMsgData() {
		return this.ctx.invoke({
			invoke: () => this.ctx.native.readSocialMsgData(),
			normalize: normalizeSocialMsgData,
			afterSuccess: (result) => {
				this.ctx.log("debug", "device", "device.social.read", "Social message settings received", { data: result });
			}
		});
	}
	writeSocialMsgData(data) {
		return this.ctx.invoke({
			validate: () => validateSocialMsgData(data),
			invoke: () => this.ctx.native.writeSocialMsgData(deepCamelKeys(data))
		});
	}
};
//#endregion
//#region src/capabilities/sos.ts
function normalizeSosCallTimesSettings(value) {
	const record = isRecord(value) ? value : {};
	return {
		times: toInt(record.times),
		min_times: toInt(record.minTimes ?? record.min_times),
		max_times: toInt(record.maxTimes ?? record.max_times)
	};
}
function validateSosCallTimes(times) {
	if (!Number.isInteger(times) || times < 1) throw {
		code: "INVALID_ARGUMENT",
		message: "times must be a positive integer"
	};
}
var SosCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	readSosCallTimes() {
		return this.ctx.invoke({
			invoke: () => this.ctx.native.readSosCallTimes(),
			normalize: normalizeSosCallTimesSettings,
			afterSuccess: (data) => this.ctx.emitDeviceEvent("sos_call_times_data", { data })
		});
	}
	setSosCallTimes(times) {
		return this.ctx.invoke({
			validate: () => validateSosCallTimes(times),
			invoke: () => this.ctx.native.setSosCallTimes(times)
		});
	}
};
//#endregion
//#region src/capabilities/sport-steps.ts
function normalizeSportStepData(value) {
	const record = isRecord(value) ? value : {};
	return {
		date: toStringValue(record.date),
		step_count: toInt(record.stepCount ?? record.step_count ?? record.step),
		distance: toNumber(record.distance ?? record.dis) ?? 0,
		calories: toNumber(record.calories ?? record.kcal ?? record.cal) ?? 0
	};
}
var SportStepsCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	readSportStepData(date) {
		return this.ctx.invoke({
			invoke: () => this.ctx.native.readSportStepData(date),
			normalize: normalizeSportStepData,
			afterSuccess: (result) => {
				this.ctx.log("debug", "read", "read.sport.result", "Sport step data received", { data: result });
			}
		});
	}
};
//#endregion
//#region src/bridge/event-registry.ts
function defineEvent(def) {
	return def;
}
function emptyPayload() {
	return () => ({});
}
const EVENT_DEFINITIONS_CORE = {
	device_found: defineEvent({
		jsName: "device_found",
		nativeName: "deviceFound",
		logScope: "scan",
		normalize: passthrough()
	}),
	scan_started: defineEvent({
		jsName: "scan_started",
		logScope: "scan",
		normalize: emptyPayload()
	}),
	scan_stopped: defineEvent({
		jsName: "scan_stopped",
		logScope: "scan",
		normalize: emptyPayload()
	}),
	bluetooth_state_changed: defineEvent({
		jsName: "bluetooth_state_changed",
		nativeName: "bluetoothStateChanged",
		logScope: "bluetooth",
		normalize: (raw) => {
			return normalizeBluetoothStatus(isRecord(raw) ? raw : {});
		}
	}),
	device_connected: defineEvent({
		jsName: "device_connected",
		nativeName: "deviceConnected",
		logScope: "connection",
		normalize: passthrough()
	}),
	device_disconnected: defineEvent({
		jsName: "device_disconnected",
		nativeName: "deviceDisconnected",
		logScope: "connection",
		normalize: passthrough()
	}),
	device_connect_status: defineEvent({
		jsName: "device_connect_status",
		nativeName: "deviceConnectStatus",
		logScope: "connection",
		normalize: passthrough()
	}),
	device_ready: defineEvent({
		jsName: "device_ready",
		nativeName: "deviceReady",
		logScope: "connection",
		normalize: passthrough()
	}),
	connection_status_changed: defineEvent({
		jsName: "connection_status_changed",
		nativeName: "connectionStatusChanged",
		logScope: "connection",
		normalize: passthrough()
	}),
	connect_pending: defineEvent({
		jsName: "connect_pending",
		nativeName: "connectPending",
		logScope: "connection",
		normalize: passthrough()
	}),
	password_data: defineEvent({
		jsName: "password_data",
		nativeName: "passwordData",
		logScope: "device",
		normalize: wrapInner("data", normalizePasswordData)
	}),
	read_origin_progress: defineEvent({
		jsName: "read_origin_progress",
		nativeName: "readOriginProgress",
		logScope: "read",
		normalize: (raw) => normalizeReadOriginProgressPayload(raw)
	}),
	read_origin_complete: defineEvent({
		jsName: "read_origin_complete",
		nativeName: "readOriginComplete",
		logScope: "read",
		normalize: passthrough()
	}),
	origin_five_minute_data: defineEvent({
		jsName: "origin_five_minute_data",
		nativeName: "originFiveMinuteData",
		logScope: "read",
		normalize: wrapInner("data", (raw) => normalizeOriginDataList([raw])[0])
	}),
	origin_half_hour_data: defineEvent({
		jsName: "origin_half_hour_data",
		nativeName: "originHalfHourData",
		logScope: "read",
		normalize: wrapInner("data", normalizeHalfHourData)
	}),
	origin_spo2_data: defineEvent({
		jsName: "origin_spo2_data",
		nativeName: "originSpo2Data",
		logScope: "device",
		normalize: wrapInner("data", normalizeSpo2OriginData)
	}),
	sleep_data: defineEvent({
		jsName: "sleep_data",
		nativeName: "sleepData",
		logScope: "read",
		normalize: wrapInner("data", (raw) => normalizeSleepDataList(raw)[0])
	}),
	accurate_sleep_data: defineEvent({
		jsName: "accurate_sleep_data",
		nativeName: "accurateSleepData",
		logScope: "device",
		normalize: passthrough()
	}),
	sport_step_data: defineEvent({
		jsName: "sport_step_data",
		nativeName: "sportStepData",
		logScope: "read",
		normalize: wrapInner("data", normalizeSportStepData)
	}),
	exercise_session_data: defineEvent({
		jsName: "exercise_session_data",
		nativeName: "exerciseSessionData",
		logScope: "device",
		normalize: wrapInner("session", normalizeExerciseSessionInner)
	}),
	exercise_read_complete: defineEvent({
		jsName: "exercise_read_complete",
		nativeName: "exerciseReadComplete",
		logScope: "read",
		normalize: passthrough()
	}),
	exercise_read_progress: defineEvent({
		jsName: "exercise_read_progress",
		nativeName: "exerciseReadProgress",
		logScope: "read",
		normalize: passthrough()
	}),
	stored_temperature_data: defineEvent({
		jsName: "stored_temperature_data",
		nativeName: "storedTemperatureData",
		logScope: "device",
		normalize: passthrough()
	}),
	stored_blood_glucose_data: defineEvent({
		jsName: "stored_blood_glucose_data",
		nativeName: "storedBloodGlucoseData",
		logScope: "device",
		normalize: passthrough()
	}),
	stored_hrv_data: defineEvent({
		jsName: "stored_hrv_data",
		nativeName: "storedHrvData",
		logScope: "device",
		normalize: passthrough()
	}),
	stored_ecg_data: defineEvent({
		jsName: "stored_ecg_data",
		nativeName: "storedEcgData",
		logScope: "device",
		normalize: passthrough()
	}),
	stored_body_composition_data: defineEvent({
		jsName: "stored_body_composition_data",
		nativeName: "storedBodyCompositionData",
		logScope: "device",
		normalize: passthrough()
	}),
	ptt_state_changed: defineEvent({
		jsName: "ptt_state_changed",
		nativeName: "pttStateChanged",
		logScope: "device",
		normalize: passthrough()
	}),
	alarm_data: defineEvent({
		jsName: "alarm_data",
		nativeName: "alarmData",
		logScope: "device",
		normalize: wrapInner("alarms", normalizeAlarmList, { fallbackKey: "data" })
	}),
	heart_rate_alarm_data: defineEvent({
		jsName: "heart_rate_alarm_data",
		logScope: "device",
		normalize: wrapInner("data", normalizeHeartRateAlarm)
	}),
	spo2_alarm_data: defineEvent({
		jsName: "spo2_alarm_data",
		logScope: "device",
		normalize: passthrough()
	}),
	battery_data: defineEvent({
		jsName: "battery_data",
		nativeName: "batteryData",
		logScope: "device",
		normalize: wrapInner("data", normalizeBatteryInfo)
	}),
	device_version: defineEvent({
		jsName: "device_version",
		nativeName: "deviceVersion",
		logScope: "device",
		normalize: wrapInner("version", normalizeDeviceVersion)
	}),
	device_function: defineEvent({
		jsName: "device_function",
		nativeName: "deviceFunction",
		logScope: "device",
		normalize: (raw) => {
			const p = isRecord(raw) ? raw : {};
			return {
				...p,
				data: normalizeDeviceFunctions(p.data ?? p.functions),
				functions: normalizeDeviceFunctions(p.functions ?? p.data)
			};
		}
	}),
	device_bt_state_changed: defineEvent({
		jsName: "device_bt_state_changed",
		nativeName: "deviceBTStateChanged",
		logScope: "device",
		normalize: (raw) => {
			const p = isRecord(raw) ? raw : {};
			return {
				...p,
				state: normalizeDeviceBTState(p.state ?? p.btState),
				bt_switch_open: (p.btSwitchOpen ?? p.bt_switch_open) === true,
				media_switch_open: (p.mediaSwitchOpen ?? p.media_switch_open) === true
			};
		}
	}),
	device_switches_data: defineEvent({
		jsName: "device_switches_data",
		logScope: "device",
		normalize: passthrough()
	}),
	find_device_state: defineEvent({
		jsName: "find_device_state",
		nativeName: "findDeviceState",
		logScope: "device",
		normalize: (raw) => {
			return normalizeFindDeviceStatePayload(isRecord(raw) ? raw : {});
		}
	}),
	firmware_dfu_progress: defineEvent({
		jsName: "firmware_dfu_progress",
		nativeName: "firmwareDfuProgress",
		logScope: "device",
		normalize: (raw) => normalizeFirmwareDfuProgress(raw)
	}),
	contacts_data: defineEvent({
		jsName: "contacts_data",
		nativeName: "contactsData",
		logScope: "device",
		normalize: wrapInner("contacts", normalizeContactList, { fallbackKey: "data" })
	}),
	sos_call_times_data: defineEvent({
		jsName: "sos_call_times_data",
		nativeName: "sosCallTimesData",
		logScope: "device",
		normalize: wrapInner("data", normalizeSosCallTimesSettings)
	}),
	device_sos_triggered: defineEvent({
		jsName: "device_sos_triggered",
		nativeName: "deviceSosTriggered",
		logScope: "device",
		normalize: passthrough()
	}),
	camera_shutter: defineEvent({
		jsName: "camera_shutter",
		nativeName: "cameraShutter",
		logScope: "device",
		normalize: wrapInner("status", normalizeCameraShutterStatus)
	}),
	music_remote_command: defineEvent({
		jsName: "music_remote_command",
		nativeName: "musicRemoteCommand",
		logScope: "device",
		normalize: wrapInner("command", normalizeMusicRemoteCommand)
	}),
	social_msg_data: defineEvent({
		jsName: "social_msg_data",
		nativeName: "socialMsgData",
		logScope: "device",
		normalize: wrapInner("data", normalizeSocialMsgData)
	}),
	sport_mode_data: defineEvent({
		jsName: "sport_mode_data",
		nativeName: "sportModeData",
		logScope: "device",
		normalize: (raw) => {
			const p = isRecord(raw) ? raw : {};
			const rawMode = p.mode;
			const mode = typeof rawMode === "string" && rawMode !== "" && rawMode !== "common" ? rawMode.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`) : null;
			return {
				...p,
				mode
			};
		}
	}),
	custom_settings_data: defineEvent({
		jsName: "custom_settings_data",
		nativeName: "customSettingsData",
		logScope: "device",
		normalize: passthrough()
	}),
	health_remind_data: defineEvent({
		jsName: "health_remind_data",
		nativeName: "healthRemindData",
		logScope: "device",
		normalize: passthrough()
	}),
	apnea_remind_data: defineEvent({
		jsName: "apnea_remind_data",
		nativeName: "apneaRemindData",
		logScope: "device",
		normalize: passthrough()
	}),
	error: defineEvent({
		jsName: "error",
		nativeName: "error",
		logScope: "sdk",
		normalize: passthrough()
	}),
	sdk_initialized: defineEvent({
		jsName: "sdk_initialized",
		logScope: "sdk",
		normalize: emptyPayload()
	})
};
const REALTIME_TEST_EVENT_DEFINITIONS = Object.fromEntries(Object.values(REALTIME_TEST_DEFINITIONS).map((row) => {
	const def = defineEvent({
		jsName: row.event,
		nativeName: eventNameToNative(row.event),
		logScope: row.logScope,
		normalize: wrapInner(row.eventField, row.normalize)
	});
	return [row.event, def];
}));
const EVENT_DEFINITIONS = {
	...EVENT_DEFINITIONS_CORE,
	...REALTIME_TEST_EVENT_DEFINITIONS
};
const allDefs = Object.values(EVENT_DEFINITIONS);
const nativeDefs = allDefs.filter((d) => typeof d.nativeName === "string");
/** Native (camelCase) event names emitted by iOS/Android. */
const NATIVE_EMITTED_EVENTS = nativeDefs.map((d) => d.nativeName);
/** Maps each native camelCase event name to the snake_case name exposed to JS consumers. */
const NATIVE_TO_JS_EVENT_MAP = Object.fromEntries(nativeDefs.map((d) => [d.nativeName, d.jsName]));
/** Log scope per event — used when the runtime logs an `event.<name>` debug entry. */
const EVENT_LOG_SCOPES = Object.fromEntries(allDefs.map((d) => [d.jsName, d.logScope]));
/** Inner-payload normalizers, keyed by JS event name. */
const EVENT_NORMALIZERS = Object.fromEntries(allDefs.map((d) => [d.jsName, d.normalize]));
allDefs.filter((d) => d.nativeName === void 0).map((d) => d.jsName);
nativeDefs.map((d) => d.jsName);
allDefs.map((d) => d.jsName);
/**
* Apply the per-event inner-payload normalizer declared in {@link EVENT_DEFINITIONS}
* and then run `deepSnakeKeys` so consumers always see snake_case keys (ADR 0004).
*/
function normalizeEventPayload(event, payload) {
	return deepSnakeKeys(EVENT_NORMALIZERS[event](payload));
}
//#endregion
//#region src/bridge/native-invoke-pipeline.ts
/**
* Runs **validate → await native → normalize → afterSuccess** and throws the
* `VeepooError` returned by `mapError` on failure. The pipeline owns the throw.
*/
async function invokeOrThrow(options) {
	options.validate?.();
	try {
		const raw = await options.invoke();
		const out = options.normalize ? options.normalize(raw) : raw;
		options.afterSuccess?.(out);
		return out;
	} catch (error) {
		throw options.mapError(error);
	}
}
/**
* Runs **validate → await native → normalize → afterSuccess** and returns the
* fallback produced by `recover` on failure — no exception propagates.
*
* Use only when a safe default exists and partial results are valid.
* Capabilities reach this via `ctx.invokeWithRecovery`, which wraps the
* runtime's error pipeline so the failure is still logged + emitted as an
* `error` event before `recoverWith` resolves.
*/
async function invokeWithRecovery(options) {
	options.validate?.();
	try {
		const raw = await options.invoke();
		const out = options.normalize ? options.normalize(raw) : raw;
		options.afterSuccess?.(out);
		return out;
	} catch (error) {
		return options.recover(error);
	}
}
//#endregion
//#region src/errors/native-rejection-mapping.ts
/**
* Flat per-native-code mapping driving {@link mapNativeRejection} (ADR 0003).
*
* Each entry maps a SCREAMING_SNAKE native rejection code to its public
* `VeepooErrorCode`. The runtime rule is documented in CONTEXT.md:
*   `native_code` is emitted on the resulting `VeepooError` iff the public
*   `code` differs from the native rejection key (after trim/case normalization).
*
* Keep the table grouped by relationship for readability:
*   - direct:    public code === native code
*   - alias:     different public code (native_code emitted)
*   - collapse:  mapped into a public bucket (native_code emitted)
*
* Codes that are present in native sources but absent from this table fall
* through to `OPERATION_FAILED` with `native_code = <code>` (see
* {@link ALLOWED_NATIVE_REJECT_CODES} for the audit allowlist).
*/
const NATIVE_REJECT_MAPPING = {
	BLUETOOTH_NOT_ENABLED: { code: "BLUETOOTH_NOT_ENABLED" },
	CAPABILITY_UNSUPPORTED: { code: "CAPABILITY_UNSUPPORTED" },
	CONNECTION_FAILED: { code: "CONNECTION_FAILED" },
	DEVICE_BUSY: { code: "DEVICE_BUSY" },
	DEVICE_NOT_CONNECTED: { code: "DEVICE_NOT_CONNECTED" },
	DEVICE_NOT_FOUND: { code: "DEVICE_NOT_FOUND" },
	DEVICE_NOT_READY: { code: "DEVICE_NOT_READY" },
	DISCONNECTION_FAILED: { code: "DISCONNECTION_FAILED" },
	INVALID_ARGUMENT: { code: "INVALID_ARGUMENT" },
	INVALID_CONNECT_ID: { code: "INVALID_CONNECT_ID" },
	NOT_WEARING: { code: "NOT_WEARING" },
	OPERATION_FAILED: { code: "OPERATION_FAILED" },
	PASSWORD_REQUIRED: { code: "PASSWORD_REQUIRED" },
	PERMISSION_DENIED: { code: "PERMISSION_DENIED" },
	REALTIME_TEST_IN_PROGRESS: { code: "REALTIME_TEST_IN_PROGRESS" },
	SDK_NOT_INITIALIZED: { code: "SDK_NOT_INITIALIZED" },
	TIMEOUT: { code: "TIMEOUT" },
	UNKNOWN: { code: "UNKNOWN" },
	DISCONNECT_ERROR: { code: "DISCONNECTION_FAILED" },
	DISCONNECT_FAILED: { code: "DISCONNECTION_FAILED" },
	SDK_NOT_AVAILABLE: { code: "SDK_NOT_INITIALIZED" },
	READ_FAILED: { code: "OPERATION_FAILED" },
	START_FAILED: { code: "OPERATION_FAILED" },
	STOP_FAILED: { code: "OPERATION_FAILED" },
	INVALID_LANGUAGE: { code: "INVALID_ARGUMENT" },
	INVALID_TYPE: { code: "INVALID_ARGUMENT" },
	PASSWORD_TYPE_ERROR: { code: "INVALID_ARGUMENT" }
};
//#endregion
//#region src/errors/map-native-rejection.ts
const VEEPOO_CODE_SET = new Set([
	"UNKNOWN",
	"INVALID_ARGUMENT",
	"INVALID_CONNECT_ID",
	"PERMISSION_DENIED",
	"CONNECTION_FAILED",
	"DISCONNECTION_FAILED",
	"BLUETOOTH_NOT_ENABLED",
	"DEVICE_NOT_FOUND",
	"OPERATION_FAILED",
	"SDK_NOT_INITIALIZED",
	"DEVICE_NOT_CONNECTED",
	"DEVICE_NOT_READY",
	"REALTIME_TEST_IN_PROGRESS",
	"CAPABILITY_UNSUPPORTED",
	"DEVICE_BUSY",
	"PASSWORD_REQUIRED",
	"TIMEOUT",
	"NOT_WEARING"
]);
function isVeepooErrorShape(error) {
	if (!error || typeof error !== "object") return false;
	const o = error;
	return typeof o.code === "string" && typeof o.message === "string" && VEEPOO_CODE_SET.has(o.code);
}
function normalizeNativeCode(raw) {
	return raw.trim().toUpperCase().replace(/\s+/g, "_");
}
function extractNativeParts(error) {
	if (error instanceof Error) {
		const c = error.code;
		const message = error.message || String(error);
		if (typeof c === "string" && c.length > 0) return {
			code: normalizeNativeCode(c),
			message
		};
		if (typeof c === "number" && Number.isFinite(c)) return {
			code: String(Math.trunc(c)),
			message
		};
		return { message };
	}
	if (error && typeof error === "object") {
		const o = error;
		const c = o.code;
		const m = o.message;
		const message = typeof m === "string" ? m : String(error);
		if (typeof c === "string" && c.length > 0) return {
			code: normalizeNativeCode(c),
			message
		};
		if (typeof c === "number" && Number.isFinite(c)) return {
			code: String(Math.trunc(c)),
			message
		};
	}
	return { message: typeof error === "string" ? error : String(error) };
}
/**
* Looks up the public code for a native rejection. The emit-`native_code`
* decision follows the CONTEXT.md rule: emit when public code differs from
* the native key (after trim/case normalization), omit otherwise.
*/
function mapKnownNativeCode(normalizedNative) {
	const entry = NATIVE_REJECT_MAPPING[normalizedNative];
	if (!entry) return null;
	return {
		code: entry.code,
		nativeCode: entry.code !== normalizedNative ? normalizedNative : void 0
	};
}
function isScreamingSnake(s) {
	return /^[A-Z][A-Z0-9_]*$/.test(s);
}
/**
* Maps Expo / native module rejections to {@link VeepooError} per ADR 0003.
* Pass-through when `error` is already a shaped {@link VeepooError} (e.g. from validators).
*/
function mapNativeRejection(error, ctx) {
	if (isVeepooErrorShape(error)) return {
		...error,
		device_id: error.device_id ?? ctx.deviceId
	};
	const { code: nativeNorm, message } = extractNativeParts(error);
	if (!nativeNorm) return {
		code: ctx.fallbackCode,
		message,
		device_id: ctx.deviceId
	};
	const known = mapKnownNativeCode(nativeNorm);
	if (known) {
		const out = {
			code: known.code,
			message,
			device_id: ctx.deviceId
		};
		if (known.nativeCode !== void 0) out.native_code = known.nativeCode;
		return out;
	}
	if (isScreamingSnake(nativeNorm)) return {
		code: "OPERATION_FAILED",
		message,
		native_code: nativeNorm,
		device_id: ctx.deviceId
	};
	return {
		code: "OPERATION_FAILED",
		message,
		native_code: nativeNorm,
		device_id: ctx.deviceId
	};
}
//#endregion
//#region src/sdk/veepoo-sdk-state.ts
/**
* Mutable **Session** / scan / init fields driven by native events and host calls.
*
* Two paths into the state, both part of the public interface:
*   - **Setters** (`setConnectedDeviceId`, `setScanning`, `markInitialized`, `reset`)
*     used by capabilities for explicit, operation-driven mutations
*     (e.g. `SessionCapability.connect` afterSuccess).
*   - **`applyEvent`** used by the bridge to fold a normalized native event
*     into state. The per-event dispatch lives inside the class — callers
*     and tests cross the same public interface the bridge does.
*/
var VeepooSdkState = class {
	constructor() {
		this.initialized = false;
		this.scanning = false;
		this.deviceId = null;
	}
	get isInitialized() {
		return this.initialized;
	}
	markInitialized(value) {
		this.initialized = value;
	}
	get isScanning() {
		return this.scanning;
	}
	setScanning(value) {
		this.scanning = value;
	}
	get connectedDeviceId() {
		return this.deviceId;
	}
	setConnectedDeviceId(id) {
		this.deviceId = id;
	}
	/** Clears connection/session scan fields (e.g. destroy). */
	reset() {
		this.initialized = false;
		this.scanning = false;
		this.deviceId = null;
	}
	/**
	* Folds a normalized event into Session/scan/init state.
	* No-op for events that do not affect state.
	*/
	applyEvent(event, payload) {
		switch (event) {
			case "bluetooth_state_changed": {
				const p = payload;
				if (typeof p.is_scanning === "boolean") this.scanning = p.is_scanning;
				return;
			}
			case "device_connected": {
				const p = payload;
				this.onDeviceConnected(p.device_id ?? "");
				return;
			}
			case "device_disconnected": {
				const p = payload;
				this.onDeviceDisconnected(p.device_id);
				return;
			}
			case "device_connect_status":
			case "connection_status_changed": {
				const p = payload;
				if (p.status) this.onConnectionStatusChanged(p.device_id, p.status);
				return;
			}
			default: return;
		}
	}
	onDeviceConnected(deviceId) {
		if (typeof deviceId === "string" && deviceId.length > 0) this.deviceId = deviceId;
	}
	/**
	* Clears `connectedDeviceId` when:
	* - `deviceId` is undefined/empty (unconditional clear), OR
	* - `deviceId` matches `connectedDeviceId`
	*
	* Also sets `scanning = false`.
	*/
	onDeviceDisconnected(deviceId) {
		if (!deviceId || this.deviceId === deviceId) this.deviceId = null;
		this.scanning = false;
	}
	/**
	* Clears `connectedDeviceId` only when `status === "disconnected"` AND
	* (`deviceId` is undefined/empty OR `deviceId` matches `connectedDeviceId`).
	*/
	onConnectionStatusChanged(deviceId, status) {
		if (status === "disconnected" && (!deviceId || this.deviceId === deviceId)) this.deviceId = null;
	}
};
//#endregion
//#region src/bridge/origin-read-pipeline.ts
/**
* Pure pipeline that wraps per-device deduplication for `readOriginProgress`
* events, operating directly on the normalized payload rather than raw
* primitives.
*
* Rules (identical to {@link OriginReadProgressFilter}, lifted to payload level):
* - `payload.progress` is not an object → **pass** (return `true`), no state stored
* - Non-finite `progress.progress` → **pass** (return `true`), no state stored
* - `readState === "start"` → reset stored progress for the device, **pass**
* - Equal progress → **suppress** (return `false`)
* - Progress changed → update stored progress, **pass** (return `true`)
*
* No dependency on the runtime, state manager, logger, or event bus.
*/
var OriginReadPipeline = class {
	constructor() {
		this.lastProgress = /* @__PURE__ */ new Map();
	}
	/**
	* Decide whether the event should be emitted.
	*
	* @param payload The already-normalized `readOriginProgress` payload.
	* @returns `true` if the event should be emitted, `false` if it should be suppressed.
	*/
	shouldEmit(payload) {
		const deviceId = payload.device_id;
		const progressField = payload.progress;
		if (typeof progressField !== "object" || progressField === null) return true;
		const progress = progressField.progress;
		const readState = progressField.read_state;
		if (typeof progress !== "number" || !Number.isFinite(progress)) return true;
		if (readState === "start") {
			this.lastProgress.set(deviceId, progress);
			return true;
		}
		const last = this.lastProgress.get(deviceId);
		if (last !== void 0 && progress === last) return false;
		this.lastProgress.set(deviceId, progress);
		return true;
	}
	/**
	* Remove stored state for a device (call on disconnect so the next read
	* cycle starts fresh).
	*/
	clearDevice(deviceId) {
		this.lastProgress.delete(deviceId);
	}
};
//#endregion
//#region src/bridge/event-bus.ts
var EventBus = class {
	constructor(onListenerError) {
		this.onListenerError = onListenerError;
		this.listeners = /* @__PURE__ */ new Map();
		this.nativeSubscriptions = [];
		this.listenersSetup = false;
	}
	setupEventListeners(native, onEvent) {
		if (this.listenersSetup) return;
		this.listenersSetup = true;
		NATIVE_EMITTED_EVENTS.forEach((nativeEvent) => {
			const jsEvent = NATIVE_TO_JS_EVENT_MAP[nativeEvent];
			const subscription = native.addListener(nativeEvent, (payload) => {
				onEvent(jsEvent, payload);
			});
			this.nativeSubscriptions.push(subscription);
		});
	}
	teardownNativeListeners() {
		this.nativeSubscriptions.forEach((sub) => sub.remove());
		this.nativeSubscriptions = [];
		this.listenersSetup = false;
	}
	emit(event, payload) {
		const eventListeners = this.listeners.get(event);
		if (!eventListeners) return;
		eventListeners.forEach((listener) => {
			try {
				listener(payload);
			} catch (e) {
				this.onListenerError(e, event, payload);
			}
		});
	}
	on(event, listener) {
		if (!this.listeners.has(event)) this.listeners.set(event, /* @__PURE__ */ new Set());
		this.listeners.get(event).add(listener);
	}
	off(event, listener) {
		this.listeners.get(event)?.delete(listener);
	}
	once(event, listener) {
		const wrapper = (payload) => {
			this.listeners.get(event)?.delete(wrapper);
			listener(payload);
		};
		if (!this.listeners.has(event)) this.listeners.set(event, /* @__PURE__ */ new Set());
		this.listeners.get(event).add(wrapper);
	}
	removeAllListeners(event) {
		if (event) this.listeners.delete(event);
		else this.listeners.clear();
	}
};
//#endregion
//#region src/sdk/veepoo-sdk-runtime.ts
/**
* Shared **Session** / scan / init state (`state`), logging, and wiring between
* the native module, `EventBus`, and domain subsystems.
*/
var VeepooSDKRuntime = class {
	constructor(native) {
		this.state = new VeepooSdkState();
		this.originReadPipeline = new OriginReadPipeline();
		this.bus = new EventBus((error, event, payload) => {
			this.log("warn", "listener", `listener.${event}.failed`, `Event listener for ${event} threw`, {
				deviceId: this.getPayloadDeviceId(payload),
				error,
				data: payload
			});
			console.warn(`Error in event listener for ${event}:`, error);
		});
		this.logEnabled = false;
		this.logger = null;
		this.native = native;
	}
	getPlatform() {
		if (react_native.Platform.OS === "ios" || react_native.Platform.OS === "android" || react_native.Platform.OS === "web") return react_native.Platform.OS;
		return "unknown";
	}
	log(level, scope, action, message, options) {
		if (!this.logEnabled && !this.logger) return;
		const entry = {
			timestamp: Date.now(),
			level,
			scope,
			action,
			platform: this.getPlatform(),
			message,
			device_id: options?.deviceId,
			data: options?.data,
			error: options?.error instanceof Error ? options.error.message : typeof options?.error === "string" ? options.error : void 0
		};
		if (this.logEnabled && (typeof __DEV__ === "undefined" || __DEV__)) (level === "error" ? console.error : level === "warn" ? console.warn : level === "info" ? console.info : console.debug)("[VeepooSDK]", entry);
		if (this.logger) try {
			this.logger(entry);
		} catch (error) {
			if (this.logEnabled) console.warn("[VeepooSDK]", {
				timestamp: Date.now(),
				level: "warn",
				scope: "listener",
				action: "logger.callback.failed",
				platform: this.getPlatform(),
				message: "Logger callback failed",
				error: error instanceof Error ? error.message : String(error)
			});
		}
	}
	setupEventListeners() {
		this.bus.setupEventListeners(this.native, (event, payload) => this.emitLocal(event, payload));
	}
	emitLocal(event, payload) {
		const normalizedPayload = normalizeEventPayload(event, payload);
		if (event === "read_origin_progress") {
			if (!this.originReadPipeline.shouldEmit(normalizedPayload)) return;
		}
		this.log("debug", EVENT_LOG_SCOPES[event], `event.${event}`, `Received ${event} event`, {
			deviceId: this.getPayloadDeviceId(normalizedPayload),
			data: normalizedPayload
		});
		this.state.applyEvent(event, normalizedPayload);
		if (event === "device_disconnected") {
			const deviceId = normalizedPayload.device_id;
			if (deviceId) this.originReadPipeline.clearDevice(deviceId);
		}
		this.bus.emit(event, normalizedPayload);
	}
	getPayloadDeviceId(payload) {
		if (typeof payload !== "object" || payload === null) return;
		const deviceId = payload.device_id;
		return typeof deviceId === "string" && deviceId.length > 0 ? deviceId : void 0;
	}
	handleError(error, fallbackCode, deviceId) {
		const veepooError = mapNativeRejection(error, {
			fallbackCode,
			deviceId
		});
		this.log("warn", "sdk", `error.${veepooError.code}`, veepooError.message, {
			deviceId: veepooError.device_id,
			error
		});
		this.emitLocal("error", veepooError);
		return veepooError;
	}
	setLogEnabled(enabled) {
		this.logEnabled = enabled;
		this.log("info", "sdk", "logger.toggle", enabled ? "SDK logging enabled" : "SDK logging disabled");
	}
	isLogEnabled() {
		return this.logEnabled;
	}
	setLogger(logger) {
		this.logger = logger;
		this.log("debug", "sdk", "logger.set", logger ? "Custom logger attached" : "Custom logger cleared");
	}
	on(event, listener) {
		this.bus.on(event, listener);
	}
	off(event, listener) {
		this.bus.off(event, listener);
	}
	once(event, listener) {
		this.bus.once(event, listener);
	}
	removeAllListeners(event) {
		this.bus.removeAllListeners(event);
	}
	teardownNativeListeners() {
		this.bus.teardownNativeListeners();
	}
	resetAfterDestroy() {
		this.bus.removeAllListeners();
		this.state.reset();
		this.logger = null;
		this.logEnabled = false;
	}
	async init() {
		if (this.state.isInitialized) return;
		this.log("info", "sdk", "init.start", "Initializing SDK");
		this.setupEventListeners();
		await invokeOrThrow({
			invoke: () => this.native.init(),
			mapError: (error) => this.handleError(error, "UNKNOWN"),
			afterSuccess: () => {
				this.state.markInitialized(true);
				this.emitLocal("sdk_initialized", {});
				this.log("info", "sdk", "init.success", "SDK initialized");
			}
		});
	}
	destroy() {
		this.log("info", "sdk", "destroy", "Destroying SDK instance");
		this.teardownNativeListeners();
		this.resetAfterDestroy();
	}
	createCapabilityContext() {
		const mapError = (error, opts) => this.handleError(error, opts?.code ?? "OPERATION_FAILED", opts?.deviceId ?? this.state.connectedDeviceId ?? void 0);
		return {
			native: this.native,
			invoke: (opts) => {
				const { errorCode, errorDeviceId, ...rest } = opts;
				return invokeOrThrow({
					...rest,
					mapError: (error) => mapError(error, {
						code: errorCode,
						deviceId: errorDeviceId
					})
				});
			},
			invokeWithRecovery: (opts) => {
				const { errorCode, errorDeviceId, recoverWith, ...rest } = opts;
				return invokeWithRecovery({
					...rest,
					recover: (error) => {
						mapError(error, {
							code: errorCode,
							deviceId: errorDeviceId
						});
						return recoverWith;
					}
				});
			},
			emit: (event, payload) => this.emitLocal(event, payload),
			emitDeviceEvent: (event, payload) => {
				const deviceId = this.state.connectedDeviceId;
				if (deviceId === null) this.log("warn", "sdk", `emit.${event}.no_device`, `emitDeviceEvent("${event}") called with no connected Band`, { data: payload });
				this.emitLocal(event, {
					device_id: deviceId ?? "",
					...payload
				});
			},
			on: (event, listener) => this.on(event, listener),
			off: (event, listener) => this.off(event, listener),
			connectedDeviceId: () => this.state.connectedDeviceId,
			setConnectedDeviceId: (id) => this.state.setConnectedDeviceId(id),
			isScanning: () => this.state.isScanning,
			setScanning: (v) => this.state.setScanning(v),
			log: (level, scope, action, message, options) => this.log(level, scope, action, message, {
				...options,
				deviceId: options?.deviceId ?? this.state.connectedDeviceId ?? void 0
			})
		};
	}
};
//#endregion
//#region src/shared/assertions.ts
function fail(message) {
	throw {
		code: "INVALID_ARGUMENT",
		message
	};
}
function requireNonEmptyString(value, field) {
	if (typeof value !== "string" || value.trim().length === 0) fail(`${field} must be a non-empty string`);
}
function requireInRange(value, field, min, max) {
	if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) fail(`${field} must be between ${min} and ${max}`);
}
function requireValidHour(value, field) {
	requireInRange(value, field, 0, 23);
}
function requireValidMinute(value, field) {
	requireInRange(value, field, 0, 59);
}
//#endregion
//#region src/capabilities/alarms/validators.ts
function validateAlarm(alarm) {
	requireInRange(alarm.id, "id", 1, 20);
	requireValidHour(alarm.hour, "hour");
	requireValidMinute(alarm.minute, "minute");
	for (const day of alarm.repeat) requireInRange(day, "repeat element", 1, 7);
	if (alarm.scene !== void 0) requireInRange(alarm.scene, "scene", 0, 20);
	if (alarm.text !== void 0) {
		if (new TextEncoder().encode(alarm.text).byteLength > 60) throw {
			code: "INVALID_ARGUMENT",
			message: "text must not exceed 60 bytes"
		};
	}
}
function validateDeleteAlarm(alarmId) {
	requireInRange(alarmId, "alarmId", 1, 20);
}
function validateHeartRateAlarm(alarm) {
	requireInRange(alarm.high_threshold, "highThreshold", 1, 300);
	requireInRange(alarm.low_threshold, "lowThreshold", 1, 300);
	if (alarm.high_threshold <= alarm.low_threshold) throw {
		code: "INVALID_ARGUMENT",
		message: "highThreshold must be greater than lowThreshold"
	};
}
function validateSpo2Alarm(alarm) {
	requireInRange(alarm.low_threshold, "low_threshold", 1, 99);
}
//#endregion
//#region src/capabilities/alarms/index.ts
var AlarmsCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	readAlarms() {
		return this.ctx.invoke({
			invoke: () => this.ctx.native.readAlarms(),
			normalize: normalizeAlarmList,
			afterSuccess: (alarms) => this.ctx.emitDeviceEvent("alarm_data", { alarms })
		});
	}
	setAlarm(alarm) {
		return this.ctx.invoke({
			validate: () => validateAlarm(alarm),
			invoke: () => this.ctx.native.setAlarm(deepCamelKeys(alarm))
		});
	}
	deleteAlarm(alarmId) {
		return this.ctx.invoke({
			validate: () => validateDeleteAlarm(alarmId),
			invoke: () => this.ctx.native.deleteAlarm(alarmId)
		});
	}
	readHeartRateAlarm() {
		return this.ctx.invoke({
			invoke: () => this.ctx.native.readHeartRateAlarm(),
			normalize: normalizeHeartRateAlarm,
			afterSuccess: (data) => this.ctx.emitDeviceEvent("heart_rate_alarm_data", { data })
		});
	}
	setHeartRateAlarm(alarm) {
		return this.ctx.invoke({
			validate: () => validateHeartRateAlarm(alarm),
			invoke: () => this.ctx.native.setHeartRateAlarm(deepCamelKeys(alarm)),
			afterSuccess: () => this.ctx.emitDeviceEvent("heart_rate_alarm_data", { data: alarm })
		});
	}
	readSpo2Alarm() {
		return this.ctx.invoke({
			invoke: () => this.ctx.native.readSpo2Alarm(),
			normalize: normalizeSpo2Alarm,
			afterSuccess: (data) => this.ctx.emitDeviceEvent("spo2_alarm_data", { data })
		});
	}
	setSpo2Alarm(alarm) {
		return this.ctx.invoke({
			validate: () => validateSpo2Alarm(alarm),
			invoke: () => this.ctx.native.setSpo2Alarm(deepCamelKeys(alarm)),
			afterSuccess: () => this.ctx.emitDeviceEvent("spo2_alarm_data", { data: alarm })
		});
	}
};
//#endregion
//#region src/capabilities/auto-measure.ts
function normalizeAutoMeasureSetting(item) {
	return {
		protocol_type: toInt(item.protocolType ?? item.protocol_type),
		fun_type: toInt(item.funType ?? item.fun_type),
		is_switch_open: toBoolean(item.isSwitchOpen ?? item.is_switch_open),
		step_unit: toInt(item.stepUnit ?? item.step_unit),
		is_slot_modify: toBoolean(item.isSlotModify ?? item.is_slot_modify),
		is_interval_modify: toBoolean(item.isIntervalModify ?? item.is_interval_modify),
		support_start_minute: toInt(item.supportStartMinute ?? item.support_start_minute),
		support_end_minute: toInt(item.supportEndMinute ?? item.support_end_minute),
		measure_interval: toInt(item.measureInterval ?? item.measure_interval),
		current_start_minute: toInt(item.currentStartMinute ?? item.current_start_minute),
		current_end_minute: toInt(item.currentEndMinute ?? item.current_end_minute)
	};
}
function normalizeAutoMeasureSettings(value) {
	if (!Array.isArray(value)) return [];
	const settings = [];
	for (const item of value) if (isRecord(item)) settings.push(normalizeAutoMeasureSetting(item));
	return settings;
}
function validateAutoMeasureSetting(setting) {
	if (setting.measure_interval !== void 0) requireInRange(setting.measure_interval, "measureInterval", 1, 120);
	if (setting.current_start_minute !== void 0) requireInRange(setting.current_start_minute, "currentStartMinute", 0, 1439);
	if (setting.current_end_minute !== void 0) requireInRange(setting.current_end_minute, "currentEndMinute", 0, 1439);
}
var AutoMeasureCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	readAutoMeasureSetting() {
		return this.ctx.invoke({
			invoke: () => this.ctx.native.readAutoMeasureSetting(),
			normalize: normalizeAutoMeasureSettings,
			afterSuccess: (result) => {
				this.ctx.log("debug", "device", "autoMeasure.read", "Auto measure settings received", { data: { count: result.length } });
			}
		});
	}
	modifyAutoMeasureSetting(setting) {
		return this.ctx.invoke({
			validate: () => {
				validateAutoMeasureSetting(setting);
				this.ctx.log("info", "device", "autoMeasure.modify.start", "Modifying auto measure settings", { data: setting });
			},
			invoke: () => this.ctx.native.modifyAutoMeasureSetting(deepCamelKeys(setting)),
			normalize: normalizeAutoMeasureSettings,
			afterSuccess: (result) => {
				this.ctx.log("info", "device", "autoMeasure.modify.result", "Auto measure settings updated", { data: { count: result.length } });
			}
		});
	}
};
//#endregion
//#region src/capabilities/band-discovery/index.ts
var BandDiscoveryCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	async checkBluetoothStatus() {
		return this.ctx.invokeWithRecovery({
			invoke: () => this.ctx.native.isBluetoothEnabled(),
			errorCode: "UNKNOWN",
			recoverWith: false,
			afterSuccess: (enabled) => {
				this.ctx.log("debug", "bluetooth", "bluetooth.check", "Checked Bluetooth status", { data: { enabled } });
			}
		});
	}
	async requestPermissions() {
		return this.ctx.invokeWithRecovery({
			invoke: () => this.ctx.native.requestPermissions(),
			normalize: normalizePermissionsResult,
			errorCode: "PERMISSION_DENIED",
			recoverWith: {
				granted: false,
				status: "denied",
				can_ask_again: true
			},
			afterSuccess: (result) => {
				this.ctx.log("info", "permissions", "permissions.request", "Requested Bluetooth permissions", { data: result });
			}
		});
	}
	async startScan(options) {
		if (this.ctx.isScanning()) return;
		this.ctx.setScanning(true);
		this.ctx.emit("scan_started", {});
		this.ctx.log("info", "scan", "scan.start", "Starting device scan", { data: options });
		try {
			await this.ctx.invoke({
				invoke: () => this.ctx.native.startScan(options),
				errorCode: "UNKNOWN"
			});
		} catch (e) {
			this.endScan();
			throw e;
		}
	}
	async stopScan() {
		if (!this.ctx.isScanning()) return;
		try {
			await this.ctx.invoke({
				invoke: () => this.ctx.native.stopScan(),
				errorCode: "UNKNOWN"
			});
			this.ctx.log("info", "scan", "scan.stop", "Stopped device scan");
		} finally {
			this.endScan();
		}
	}
	endScan() {
		this.ctx.setScanning(false);
		this.ctx.emit("scan_stopped", {});
	}
};
//#endregion
//#region src/capabilities/calibration.ts
function validateBloodPressureCalibration(systolic, diastolic) {
	requireInRange(systolic, "systolic", 60, 250);
	requireInRange(diastolic, "diastolic", 60, 250);
}
function validateBloodGlucoseCalibration(value) {
	requireInRange(value, "value", 2, 30);
}
function validateBloodGlucoseRiskLevel(config) {
	requireInRange(config.low, "low", 2, 30);
	requireInRange(config.high, "high", 2, 30);
	if (config.low >= config.high) throw {
		code: "INVALID_ARGUMENT",
		message: "low must be less than high"
	};
}
var CalibrationCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	calibrateBloodPressure(systolic, diastolic) {
		return this.ctx.invoke({
			validate: () => validateBloodPressureCalibration(systolic, diastolic),
			invoke: () => this.ctx.native.calibrateBloodPressure(systolic, diastolic)
		});
	}
	calibrateBloodGlucose(value) {
		return this.ctx.invoke({
			validate: () => validateBloodGlucoseCalibration(value),
			invoke: () => this.ctx.native.calibrateBloodGlucose(value)
		});
	}
	setBloodGlucoseRiskLevel(config) {
		return this.ctx.invoke({
			validate: () => validateBloodGlucoseRiskLevel(config),
			invoke: () => this.ctx.native.setBloodGlucoseRiskLevel(config.low, config.high, config.unit)
		});
	}
};
//#endregion
//#region src/capabilities/contacts/validators.ts
const CONTACT_NAME_MAX_BYTES = 20;
function validateNewContact(contact) {
	if (typeof contact.name !== "string" || contact.name.trim().length === 0) throw {
		code: "INVALID_ARGUMENT",
		message: "name is required"
	};
	if (new TextEncoder().encode(contact.name).byteLength > CONTACT_NAME_MAX_BYTES) throw {
		code: "INVALID_ARGUMENT",
		message: `name must not exceed ${CONTACT_NAME_MAX_BYTES} bytes`
	};
	const phoneNumber = contact.phone_number;
	if (typeof phoneNumber !== "string" || phoneNumber.trim().length === 0) throw {
		code: "INVALID_ARGUMENT",
		message: "phoneNumber is required"
	};
	if (phoneNumber.trim().length > 20) throw {
		code: "INVALID_ARGUMENT",
		message: "phoneNumber must not exceed 20 characters"
	};
}
function validateContactId(contactId) {
	if (!Number.isInteger(contactId) || contactId < 0) throw {
		code: "INVALID_ARGUMENT",
		message: "contactId must be a non-negative integer"
	};
}
//#endregion
//#region src/capabilities/contacts/index.ts
var ContactsCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	readContacts(crc) {
		return this.ctx.invoke({
			invoke: () => this.ctx.native.readContacts(crc),
			normalize: normalizeContactList,
			afterSuccess: (contacts) => this.ctx.emitDeviceEvent("contacts_data", { contacts })
		});
	}
	addContact(contact) {
		return this.ctx.invoke({
			validate: () => validateNewContact(contact),
			invoke: () => this.ctx.native.addContact(deepCamelKeys(contact))
		});
	}
	deleteContact(contactId) {
		return this.ctx.invoke({
			validate: () => validateContactId(contactId),
			invoke: () => this.ctx.native.deleteContact(contactId)
		});
	}
	setContactSosState(contactId, isOpen) {
		return this.ctx.invoke({
			validate: () => validateContactId(contactId),
			invoke: () => this.ctx.native.setContactSosState(contactId, isOpen)
		});
	}
};
//#endregion
//#region src/capabilities/day-summary.ts
function normalizeSportList(value) {
	if (!Array.isArray(value)) return [];
	const items = [];
	for (const item of value) {
		if (!isRecord(item)) continue;
		items.push({
			time: toStringValue(item.time),
			step: toInt(item.step),
			cal: toNumber(item.cal) ?? 0,
			dis: toNumber(item.dis) ?? 0
		});
	}
	return items;
}
function normalizeRateList(value) {
	if (!Array.isArray(value)) return [];
	const items = [];
	for (const item of value) {
		if (!isRecord(item)) continue;
		items.push({
			time: toStringValue(item.time),
			rate: toInt(item.rate)
		});
	}
	return items;
}
function normalizeBpList(value) {
	if (!Array.isArray(value)) return [];
	const items = [];
	for (const item of value) {
		if (!isRecord(item)) continue;
		items.push({
			time: toStringValue(item.time),
			high: toInt(item.high),
			low: toInt(item.low)
		});
	}
	return items;
}
function normalizeDaySummaryData(value) {
	const record = isRecord(value) ? value : {};
	return {
		date: toStringValue(record.date),
		all_step: toInt(record.allStep ?? record.all_step),
		sport_list: normalizeSportList(record.sportList ?? record.sport_list),
		rate_list: normalizeRateList(record.rateList ?? record.rate_list),
		bp_list: normalizeBpList(record.bpList ?? record.bp_list)
	};
}
var DaySummaryCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	readDaySummaryData(dayOffset = 0) {
		return this.ctx.invoke({
			invoke: () => this.ctx.native.readDaySummaryData(dayOffset),
			normalize: normalizeDaySummaryData,
			afterSuccess: (result) => {
				this.ctx.log("debug", "read", "read.summary.result", "Day summary data received", { data: {
					dayOffset,
					date: result.date
				} });
			}
		});
	}
};
//#endregion
//#region src/capabilities/device-functions/index.ts
var DeviceFunctionsCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	readDeviceFunctions() {
		return this.ctx.invoke({
			invoke: () => this.ctx.native.readDeviceFunctions(),
			normalize: normalizeDeviceFunctions,
			afterSuccess: (result) => {
				this.ctx.log("debug", "device", "device.functions.read", "Device functions received", { data: result });
			}
		});
	}
};
//#endregion
//#region src/capabilities/device-switches.ts
const SWITCH_KEYS = [
	"auto_hr",
	"auto_bp",
	"auto_spo2",
	"auto_temperature",
	"auto_hrv",
	"auto_blood_glucose",
	"auto_ppg",
	"wear_detection",
	"disconnect_remind",
	"sos_remind",
	"auto_answer",
	"exercise_detection",
	"accurate_sleep",
	"ecg_normally_open",
	"met",
	"stress",
	"music_control"
];
const SWITCH_KEY_SET = new Set(SWITCH_KEYS);
/** Camel-case variant → snake_case switch key mapping. */
const CAMEL_TO_SWITCH = {
	autoHr: "auto_hr",
	autoHR: "auto_hr",
	autoBp: "auto_bp",
	autoBP: "auto_bp",
	autoSpo2: "auto_spo2",
	autoSPO2: "auto_spo2",
	autoTemperature: "auto_temperature",
	autoHrv: "auto_hrv",
	autoHRV: "auto_hrv",
	autoBloodGlucose: "auto_blood_glucose",
	autoPpg: "auto_ppg",
	autoPPG: "auto_ppg",
	wearDetection: "wear_detection",
	disconnectRemind: "disconnect_remind",
	sosRemind: "sos_remind",
	autoAnswer: "auto_answer",
	exerciseDetection: "exercise_detection",
	accurateSleep: "accurate_sleep",
	ecgNormallyOpen: "ecg_normally_open",
	met: "met",
	stress: "stress",
	musicControl: "music_control"
};
function normalizeDeviceSwitches(value) {
	const record = isRecord(value) ? value : {};
	const result = Object.fromEntries(SWITCH_KEYS.map((k) => [k, false]));
	for (const [rawKey, rawVal] of Object.entries(record)) {
		const snakeKey = CAMEL_TO_SWITCH[rawKey] ?? rawKey;
		if (SWITCH_KEY_SET.has(snakeKey)) result[snakeKey] = toBoolean(rawVal, false);
	}
	return result;
}
const DEVICE_SWITCH_TYPES = new Set([
	"auto_hr",
	"auto_bp",
	"auto_spo2",
	"auto_temperature",
	"auto_hrv",
	"auto_blood_glucose",
	"auto_ppg",
	"wear_detection",
	"disconnect_remind",
	"sos_remind",
	"auto_answer",
	"exercise_detection",
	"accurate_sleep",
	"ecg_normally_open",
	"met",
	"stress",
	"music_control"
]);
function validateDeviceSwitchType(type) {
	if (typeof type !== "string" || !DEVICE_SWITCH_TYPES.has(type)) throw {
		code: "INVALID_ARGUMENT",
		message: `Invalid device switch type: ${String(type)}`
	};
}
var DeviceSwitchesCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	readDeviceSwitches() {
		return this.ctx.invoke({
			invoke: () => this.ctx.native.readDeviceSwitches(),
			normalize: normalizeDeviceSwitches,
			afterSuccess: (switches) => this.ctx.emitDeviceEvent("device_switches_data", { switches })
		});
	}
	setDeviceSwitch(type, enabled) {
		return this.ctx.invoke({
			validate: () => validateDeviceSwitchType(type),
			invoke: () => this.ctx.native.setDeviceSwitch(type, enabled)
		});
	}
};
//#endregion
//#region src/capabilities/device-time.ts
function validateDeviceTime(time) {
	if (time === void 0) return;
	if (!(time instanceof Date) || isNaN(time.getTime())) throw {
		code: "INVALID_ARGUMENT",
		message: "time must be a valid Date"
	};
}
var DeviceTimeCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	async setDeviceTime(time) {
		validateDeviceTime(time);
		return this.ctx.invoke({ invoke: () => this.ctx.native.setDeviceTime(time === void 0 ? void 0 : {
			year: time.getFullYear(),
			month: time.getMonth() + 1,
			day: time.getDate(),
			hour: time.getHours(),
			minute: time.getMinutes(),
			second: time.getSeconds()
		}) });
	}
};
//#endregion
//#region src/capabilities/gps-timezone.ts
function validateGPSAndTimezoneData(data) {
	if (typeof data.latitude !== "number" || !Number.isFinite(data.latitude) || data.latitude < -90 || data.latitude > 90) throw {
		code: "INVALID_ARGUMENT",
		message: "latitude must be a number between -90 and 90"
	};
	if (typeof data.longitude !== "number" || !Number.isFinite(data.longitude) || data.longitude < -180 || data.longitude > 180) throw {
		code: "INVALID_ARGUMENT",
		message: "longitude must be a number between -180 and 180"
	};
	if (data.altitude !== void 0 && (typeof data.altitude !== "number" || !Number.isFinite(data.altitude))) throw {
		code: "INVALID_ARGUMENT",
		message: "altitude must be a finite number when provided"
	};
	const timezoneOffsetMinutes = data.timezone_offset_minutes;
	if (!Number.isInteger(timezoneOffsetMinutes) || timezoneOffsetMinutes % 15 !== 0) throw {
		code: "INVALID_ARGUMENT",
		message: "timezoneOffsetMinutes must be an integer multiple of 15"
	};
}
var GpsTimezoneCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	setDeviceGPSAndTimezone(data) {
		return this.ctx.invoke({
			validate: () => validateGPSAndTimezoneData(data),
			invoke: () => this.ctx.native.setDeviceGPSAndTimezone(deepCamelKeys(data))
		});
	}
};
//#endregion
//#region src/capabilities/language.ts
var LanguageCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	setLanguage(language) {
		return this.ctx.invoke({ invoke: () => this.ctx.native.setLanguage(language) });
	}
};
//#endregion
//#region src/capabilities/origin-data/index.ts
var OriginDataCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	readOriginData(dayOffset = 0) {
		return this.ctx.invoke({
			invoke: () => this.ctx.native.readOriginData(dayOffset),
			normalize: normalizeOriginDataList,
			afterSuccess: (result) => {
				this.ctx.log("debug", "read", "read.origin.result", "Origin data received", { data: {
					dayOffset,
					count: result.length
				} });
			}
		});
	}
};
//#endregion
//#region src/capabilities/personal-info.ts
function validatePersonalInfo(info) {
	if (info.sex !== 0 && info.sex !== 1) throw {
		code: "INVALID_ARGUMENT",
		message: "sex must be 0 or 1"
	};
	requireInRange(info.height, "height", 50, 300);
	requireInRange(info.weight, "weight", 1, 500);
	requireInRange(info.age, "age", 1, 120);
	requireInRange(info.step_aim, "stepAim", 1, 1e5);
	requireInRange(info.sleep_aim, "sleepAim", 0, 1440);
}
var PersonalInfoCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	syncPersonalInfo(info) {
		return this.ctx.invoke({
			validate: () => validatePersonalInfo(info),
			invoke: () => this.ctx.native.syncPersonalInfo(deepCamelKeys(info))
		});
	}
};
//#endregion
//#region src/capabilities/realtime-tests/index.ts
/**
* Drives the realtime-test family on the Band: start/stop a modality,
* including ECG with its optional options payload. Each modality's native
* binding lives in {@link REALTIME_TEST_DEFINITIONS} — see
* `src/capabilities/realtime-tests/registry.ts`.
*/
var RealtimeTestsCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	startTest(modality, options) {
		return this.runTest(modality, "start", options);
	}
	stopTest(modality) {
		return this.runTest(modality, "stop");
	}
	startEcgTest(options) {
		return this.startTest("ecg", options);
	}
	stopEcgTest() {
		return this.stopTest("ecg");
	}
	runTest(modality, direction, options) {
		const row = REALTIME_TEST_DEFINITIONS[modality];
		const label = `test.${modality}.${direction}`;
		this.ctx.log("info", "test", label, `${direction === "start" ? "Starting" : "Stopping"} ${modality} test`, direction === "start" && options ? { data: options } : {});
		return this.ctx.invoke({ invoke: () => direction === "start" ? row.control.start(this.ctx.native, options) : row.control.stop(this.ctx.native) });
	}
};
//#endregion
//#region src/capabilities/screen-light/normalizers.ts
function normalizeScreenLightSettings(value) {
	const record = isRecord(value) ? value : {};
	const base = {
		night_start_hour: toInt(record.nightStartHour ?? record.night_start_hour),
		night_start_minute: toInt(record.nightStartMinute ?? record.night_start_minute),
		night_end_hour: toInt(record.nightEndHour ?? record.night_end_hour),
		night_end_minute: toInt(record.nightEndMinute ?? record.night_end_minute),
		night_level: toInt(record.nightLevel ?? record.night_level),
		day_level: toInt(record.dayLevel ?? record.day_level),
		auto_adjust: toBoolean(record.autoAdjust ?? record.auto_adjust, false),
		max_level: toInt(record.maxLevel ?? record.max_level, 5)
	};
	const lastManual = record.lastManualDayLevel ?? record.last_manual_day_level;
	if (lastManual !== void 0 && lastManual !== null) base.last_manual_day_level = toInt(lastManual);
	return base;
}
function normalizeScreenLightDuration(value) {
	const record = isRecord(value) ? value : {};
	const out = {
		current_seconds: toInt(record.currentSeconds ?? record.current_seconds),
		min_seconds: toInt(record.minSeconds ?? record.min_seconds),
		max_seconds: toInt(record.maxSeconds ?? record.max_seconds)
	};
	const rec = record.recommendSeconds ?? record.recommend_seconds;
	if (rec !== void 0 && rec !== null) out.recommend_seconds = toInt(rec);
	return out;
}
//#endregion
//#region src/capabilities/screen-light/validators.ts
function validateScreenLightSettings(s) {
	requireValidHour(s.night_start_hour, "nightStartHour");
	requireValidMinute(s.night_start_minute, "nightStartMinute");
	requireValidHour(s.night_end_hour, "nightEndHour");
	requireValidMinute(s.night_end_minute, "nightEndMinute");
	requireInRange(s.night_level, "nightLevel", 0, 15);
	requireInRange(s.day_level, "dayLevel", 0, 15);
	requireInRange(s.max_level, "maxLevel", 1, 15);
	if (s.last_manual_day_level !== void 0) requireInRange(s.last_manual_day_level, "lastManualDayLevel", 0, 15);
}
function validateScreenLightDurationSeconds(seconds) {
	requireInRange(seconds, "seconds", 1, 600);
}
//#endregion
//#region src/capabilities/screen-light/index.ts
var ScreenLightCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	readScreenLightSettings() {
		return this.ctx.invoke({
			invoke: () => this.ctx.native.readScreenLightSettings(),
			normalize: normalizeScreenLightSettings
		});
	}
	setScreenLightSettings(settings) {
		return this.ctx.invoke({
			validate: () => validateScreenLightSettings(settings),
			invoke: () => this.ctx.native.setScreenLightSettings(deepCamelKeys(settings))
		});
	}
	readScreenLightDuration() {
		return this.ctx.invoke({
			invoke: () => this.ctx.native.readScreenLightDuration(),
			normalize: normalizeScreenLightDuration
		});
	}
	setScreenLightDuration(seconds) {
		return this.ctx.invoke({
			validate: () => validateScreenLightDurationSeconds(seconds),
			invoke: () => this.ctx.native.setScreenLightDuration(seconds)
		});
	}
};
//#endregion
//#region src/capabilities/sedentary-reminder.ts
function normalizeSedentaryReminderSettings(value) {
	const record = isRecord(value) ? value : {};
	return {
		start_hour: toInt(record.startHour ?? record.start_hour),
		start_minute: toInt(record.startMinute ?? record.start_minute),
		end_hour: toInt(record.endHour ?? record.end_hour),
		end_minute: toInt(record.endMinute ?? record.end_minute),
		threshold_minutes: toInt(record.thresholdMinutes ?? record.threshold_minutes, 60),
		enabled: toBoolean(record.enabled, false)
	};
}
/** Vendor long-sit gate is 30–240 minutes (iOS `longSeatGateValue`). */
function validateSedentaryReminderSettings(s) {
	requireValidHour(s.start_hour, "startHour");
	requireValidMinute(s.start_minute, "startMinute");
	requireValidHour(s.end_hour, "endHour");
	requireValidMinute(s.end_minute, "endMinute");
	requireInRange(s.threshold_minutes, "thresholdMinutes", 30, 240);
}
var SedentaryReminderCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	readSedentaryReminder() {
		return this.ctx.invoke({
			invoke: () => this.ctx.native.readSedentaryReminder(),
			normalize: normalizeSedentaryReminderSettings
		});
	}
	setSedentaryReminder(settings) {
		return this.ctx.invoke({
			validate: () => validateSedentaryReminderSettings(settings),
			invoke: () => this.ctx.native.setSedentaryReminder(deepCamelKeys(settings))
		});
	}
};
//#endregion
//#region src/capabilities/session/validators.ts
function validateDeviceId(deviceId) {
	requireNonEmptyString(deviceId, "deviceId");
}
function validateConnectOptions(options) {
	if (options.password !== void 0) requireNonEmptyString(options.password, "options.password");
	if (options.time_setting !== void 0) {
		const t = options.time_setting;
		requireInRange(t.year, "timeSetting.year", 2e3, 2100);
		requireInRange(t.month, "timeSetting.month", 1, 12);
		requireInRange(t.day, "timeSetting.day", 1, 31);
		requireValidHour(t.hour, "timeSetting.hour");
		requireValidMinute(t.minute, "timeSetting.minute");
		requireInRange(t.second, "timeSetting.second", 0, 59);
	}
}
function validateDeviceName(name) {
	requireNonEmptyString(name, "name");
	if (new TextEncoder().encode(name).byteLength > 20) throw {
		code: "INVALID_ARGUMENT",
		message: "name must not exceed 20 UTF-8 bytes"
	};
}
function validateConnectionConfirmTimeout(seconds) {
	if (!Number.isInteger(seconds)) throw {
		code: "INVALID_ARGUMENT",
		message: "seconds must be an integer"
	};
	requireInRange(seconds, "seconds", 5, 120);
}
//#endregion
//#region src/capabilities/session/index.ts
var SessionCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	async connect(deviceId, options) {
		validateDeviceId(deviceId);
		if (options) validateConnectOptions(options);
		this.ctx.log("info", "connection", "connect.start", "Connecting device", {
			deviceId,
			data: options
		});
		return this.ctx.invoke({
			invoke: () => this.ctx.native.connect(deviceId, options),
			errorCode: "CONNECTION_FAILED",
			errorDeviceId: deviceId,
			afterSuccess: () => {
				this.ctx.setConnectedDeviceId(deviceId);
				this.ctx.log("info", "connection", "connect.success", "Device connect request completed", { deviceId });
			}
		});
	}
	async disconnect(deviceId) {
		const id = deviceId || this.ctx.connectedDeviceId();
		if (!id) return;
		this.ctx.log("info", "connection", "disconnect.start", "Disconnecting device", { deviceId: id });
		return this.ctx.invoke({
			invoke: () => this.ctx.native.disconnect(id),
			errorCode: "DISCONNECTION_FAILED",
			errorDeviceId: id,
			afterSuccess: () => {
				if (this.ctx.connectedDeviceId() === id) this.ctx.setConnectedDeviceId(null);
				this.ctx.log("info", "connection", "disconnect.success", "Device disconnected", { deviceId: id });
			}
		});
	}
	/**
	* [RESTORATION] Whether iOS armed CoreBluetooth state restoration, and whether
	* this launch was one iOS started to resume BLE work. Never throws — a failure
	* to read it must not block session start, so it degrades to "unsupported".
	*/
	async getRestorationState() {
		return this.ctx.invokeWithRecovery({
			invoke: () => this.ctx.native.getRestorationState(),
			errorCode: "UNKNOWN",
			recoverWith: {
				supported: false,
				restoration_launch: false,
				armed: false
			}
		});
	}
	async getConnectionStatus(deviceId) {
		const id = deviceId || this.ctx.connectedDeviceId();
		if (!id) return "disconnected";
		return this.ctx.invokeWithRecovery({
			invoke: () => this.ctx.native.getConnectionStatus(id),
			errorCode: "UNKNOWN",
			errorDeviceId: id,
			recoverWith: "disconnected",
			afterSuccess: (status) => {
				this.ctx.log("debug", "connection", "connection.status", "Fetched connection status", {
					deviceId: id,
					data: { status }
				});
			}
		});
	}
	async verifyPassword(password = "0000", is24Hour = false) {
		this.ctx.log("info", "connection", "password.verify.start", "Verifying device password", { data: { is24Hour } });
		return this.ctx.invoke({
			invoke: () => this.ctx.native.verifyPassword(password, is24Hour),
			normalize: normalizePasswordData,
			afterSuccess: (result) => {
				this.ctx.log("info", "connection", "password.verify.result", "Device password verified", { data: {
					status: result.status,
					device_number: result.device_number,
					device_version: result.device_version
				} });
			}
		});
	}
	renameDevice(name) {
		return this.ctx.invoke({
			validate: () => validateDeviceName(name),
			invoke: () => this.ctx.native.renameDevice(name)
		});
	}
	isConnectionConfirmEnabled() {
		return this.ctx.invoke({ invoke: () => this.ctx.native.isConnectionConfirmEnabled() });
	}
	setConnectionConfirmEnabled(enabled) {
		return this.ctx.invoke({ invoke: () => this.ctx.native.setConnectionConfirmEnabled(enabled) });
	}
	setConnectionConfirmTimeout(seconds) {
		return this.ctx.invoke({
			validate: () => validateConnectionConfirmTimeout(seconds),
			invoke: () => this.ctx.native.setConnectionConfirmTimeout(seconds)
		});
	}
};
//#endregion
//#region src/capabilities/sleep-data/index.ts
var SleepDataCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	readSleepData(date) {
		return this.ctx.invoke({
			invoke: () => this.ctx.native.readSleepData(date),
			normalize: normalizeSleepDataList,
			afterSuccess: (result) => {
				this.ctx.log("debug", "read", "read.sleep.result", "Sleep data received", { data: {
					date,
					count: result.length
				} });
			}
		});
	}
};
//#endregion
//#region src/capabilities/sport-mode/normalizers.ts
function normalizeSportModeStatus(value) {
	const record = isRecord(value) ? value : {};
	const rawMode = record.mode ?? record.sportMode ?? record.sport_mode;
	let mode = null;
	let is_active = false;
	if (typeof rawMode === "number") if (rawMode === 0) {
		mode = null;
		is_active = false;
	} else {
		const name = SPORT_MODE_ORDINALS[rawMode];
		if (name && name !== "common") {
			mode = name;
			is_active = true;
		}
	}
	else if (typeof rawMode === "string") if (rawMode === "common" || rawMode === "") {
		mode = null;
		is_active = false;
	} else {
		mode = rawMode;
		is_active = true;
	}
	const rawIsActive = record.isActive ?? record.is_active;
	if (rawIsActive !== void 0) is_active = toBoolean(rawIsActive, is_active);
	return {
		mode,
		is_active
	};
}
//#endregion
//#region src/capabilities/sport-mode/validators.ts
function validateSportMode(mode) {
	if ((typeof mode === "string" ? SPORT_MODE_ORDINALS.indexOf(mode) : -1) <= 0) throw {
		code: "INVALID_ARGUMENT",
		message: `mode must be a valid SportMode (not 'common' or unknown value)`
	};
}
//#endregion
//#region src/capabilities/sport-mode/index.ts
var SportModeCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	readSportMode() {
		return this.ctx.invoke({
			invoke: () => this.ctx.native.readSportMode(),
			normalize: normalizeSportModeStatus,
			afterSuccess: (result) => this.ctx.emitDeviceEvent("sport_mode_data", { mode: result.mode })
		});
	}
	setSportMode(mode) {
		return this.ctx.invoke({
			validate: () => validateSportMode(mode),
			invoke: () => {
				const ordinal = SPORT_MODE_ORDINALS.indexOf(mode);
				return this.ctx.native.setSportMode(ordinal);
			}
		});
	}
	stopSportMode() {
		return this.ctx.invoke({ invoke: () => this.ctx.native.stopSportMode() });
	}
};
//#endregion
//#region src/capabilities/watch-face.ts
function normalizeWatchFaceStyle(value) {
	const record = isRecord(value) ? value : {};
	const raw = String(toStringValue(record.dialType ?? record.dial_type, "default")).toLowerCase();
	const dial_type = raw === "market" || raw === "photo" ? raw : "default";
	const op = record.operationSuccess ?? record.operation_success;
	return {
		dial_type,
		screen_index: toInt(record.screenIndex ?? record.screen_index),
		...typeof op === "boolean" ? { operation_success: op } : {}
	};
}
const WATCH_FACE_DIAL_TYPES = new Set([
	"default",
	"market",
	"photo"
]);
function requireWatchFaceDialType(value, field) {
	if (typeof value !== "string" || !WATCH_FACE_DIAL_TYPES.has(value)) throw {
		code: "INVALID_ARGUMENT",
		message: `${field} must be 'default', 'market', or 'photo'`
	};
}
/** Optional filter for read; native may still return a unified snapshot (Android). */
function validateReadWatchFaceStyleOptions(options) {
	if (options?.dial_type !== void 0) requireWatchFaceDialType(options.dial_type, "dialType");
}
/** Vendor slot index; cap loosely — some Bands expose large enumerations. */
function validateWatchFaceStyleSettings(s) {
	requireInRange(s.screen_index, "screenIndex", 0, 65535);
	if (s.dial_type !== void 0) requireWatchFaceDialType(s.dial_type, "dialType");
}
var WatchFaceCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	readWatchFaceStyle(options) {
		return this.ctx.invoke({
			validate: () => validateReadWatchFaceStyleOptions(options),
			invoke: () => this.ctx.native.readWatchFaceStyle(options?.dial_type != null ? { dialType: options.dial_type } : null),
			normalize: normalizeWatchFaceStyle
		});
	}
	setWatchFaceStyle(settings) {
		return this.ctx.invoke({
			validate: () => validateWatchFaceStyleSettings(settings),
			invoke: () => this.ctx.native.setWatchFaceStyle(deepCamelKeys({
				screen_index: settings.screen_index,
				dial_type: settings.dial_type ?? "default"
			}))
		});
	}
};
//#endregion
//#region src/capabilities/weather/normalizers.ts
/** Normalizes native `WeatherStatusData` / `VPWeatherConfigModel` read result. */
function normalizeWeatherSettings(value) {
	const record = isRecord(value) ? value : {};
	const unit = toStringValue(record.unit, "C").toUpperCase() === "F" ? "F" : "C";
	return {
		is_open: toBoolean(record.isOpen ?? record.is_open),
		unit,
		crc: toInt(record.crc)
	};
}
//#endregion
//#region src/capabilities/weather/validators.ts
const DATETIME_RE = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
function requireDatetime(value, field) {
	if (!DATETIME_RE.test(value)) throw {
		code: "INVALID_ARGUMENT",
		message: `${field} must be "YYYY-MM-DD HH:mm"`
	};
}
function requireDate(value, field) {
	if (!DATE_RE.test(value)) throw {
		code: "INVALID_ARGUMENT",
		message: `${field} must be "YYYY-MM-DD"`
	};
}
function validateHourlyForecast(h, i) {
	requireDatetime(h.time, `hourly[${i}].time`);
	requireInRange(h.weather_state, `hourly[${i}].weatherState`, 0, 155);
	requireInRange(h.uv_index, `hourly[${i}].uvIndex`, 0, 20);
	if (h.visibility_m < 0) throw {
		code: "INVALID_ARGUMENT",
		message: `hourly[${i}].visibilityM must be >= 0`
	};
}
function validateDailyForecast(d, i) {
	requireDate(d.date, `daily[${i}].date`);
	requireInRange(d.weather_state_day, `daily[${i}].weatherStateDay`, 0, 155);
	requireInRange(d.weather_state_night, `daily[${i}].weatherStateNight`, 0, 155);
	if (d.uv_index !== void 0) requireInRange(d.uv_index, `daily[${i}].uvIndex`, 0, 20);
	if (d.visibility_m !== void 0 && d.visibility_m < 0) throw {
		code: "INVALID_ARGUMENT",
		message: `daily[${i}].visibilityM must be >= 0`
	};
}
function validateWeatherSettings(s) {
	if (s.unit !== "C" && s.unit !== "F") throw {
		code: "INVALID_ARGUMENT",
		message: "unit must be \"C\" or \"F\""
	};
	if (!Number.isInteger(s.crc) || s.crc < 0) throw {
		code: "INVALID_ARGUMENT",
		message: "crc must be a non-negative integer"
	};
}
function validateWeatherData(d) {
	if (!d.city_name || d.city_name.trim().length === 0) throw {
		code: "INVALID_ARGUMENT",
		message: "cityName is required"
	};
	if (new TextEncoder().encode(d.city_name).byteLength > 64) throw {
		code: "INVALID_ARGUMENT",
		message: "cityName exceeds 64 bytes"
	};
	if (!Number.isInteger(d.crc) || d.crc < 0) throw {
		code: "INVALID_ARGUMENT",
		message: "crc must be a non-negative integer"
	};
	if (!Array.isArray(d.hourly) || d.hourly.length === 0) throw {
		code: "INVALID_ARGUMENT",
		message: "hourly must be a non-empty array"
	};
	if (!Array.isArray(d.daily) || d.daily.length === 0) throw {
		code: "INVALID_ARGUMENT",
		message: "daily must be a non-empty array"
	};
	d.hourly.forEach((h, i) => validateHourlyForecast(h, i));
	d.daily.forEach((day, i) => validateDailyForecast(day, i));
}
//#endregion
//#region src/capabilities/weather/index.ts
var WeatherCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	readWeatherSettings() {
		return this.ctx.invoke({
			invoke: () => this.ctx.native.readWeatherSettings(),
			normalize: normalizeWeatherSettings
		});
	}
	setWeatherSettings(settings) {
		return this.ctx.invoke({
			validate: () => validateWeatherSettings(settings),
			invoke: () => this.ctx.native.setWeatherSettings(deepCamelKeys(settings))
		});
	}
	pushWeatherData(data) {
		return this.ctx.invoke({
			validate: () => validateWeatherData(data),
			invoke: () => this.ctx.native.pushWeatherData(deepCamelKeys(data))
		});
	}
};
//#endregion
//#region src/capabilities/women-health/normalizers.ts
const WH_STATUSES = [
	"none",
	"menstrual",
	"pregnancy_prep",
	"pregnancy",
	"postpartum"
];
function normalizeWomenHealthStatus(raw) {
	const k = String(raw ?? "none").trim().toLowerCase();
	return {
		menes: "menstrual",
		preready: "pregnancy_prep",
		preing: "pregnancy",
		gestation: "pregnancy",
		mamami: "postpartum",
		baoma: "postpartum",
		mommy: "postpartum"
	}[k] ?? (WH_STATUSES.includes(k) ? k : null) ?? "none";
}
function normalizeWomenHealthSettings(value) {
	const record = isRecord(value) ? value : {};
	const out = { status: normalizeWomenHealthStatus(record.status) };
	const mld = record.menstrualLengthDays ?? record.menstrual_length_days;
	if (mld !== void 0 && mld !== null) out.menstrual_length_days = toInt(mld);
	const mcd = record.menstrualCycleDays ?? record.menstrual_cycle_days;
	if (mcd !== void 0 && mcd !== null) out.menstrual_cycle_days = toInt(mcd);
	const lmd = toStringValue(record.lastMenstrualDate ?? record.last_menstrual_date, "");
	if (lmd !== "") out.last_menstrual_date = lmd;
	const edd = toStringValue(record.expectedDeliveryDate ?? record.expected_delivery_date, "");
	if (edd !== "") out.expected_delivery_date = edd;
	const bb = toStringValue(record.babyBirthday ?? record.baby_birthday, "");
	if (bb !== "") out.baby_birthday = bb;
	const sexRaw = toStringValue(record.babySex ?? record.baby_sex, "").toLowerCase();
	if (sexRaw === "male" || sexRaw === "man") out.baby_sex = "male";
	else if (sexRaw === "female" || sexRaw === "woman") out.baby_sex = "female";
	const cmd = record.currentMenstrualDays ?? record.current_menstrual_days;
	if (cmd !== void 0 && cmd !== null) out.current_menstrual_days = toInt(cmd);
	const op = toStringValue(record.operationStatus ?? record.operation_status, "");
	if (op !== "") out.operation_status = op;
	return out;
}
//#endregion
//#region src/capabilities/women-health/validators.ts
const YMD = /^\d{4}-\d{2}-\d{2}$/;
const VALID_WOMEN_HEALTH_STATUS = new Set([
	"none",
	"menstrual",
	"pregnancy_prep",
	"pregnancy",
	"postpartum"
]);
function requireYmd(value, field) {
	if (value === void 0 || value === "") throw {
		code: "INVALID_ARGUMENT",
		message: `${field} is required`
	};
	if (!YMD.test(value)) throw {
		code: "INVALID_ARGUMENT",
		message: `${field} must be yyyy-MM-dd`
	};
}
/** Validates payload for `setWomenHealthSettings` (native `WomenSetting` / `VPDeviceFemaleModel`). */
function validateWomenHealthSettings(s) {
	if (!VALID_WOMEN_HEALTH_STATUS.has(s.status)) throw {
		code: "INVALID_ARGUMENT",
		message: "status must be a valid WomenHealthStatus"
	};
	if (s.menstrual_length_days !== void 0) requireInRange(s.menstrual_length_days, "menstrualLengthDays", 4, 28);
	if (s.menstrual_cycle_days !== void 0) requireInRange(s.menstrual_cycle_days, "menstrualCycleDays", 15, 50);
	if (s.last_menstrual_date !== void 0 && s.last_menstrual_date !== "" && !YMD.test(s.last_menstrual_date)) throw {
		code: "INVALID_ARGUMENT",
		message: "lastMenstrualDate must be yyyy-MM-dd"
	};
	if (s.expected_delivery_date !== void 0 && s.expected_delivery_date !== "" && !YMD.test(s.expected_delivery_date)) throw {
		code: "INVALID_ARGUMENT",
		message: "expectedDeliveryDate must be yyyy-MM-dd"
	};
	if (s.baby_birthday !== void 0 && s.baby_birthday !== "" && !YMD.test(s.baby_birthday)) throw {
		code: "INVALID_ARGUMENT",
		message: "babyBirthday must be yyyy-MM-dd"
	};
	if (s.baby_sex !== void 0) {
		if (!["female", "male"].includes(s.baby_sex)) throw {
			code: "INVALID_ARGUMENT",
			message: "babySex must be female or male"
		};
	}
	switch (s.status) {
		case "menstrual":
		case "pregnancy_prep":
			requireYmd(s.last_menstrual_date, "lastMenstrualDate");
			if (s.menstrual_length_days === void 0) throw {
				code: "INVALID_ARGUMENT",
				message: "menstrualLengthDays is required for this status"
			};
			if (s.menstrual_cycle_days === void 0) throw {
				code: "INVALID_ARGUMENT",
				message: "menstrualCycleDays is required for this status"
			};
			break;
		case "pregnancy":
			requireYmd(s.last_menstrual_date, "lastMenstrualDate");
			requireYmd(s.expected_delivery_date, "expectedDeliveryDate");
			break;
		case "postpartum":
			requireYmd(s.last_menstrual_date, "lastMenstrualDate");
			requireYmd(s.baby_birthday, "babyBirthday");
			if (s.menstrual_length_days === void 0) throw {
				code: "INVALID_ARGUMENT",
				message: "menstrualLengthDays is required for postpartum"
			};
			if (s.menstrual_cycle_days === void 0) throw {
				code: "INVALID_ARGUMENT",
				message: "menstrualCycleDays is required for postpartum"
			};
			if (s.baby_sex === void 0) throw {
				code: "INVALID_ARGUMENT",
				message: "babySex is required for postpartum"
			};
			break;
		default: break;
	}
}
//#endregion
//#region src/capabilities/women-health/index.ts
var WomenHealthCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	readWomenHealthSettings() {
		return this.ctx.invoke({
			invoke: () => this.ctx.native.readWomenHealthSettings(),
			normalize: normalizeWomenHealthSettings
		});
	}
	setWomenHealthSettings(settings) {
		return this.ctx.invoke({
			validate: () => validateWomenHealthSettings(settings),
			invoke: () => this.ctx.native.setWomenHealthSettings(deepCamelKeys(settings))
		});
	}
};
//#endregion
//#region src/capabilities/world-clock.ts
function normalizeWorldClockEntry(item) {
	const entry = {
		timezone_offset_minutes: toInt(item.timezone_offset_minutes ?? item.timezoneOffsetMinutes, 0),
		city_name: typeof item.city_name === "string" ? item.city_name : typeof item.cityName === "string" ? item.cityName : ""
	};
	const dstRaw = item.dst_offset ?? item.dstOffset;
	if (dstRaw !== void 0 && dstRaw !== null) entry.dst_offset = toInt(dstRaw);
	return entry;
}
function normalizeWorldClockList(value) {
	if (!Array.isArray(value)) return [];
	const entries = [];
	for (const item of value) if (isRecord(item)) entries.push(normalizeWorldClockEntry(item));
	return entries;
}
function validateWorldClockList(clocks) {
	if (clocks.length > 4) throw {
		code: "INVALID_ARGUMENT",
		message: "Maximum 4 world clock entries allowed"
	};
	for (const clock of clocks) {
		requireInRange(clock.timezone_offset_minutes, "timezone_offset_minutes", -720, 840);
		requireNonEmptyString(clock.city_name, "city_name");
	}
}
var WorldClockCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	readWorldClock() {
		return this.ctx.invoke({
			invoke: () => this.ctx.native.readWorldClock(),
			normalize: normalizeWorldClockList
		});
	}
	setWorldClock(clocks) {
		return this.ctx.invoke({
			validate: () => validateWorldClockList(clocks),
			invoke: () => this.ctx.native.setWorldClock(clocks.map((c) => deepCamelKeys(c)))
		});
	}
};
//#endregion
//#region src/capabilities/wrist-flip.ts
function normalizeWristFlipWakeSettings(value) {
	const record = isRecord(value) ? value : {};
	const base = {
		enabled: toBoolean(record.enabled, false),
		start_hour: toInt(record.startHour ?? record.start_hour),
		start_minute: toInt(record.startMinute ?? record.start_minute),
		end_hour: toInt(record.endHour ?? record.end_hour),
		end_minute: toInt(record.endMinute ?? record.end_minute),
		sensitivity_level: toInt(record.sensitivityLevel ?? record.sensitivity_level, 5)
	};
	const sctw = record.supportsCustomTimeWindow ?? record.supports_custom_time_window;
	if (sctw !== void 0 && sctw !== null) base.supports_custom_time_window = toBoolean(sctw, false);
	const dsl = record.defaultSensitivityLevel ?? record.default_sensitivity_level;
	if (dsl !== void 0 && dsl !== null) base.default_sensitivity_level = toInt(dsl);
	return base;
}
function validateWristFlipWakeSettings(s) {
	requireValidHour(s.start_hour, "startHour");
	requireValidMinute(s.start_minute, "startMinute");
	requireValidHour(s.end_hour, "endHour");
	requireValidMinute(s.end_minute, "endMinute");
	requireInRange(s.sensitivity_level, "sensitivityLevel", 1, 10);
}
var WristFlipCapability = class {
	constructor(ctx) {
		this.ctx = ctx;
	}
	readWristFlipWakeSettings() {
		return this.ctx.invoke({
			invoke: () => this.ctx.native.readWristFlipWakeSettings(),
			normalize: normalizeWristFlipWakeSettings
		});
	}
	setWristFlipWakeSettings(settings) {
		return this.ctx.invoke({
			validate: () => validateWristFlipWakeSettings(settings),
			invoke: () => this.ctx.native.setWristFlipWakeSettings(deepCamelKeys(settings))
		});
	}
};
//#endregion
//#region src/sdk/capability-registry.ts
/**
* Single source of truth for the capabilities the facade exposes. The
* `VeepooSDK` constructor iterates this map to assign one instance per key.
* The class declares matching `readonly` properties so `sdk.battery` resolves
* to `BatteryCapability` in one IDE hop (per ADR-0005's "interface by
* construction" — see ADR 0010 for the rationale on this light split).
*/
const CAPABILITIES = {
	alarms: AlarmsCapability,
	autoMeasure: AutoMeasureCapability,
	battery: BatteryCapability,
	btStatus: BtStatusCapability,
	calibration: CalibrationCapability,
	camera: CameraCapability,
	contacts: ContactsCapability,
	daySummary: DaySummaryCapability,
	deviceFunctions: DeviceFunctionsCapability,
	deviceSwitches: DeviceSwitchesCapability,
	deviceTime: DeviceTimeCapability,
	deviceVersion: DeviceVersionCapability,
	dfu: DfuCapability,
	discovery: BandDiscoveryCapability,
	findDevice: FindDeviceCapability,
	gpsTimezone: GpsTimezoneCapability,
	historicalQuery: HistoricalQueryCapability,
	language: LanguageCapability,
	music: MusicCapability,
	originData: OriginDataCapability,
	personalInfo: PersonalInfoCapability,
	realtimeTests: RealtimeTestsCapability,
	screenLight: ScreenLightCapability,
	sedentaryReminder: SedentaryReminderCapability,
	session: SessionCapability,
	sleepData: SleepDataCapability,
	socialMsg: SocialMsgCapability,
	sos: SosCapability,
	sportMode: SportModeCapability,
	sportSteps: SportStepsCapability,
	watchFace: WatchFaceCapability,
	weather: WeatherCapability,
	womenHealth: WomenHealthCapability,
	worldClock: WorldClockCapability,
	wristFlip: WristFlipCapability
};
//#endregion
//#region src/veepoo-sdk.ts
/**
* The capability properties (`sdk.battery`, `sdk.session`, …) are assigned by
* looping over `CAPABILITIES` in the constructor — see ADR 0010. The
* `readonly` declarations below stay hand-typed so `sdk.battery` resolves to
* `BatteryCapability` in one IDE hop. The constructor uses non-null assertion
* (`!`) on each declaration because the assignment happens in the loop, not
* inline.
*/
var VeepooSDK = class {
	constructor(native = NativeModule) {
		this.rt = new VeepooSDKRuntime(native);
		const ctx = this.rt.createCapabilityContext();
		for (const [key, Ctor] of Object.entries(CAPABILITIES)) this[key] = new Ctor(ctx);
	}
	init() {
		return this.rt.init();
	}
	destroy() {
		this.rt.destroy();
	}
	setLogEnabled(enabled) {
		this.rt.setLogEnabled(enabled);
		return this;
	}
	isLogEnabled() {
		return this.rt.isLogEnabled();
	}
	setLogger(logger) {
		this.rt.setLogger(logger);
		return this;
	}
	isScanningActive() {
		return this.rt.state.isScanning;
	}
	isSDKInitialized() {
		return this.rt.state.isInitialized;
	}
	getConnectedDeviceId() {
		return this.rt.state.connectedDeviceId;
	}
	on(event, listener) {
		this.rt.on(event, listener);
		return this;
	}
	off(event, listener) {
		this.rt.off(event, listener);
		return this;
	}
	once(event, listener) {
		this.rt.once(event, listener);
		return this;
	}
	removeAllListeners(event) {
		this.rt.removeAllListeners(event);
		return this;
	}
};
//#endregion
//#region src/react/sdk-state-store.ts
/**
* Observable bridge between the SDK's event bus and React's `useSyncExternalStore`.
* Has no React dependency — can be unit-tested in plain Node.
*/
var VeepooSDKStateStore = class {
	constructor(sdk) {
		this.listeners = /* @__PURE__ */ new Set();
		this.cleanups = [];
		this.subscribe = (listener) => {
			this.listeners.add(listener);
			return () => this.listeners.delete(listener);
		};
		this.getSnapshot = () => this.snapshot;
		this.snapshot = {
			initialized: sdk.isSDKInitialized(),
			isConnected: sdk.getConnectedDeviceId() !== null,
			isReady: sdk.getConnectedDeviceId() !== null,
			isScanning: sdk.isScanningActive(),
			connectedDeviceId: sdk.getConnectedDeviceId()
		};
		const on = (event, handler) => {
			sdk.on(event, handler);
			this.cleanups.push(() => sdk.off(event, handler));
		};
		on("sdk_initialized", () => {
			this.update({ initialized: true });
		});
		on("device_connected", ({ device_id }) => {
			this.update({
				isConnected: true,
				connectedDeviceId: device_id
			});
		});
		on("device_ready", ({ device_id }) => {
			this.update({
				isReady: true,
				connectedDeviceId: device_id
			});
		});
		on("device_disconnected", () => {
			this.update({
				isConnected: false,
				isReady: false,
				connectedDeviceId: null
			});
		});
		on("scan_started", () => {
			this.update({ isScanning: true });
		});
		on("scan_stopped", () => {
			this.update({ isScanning: false });
		});
		on("bluetooth_state_changed", ({ is_scanning }) => {
			if (this.snapshot.isScanning !== is_scanning) this.update({ isScanning: is_scanning });
		});
	}
	update(patch) {
		this.snapshot = {
			...this.snapshot,
			...patch
		};
		this.listeners.forEach((l) => l());
	}
	destroy() {
		this.cleanups.forEach((c) => c());
		this.cleanups.length = 0;
		this.listeners.clear();
	}
};
//#endregion
//#region src/react/veepoo-sdk-context.ts
const VeepooSDKContext = (0, react.createContext)(null);
//#endregion
//#region src/react/veepoo-sdk-provider.tsx
function applyLoggingConfig(sdk, config) {
	if (config.logEnabled !== void 0) sdk.setLogEnabled(config.logEnabled);
	if (config.logger !== void 0) sdk.setLogger(config.logger);
}
function VeepooSDKProvider({ children, logEnabled, logger }) {
	const [sdk] = (0, react.useState)(() => new VeepooSDK());
	const [store] = (0, react.useState)(() => new VeepooSDKStateStore(sdk));
	const [error, setError] = (0, react.useState)(null);
	(0, react.useLayoutEffect)(() => {
		applyLoggingConfig(sdk, {
			logEnabled,
			logger
		});
	}, [
		sdk,
		logEnabled,
		logger
	]);
	(0, react.useEffect)(() => {
		sdk.init().catch((e) => setError(e));
		return () => {
			store.destroy();
			sdk.destroy();
		};
	}, [sdk, store]);
	const value = (0, react.useMemo)(() => ({
		sdk,
		store,
		error
	}), [
		sdk,
		store,
		error
	]);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(VeepooSDKContext.Provider, {
		value,
		children
	});
}
//#endregion
//#region src/react/useVeepooSDK.ts
function useVeepooSDK() {
	const ctx = (0, react.useContext)(VeepooSDKContext);
	if (ctx === null) throw new Error("useVeepooSDK must be called inside <VeepooSDKProvider>. Wrap your app (or the relevant subtree) with <VeepooSDKProvider>.");
	const status = (0, react.useSyncExternalStore)(ctx.store.subscribe, ctx.store.getSnapshot);
	return {
		sdk: ctx.sdk,
		status,
		error: ctx.error
	};
}
//#endregion
//#region src/react/useSDKState.ts
function useSDKState(selector) {
	const ctx = (0, react.useContext)(VeepooSDKContext);
	if (ctx === null) throw new Error("useSDKState must be called inside <VeepooSDKProvider>. Wrap your app (or the relevant subtree) with <VeepooSDKProvider>.");
	return (0, react.useSyncExternalStore)(ctx.store.subscribe, () => selector(ctx.store.getSnapshot()));
}
//#endregion
//#region src/session/session-baseline.ts
/**
* Run the documented Session baseline once.
*
* Call this from your own `deviceReady` handler, or use
* {@link attachSessionBaseline} to wire it automatically.
*
* All three operations run in parallel via `Promise.allSettled`:
* 1. `syncPersonalInfo(config.personalInfo)`
* 2. `readBattery()`
* 3. `readDeviceVersion()`
*
* Individual failures are captured in `result.errors`; they do not
* reject the returned promise.
*/
async function runSessionBaseline(deps, config) {
	const [syncResult, batteryResult, versionResult] = await Promise.allSettled([
		deps.personalInfo.syncPersonalInfo(config.personalInfo),
		deps.battery.readBattery(),
		deps.deviceVersion.readDeviceVersion()
	]);
	const errors = {};
	if (syncResult.status === "rejected") errors.syncPersonalInfo = syncResult.reason;
	if (batteryResult.status === "rejected") errors.readBattery = batteryResult.reason;
	if (versionResult.status === "rejected") errors.readDeviceVersion = versionResult.reason;
	return {
		personalInfoSynced: syncResult.status === "fulfilled",
		battery: batteryResult.status === "fulfilled" ? batteryResult.value : null,
		deviceVersion: versionResult.status === "fulfilled" ? versionResult.value : null,
		errors
	};
}
/**
* Subscribe to `deviceReady` and run the Session baseline automatically.
*
* Returns a handle whose `destroy()` removes the listener.
*
* ```ts
* import { attachSessionBaseline } from 'expo-veepoo-sdk/session';
*
* const handle = attachSessionBaseline(sdk, {
*   personalInfo: { sex: 1, height: 175, weight: 70, age: 30, stepAim: 8000, sleepAim: 480 },
*   onResult: (r) => console.log('baseline done', r),
* });
*
* // later, on unmount:
* handle.destroy();
* ```
*
* **Does not** implement reconnection, retry loops, or stored `deviceId`
* policy; the host app owns those flows.
*/
function attachSessionBaseline(source, config) {
	let destroyed = false;
	const listener = () => {
		if (destroyed) return;
		runSessionBaseline(source, config).then((result) => {
			if (!destroyed) config.onResult?.(result);
		});
	};
	source.on("device_ready", listener);
	return { destroy() {
		if (destroyed) return;
		destroyed = true;
		source.off("device_ready", listener);
	} };
}
//#endregion
exports.RealtimeTest = RealtimeTest;
exports.VeepooSDK = VeepooSDK;
exports.VeepooSDKProvider = VeepooSDKProvider;
exports.attachSessionBaseline = attachSessionBaseline;
exports.isVeepooErrorShape = isVeepooErrorShape;
exports.mapNativeRejection = mapNativeRejection;
exports.runSessionBaseline = runSessionBaseline;
exports.useSDKState = useSDKState;
exports.useVeepooSDK = useVeepooSDK;

//# sourceMappingURL=index.cjs.map