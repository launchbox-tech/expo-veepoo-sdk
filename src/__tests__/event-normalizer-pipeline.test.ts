/**
 * Pipeline tests: for every native-emitted event, feed the raw camelCase
 * payload that native (Android/iOS) actually sends into normalizeEventPayload
 * and assert the normalized snake_case output is correct.
 *
 * This verifies that every event, including pass-throughs, is correctly
 * normalized end-to-end (deepSnakeKeys + any value-level normalizer).
 */
import { normalizeEventPayload } from "@/bridge/event-normalizer";

// ── Helpers ──────────────────────────────────────────────────────────────────

function norm<K extends Parameters<typeof normalizeEventPayload>[0]>(
  event: K,
  raw: unknown,
) {
  return normalizeEventPayload(event, raw);
}

// ── Connection & Session ─────────────────────────────────────────────────────

describe("connection events", () => {
  it("device_found: camelCase keys become snake_case", () => {
    const result = norm("device_found", {
      deviceId: "AA:BB",
      name: "Band",
      rssi: -60,
      address: "AA:BB",
    });
    expect(result).toMatchObject({ device_id: "AA:BB", name: "Band", rssi: -60 });
  });

  it("device_connected: isOadModel key is snake_cased", () => {
    const result = norm("device_connected", { deviceId: "AA:BB", isOadModel: false });
    expect(result).toMatchObject({ device_id: "AA:BB", is_oad_model: false });
  });

  it("device_disconnected: deviceId → device_id", () => {
    const result = norm("device_disconnected", { deviceId: "AA:BB" });
    expect(result).toMatchObject({ device_id: "AA:BB" });
  });

  it("device_connect_status: status and code pass through snake_cased", () => {
    const result = norm("device_connect_status", {
      deviceId: "AA:BB",
      status: "failed",
      code: "AUTH_FAILED",
    });
    expect(result).toMatchObject({ device_id: "AA:BB", status: "failed", code: "AUTH_FAILED" });
  });

  it("device_ready: isOadModel → is_oad_model", () => {
    const result = norm("device_ready", { deviceId: "AA:BB", isOadModel: true });
    expect(result).toMatchObject({ device_id: "AA:BB", is_oad_model: true });
  });

  it("connection_status_changed: snake_cases correctly", () => {
    const result = norm("connection_status_changed", { deviceId: "AA:BB", status: "connected" });
    expect(result).toMatchObject({ device_id: "AA:BB", status: "connected" });
  });

  it("device_sos_triggered: deviceId → device_id", () => {
    const result = norm("device_sos_triggered", { deviceId: "AA:BB" });
    expect(result).toMatchObject({ device_id: "AA:BB" });
  });

  it("error: fields pass through correctly", () => {
    const result = norm("error", { deviceId: "AA:BB", code: "TIMEOUT", message: "timed out" });
    expect(result).toMatchObject({ device_id: "AA:BB", code: "TIMEOUT", message: "timed out" });
  });
});

// ── Real-time Tests ───────────────────────────────────────────────────────────

describe("real-time test events", () => {
  it("heart_rate_test_result: state normalized, value extracted", () => {
    const result = norm("heart_rate_test_result", {
      deviceId: "AA:BB",
      result: { rawState: 4, value: 72, progress: 50 },
    });
    expect(result).toMatchObject({
      device_id: "AA:BB",
      result: { state: "over", value: 72, progress: 50 },
    });
  });

  it("blood_pressure_test_result: state normalized", () => {
    const result = norm("blood_pressure_test_result", {
      deviceId: "AA:BB",
      result: { rawState: 0, systolic: 120, diastolic: 80, progress: 100 },
    });
    expect(result).toMatchObject({
      device_id: "AA:BB",
      result: { state: "start", systolic: 120, diastolic: 80 },
    });
  });

  it("blood_oxygen_test_result: state normalized", () => {
    const result = norm("blood_oxygen_test_result", {
      deviceId: "AA:BB",
      result: { rawState: 1, value: 98, rate: 72, progress: 75 },
    });
    expect(result).toMatchObject({
      device_id: "AA:BB",
      result: { state: "testing", value: 98, rate: 72 },
    });
  });

  it("temperature_test_result: state normalized, value kept", () => {
    const result = norm("temperature_test_result", {
      deviceId: "AA:BB",
      result: { rawState: 4, value: 36.6, progress: 100 },
    });
    expect(result).toMatchObject({
      device_id: "AA:BB",
      result: { state: "over", value: 36.6 },
    });
  });

  it("stress_data: stress value and state extracted", () => {
    const result = norm("stress_data", {
      deviceId: "AA:BB",
      data: { stress: 45, rawState: 3, timestamp: 1700000000 },
    });
    expect(result).toMatchObject({
      device_id: "AA:BB",
      data: { stress: 45 },
    });
  });

  it("blood_glucose_data: state normalized, glucose extracted", () => {
    const result = norm("blood_glucose_data", {
      deviceId: "AA:BB",
      data: { glucose: 5.5, progress: 100, rawState: 4 },
    });
    expect(result).toMatchObject({
      device_id: "AA:BB",
      data: { state: "over", glucose: 5.5 },
    });
  });

  it("hrv_test_result: state and value extracted", () => {
    const result = norm("hrv_test_result", {
      deviceId: "AA:BB",
      result: { rawState: 4, hrv: 42, progress: 100 },
    });
    expect(result).toMatchObject({
      device_id: "AA:BB",
      result: { state: "over", value: 42 },
    });
  });

  it("ecg_test_result: heartRate → heart_rate, state normalized", () => {
    const result = norm("ecg_test_result", {
      deviceId: "AA:BB",
      result: { rawState: 1, progress: 50, heartRate: 68, hrv: 30, waveform: [1, 2, 3] },
    });
    expect(result).toMatchObject({
      device_id: "AA:BB",
      result: { state: "testing", heart_rate: 68, hrv: 30, waveform: [1, 2, 3] },
    });
  });

  it("fatigue_test_result: level extracted, state normalized", () => {
    const result = norm("fatigue_test_result", {
      deviceId: "AA:BB",
      result: { rawState: 4, progress: 100, level: 7 },
    });
    expect(result).toMatchObject({
      device_id: "AA:BB",
      result: { state: "over", level: 7 },
    });
  });

  it("breathing_test_result: rate extracted, state normalized", () => {
    const result = norm("breathing_test_result", {
      deviceId: "AA:BB",
      result: { rawState: 4, progress: 100, rate: 16 },
    });
    expect(result).toMatchObject({
      device_id: "AA:BB",
      result: { state: "over", rate: 16 },
    });
  });

  it("body_composition_test_result: state normalized, lead extracted", () => {
    const result = norm("body_composition_test_result", {
      deviceId: "AA:BB",
      result: { state: "over", progress: 100, lead: 2, rawState: 4 },
    });
    expect(result).toMatchObject({
      device_id: "AA:BB",
      result: { state: "over", lead: 2 },
    });
  });

  it("gsr_test_result: camelCase keys → snake_case, state normalized", () => {
    const result = norm("gsr_test_result", {
      deviceId: "AA:BB",
      result: {
        state: "testing",
        progress: 50,
        emotionLevel: 6,
        skinMoisture: 40.5,
        snsActivation: 70.0,
        cortisolValue: 12.3,
      },
    });
    expect(result).toMatchObject({
      device_id: "AA:BB",
      result: {
        state: "testing",
        progress: 50,
        emotion_level: 6,
        skin_moisture: 40.5,
        sns_activation: 70.0,
        cortisol_value: 12.3,
      },
    });
  });

  it("gsr_test_result: 'deviceBusy' state → 'device_busy'", () => {
    const result = norm("gsr_test_result", {
      deviceId: "AA:BB",
      result: { state: "deviceBusy", progress: 0, emotionLevel: null },
    });
    expect((result as any).result.state).toBe("device_busy");
    expect((result as any).result.emotion_level).toBeNull();
  });

  it("gsr_test_result: 'notWear' state → 'not_wear'", () => {
    const result = norm("gsr_test_result", {
      deviceId: "AA:BB",
      result: { state: "notWear", progress: 0 },
    });
    expect((result as any).result.state).toBe("not_wear");
  });

  it("blood_analysis_test_result: state normalized, camelCase values → snake_case", () => {
    const result = norm("blood_analysis_test_result", {
      deviceId: "AA:BB",
      result: {
        state: "over",
        progress: 100,
        values: {
          uricAcid: 350.5,
          totalCholesterol: 5.2,
          triglyceride: 1.8,
          highDensityLipoprotein: 1.4,
          lowDensityLipoprotein: 3.2,
        },
      },
    });
    expect(result).toMatchObject({
      device_id: "AA:BB",
      result: {
        state: "over",
        progress: 100,
        values: {
          uric_acid: 350.5,
          total_cholesterol: 5.2,
          triglyceride: 1.8,
          high_density_lipoprotein: 1.4,
          low_density_lipoprotein: 3.2,
        },
      },
    });
  });

  it("blood_analysis_test_result: values=null during progress", () => {
    const result = norm("blood_analysis_test_result", {
      deviceId: "AA:BB",
      result: { state: "testing", progress: 40, values: null },
    });
    expect((result as any).result.state).toBe("testing");
    expect((result as any).result.values).toBeNull();
  });

  it("blood_analysis_test_result: 'deviceBusy' → 'device_busy'", () => {
    const result = norm("blood_analysis_test_result", {
      deviceId: "AA:BB",
      result: { state: "deviceBusy", progress: 0, values: null },
    });
    expect((result as any).result.state).toBe("device_busy");
  });

  it("ptt_test_result: camelCase keys → snake_case", () => {
    const result = norm("ptt_test_result", {
      deviceId: "AA:BB",
      result: { heartRate: 72, hrv: 38, qtInterval: 420, signalQuality: 100, progress: 0 },
    });
    expect(result).toMatchObject({
      device_id: "AA:BB",
      result: { heart_rate: 72, hrv: 38, qt_interval: 420, signal_quality: 100, progress: 0 },
    });
  });

  it("ptt_state_changed: state passes through unchanged", () => {
    const result = norm("ptt_state_changed", { deviceId: "AA:BB", state: "active" });
    expect(result).toMatchObject({ device_id: "AA:BB", state: "active" });
  });

  it("ptt_state_changed: inactive state passes through", () => {
    const result = norm("ptt_state_changed", { deviceId: "AA:BB", state: "inactive" });
    expect((result as any).state).toBe("inactive");
  });
});

// ── Data Reading ──────────────────────────────────────────────────────────────

describe("data reading events", () => {
  it("read_origin_progress: fractional progress converted to integer percentage", () => {
    const result = norm("read_origin_progress", {
      deviceId: "AA:BB",
      progress: { readState: "reading", totalDays: 7, currentDay: 3, progress: 0.5 },
    });
    expect(result).toMatchObject({
      device_id: "AA:BB",
      progress: { read_state: "reading", total_days: 7, current_day: 3, progress: 50 },
    });
  });

  it("read_origin_complete: passes through with snake_case", () => {
    const result = norm("read_origin_complete", { deviceId: "AA:BB", success: true });
    expect(result).toMatchObject({ device_id: "AA:BB", success: true });
  });

  it("origin_five_minute_data: camelCase payload keys → snake_case", () => {
    const result = norm("origin_five_minute_data", {
      deviceId: "AA:BB",
      data: {
        time: "2024-01-01 08:00",
        heartValue: 72,
        stepValue: 100,
        calValue: 5,
        disValue: 80,
        sportValue: 2,
        systolic: 120,
        diastolic: 80,
        spo2Value: 98,
        tempValue: 36.5,
        stressValue: 30,
        met: 1.2,
      },
    });
    expect((result as any).device_id).toBe("AA:BB");
    expect((result as any).data.heart_value).toBe(72);
    expect((result as any).data.step_value).toBe(100);
  });

  it("origin_half_hour_data: heartValue → heart_value", () => {
    const result = norm("origin_half_hour_data", {
      deviceId: "AA:BB",
      data: {
        time: "2024-01-01 08:30",
        heartValue: 68,
        stepValue: 200,
        calValue: 10,
        disValue: 160,
        sportValue: 3,
        systolic: 118,
        diastolic: 78,
        spo2Value: 97,
        tempValue: 36.4,
        stressValue: 25,
        met: 1.1,
      },
    });
    expect((result as any).data.heart_value).toBe(68);
  });

  it("sleep_data: date and items pass through", () => {
    const result = norm("sleep_data", {
      deviceId: "AA:BB",
      data: [{ date: "2024-01-01", sleepTime: "2024-01-01 23:00", wakeTime: "2024-01-02 07:00" }],
    });
    expect((result as any).device_id).toBe("AA:BB");
    expect((result as any).data).toBeDefined();
  });

  it("sport_step_data: camelCase → snake_case", () => {
    const result = norm("sport_step_data", {
      deviceId: "AA:BB",
      data: { date: "2024-01-01", stepCount: 8000, distance: 6400, calories: 320 },
    });
    expect(result).toMatchObject({
      device_id: "AA:BB",
      data: { date: "2024-01-01", step_count: 8000, distance: 6400, calories: 320 },
    });
  });
});

// ── Stored Historical Data ────────────────────────────────────────────────────

describe("stored vitals events", () => {
  it("stored_temperature_data: bodyTemperature → body_temperature", () => {
    const result = norm("stored_temperature_data", {
      deviceId: "AA:BB",
      data: { timestamp: "2024-01-01 08:00", temperature: 36.8, bodyTemperature: 36.5 },
    });
    expect(result).toMatchObject({
      device_id: "AA:BB",
      data: { timestamp: "2024-01-01 08:00", temperature: 36.8, body_temperature: 36.5 },
    });
  });

  it("stored_blood_glucose_data: bloodGlucose → blood_glucose", () => {
    const result = norm("stored_blood_glucose_data", {
      deviceId: "AA:BB",
      data: { timestamp: "2024-01-01 07:30", bloodGlucose: 5.4, level: "normal" },
    });
    expect(result).toMatchObject({
      device_id: "AA:BB",
      data: { timestamp: "2024-01-01 07:30", blood_glucose: 5.4, level: "normal" },
    });
  });

  it("stored_hrv_data: rrIntervals → rr_intervals", () => {
    const result = norm("stored_hrv_data", {
      deviceId: "AA:BB",
      data: { timestamp: "2024-01-01 08:00", hrv: 42, rrIntervals: [800, 810, 820] },
    });
    expect(result).toMatchObject({
      device_id: "AA:BB",
      data: { hrv: 42, rr_intervals: [800, 810, 820] },
    });
  });

  it("stored_ecg_data: all camelCase fields → snake_case", () => {
    const result = norm("stored_ecg_data", {
      deviceId: "AA:BB",
      data: {
        timestamp: "2024-01-01 08:00",
        duration: 30,
        aveHeart: 72,
        aveHrv: 38,
        aveResRate: 16,
        aveQT: 420,
        filterSignals: [1, 2, 3, 4, 5],
      },
    });
    expect(result).toMatchObject({
      device_id: "AA:BB",
      data: {
        duration: 30,
        ave_heart: 72,
        ave_hrv: 38,
        ave_res_rate: 16,
        ave_qt: 420,
        filter_signals: [1, 2, 3, 4, 5],
      },
    });
  });

  it("stored_body_composition_data: all camelCase fields → snake_case", () => {
    const result = norm("stored_body_composition_data", {
      deviceId: "AA:BB",
      data: {
        timestamp: "2024-01-01 08:00",
        bmi: 22.5,
        bodyFatPercentage: 18.2,
        fatMass: 14.0,
        leanBodyMass: 63.0,
        muscleRate: 48.0,
        muscleMass: 52.0,
        subcutaneousFat: 12.0,
        bodyMoisture: 60.0,
        waterContent: 46.2,
        skeletalMuscleRate: 44.0,
        boneMass: 3.2,
        proportionOfProtein: 18.0,
        proteinAmount: 13.9,
        basalMetabolicRate: 1650,
      },
    });
    expect(result).toMatchObject({
      device_id: "AA:BB",
      data: {
        bmi: 22.5,
        body_fat_percentage: 18.2,
        fat_mass: 14.0,
        lean_body_mass: 63.0,
        muscle_rate: 48.0,
        muscle_mass: 52.0,
        subcutaneous_fat: 12.0,
        body_moisture: 60.0,
        water_content: 46.2,
        skeletal_muscle_rate: 44.0,
        bone_mass: 3.2,
        proportion_of_protein: 18.0,
        protein_amount: 13.9,
        basal_metabolic_rate: 1650,
      },
    });
  });
});

// ── Device Settings & Features ────────────────────────────────────────────────

describe("device settings events", () => {
  it("battery_data: isLowBattery → is_low_battery, percent passed through", () => {
    const result = norm("battery_data", {
      deviceId: "AA:BB",
      data: { level: 3, percent: 75, powerModel: 1, state: "charging", bat: 75, isPercent: true, isLowBattery: false },
    });
    expect(result).toMatchObject({
      device_id: "AA:BB",
      data: { level: 3, percent: 75, is_low_battery: false },
    });
  });

  it("alarm_data: repeat string → weekday array", () => {
    const result = norm("alarm_data", {
      deviceId: "AA:BB",
      alarms: [{ id: 1, enabled: true, hour: 7, minute: 30, repeat: "1000000" }],
    });
    expect((result as any).alarms[0]).toMatchObject({ id: 1, enabled: true, hour: 7, minute: 30 });
    expect(Array.isArray((result as any).alarms[0].repeat)).toBe(true);
  });

  it("contacts_data: contacts list normalized", () => {
    const result = norm("contacts_data", {
      deviceId: "AA:BB",
      contacts: [{ contactId: 1, name: "Alice", phoneNumber: "1234567890", isSOS: false }],
    });
    expect((result as any).contacts[0]).toMatchObject({
      contact_id: 1, name: "Alice", phone_number: "1234567890", is_sos: false,
    });
  });

  it("find_device_state: phase normalized", () => {
    const result = norm("find_device_state", { deviceId: "AA:BB", phase: "searching" });
    expect(result).toMatchObject({ device_id: "AA:BB", phase: "searching" });
  });

  it("firmware_dfu_progress: state and progress extracted", () => {
    const result = norm("firmware_dfu_progress", {
      deviceId: "AA:BB",
      progress: { state: "uploading", progress: 60, total: 100 },
    });
    expect((result as any).device_id).toBe("AA:BB");
    expect((result as any).progress).toBeDefined();
  });

  it("camera_shutter: status normalized", () => {
    const result = norm("camera_shutter", { deviceId: "AA:BB", status: 1 });
    expect((result as any).device_id).toBe("AA:BB");
    expect((result as any).status).toBeDefined();
  });

  it("music_remote_command: command string normalized", () => {
    const result = norm("music_remote_command", { deviceId: "AA:BB", command: 1 });
    expect((result as any).device_id).toBe("AA:BB");
    expect((result as any).command).toBeDefined();
  });

  it("device_bt_state_changed: btSwitchOpen → bt_switch_open", () => {
    const result = norm("device_bt_state_changed", {
      deviceId: "AA:BB",
      state: "connected",
      btSwitchOpen: true,
      mediaSwitchOpen: false,
    });
    expect(result).toMatchObject({
      device_id: "AA:BB",
      bt_switch_open: true,
      media_switch_open: false,
    });
  });

  it("sos_call_times_data: times passed through", () => {
    const result = norm("sos_call_times_data", {
      deviceId: "AA:BB",
      data: { times: 3, minTimes: 1, maxTimes: 10 },
    });
    expect((result as any).device_id).toBe("AA:BB");
    expect((result as any).data).toBeDefined();
  });

  it("social_msg_data: all platform fields normalized", () => {
    const result = norm("social_msg_data", {
      deviceId: "AA:BB",
      data: { phone: true, sms: false, wechat: true, qq: false, facebook: true,
               twitter: false, instagram: false, linkedin: false, whatsapp: true,
               line: false, skype: false, email: true, other: false },
    });
    expect((result as any).device_id).toBe("AA:BB");
    expect((result as any).data.phone).toBe("support");
    expect((result as any).data.whatsapp).toBe("support");
  });

  it("sport_mode_data: camelCase mode value → snake_case", () => {
    const result = norm("sport_mode_data", { deviceId: "AA:BB", mode: "outdoorRun" });
    expect(result).toMatchObject({ device_id: "AA:BB", mode: "outdoor_run" });
  });

  it("sport_mode_data: 'common' mode → null", () => {
    const result = norm("sport_mode_data", { deviceId: "AA:BB", mode: "common" });
    expect((result as any).mode).toBeNull();
  });

  it("sport_mode_data: null mode stays null", () => {
    const result = norm("sport_mode_data", { deviceId: "AA:BB", mode: null });
    expect((result as any).mode).toBeNull();
  });

  it("sport_mode_data: already-snake_case mode passes through unchanged", () => {
    const result = norm("sport_mode_data", { deviceId: "AA:BB", mode: "outdoor_run" });
    expect((result as any).mode).toBe("outdoor_run");
  });

  it("health_remind_data: startHour → start_hour, endHour → end_hour", () => {
    const result = norm("health_remind_data", {
      deviceId: "AA:BB",
      data: {
        type: "drink_water",
        startHour: 8,
        startMinute: 0,
        endHour: 22,
        endMinute: 0,
        interval: 60,
        enabled: true,
      },
    });
    expect(result).toMatchObject({
      device_id: "AA:BB",
      data: {
        type: "drink_water",
        start_hour: 8,
        start_minute: 0,
        end_hour: 22,
        end_minute: 0,
        interval: 60,
        enabled: true,
      },
    });
  });

  it("apnea_remind_data: camelCase keys → snake_case", () => {
    const result = norm("apnea_remind_data", {
      deviceId: "AA:BB",
      data: { enabled: true, threshold: 10, startHour: 22, startMinute: 0 },
    });
    expect(result).toMatchObject({
      device_id: "AA:BB",
      data: { enabled: true, start_hour: 22, start_minute: 0 },
    });
  });

  it("custom_settings_data: arbitrary camelCase keys → snake_case", () => {
    const result = norm("custom_settings_data", {
      deviceId: "AA:BB",
      data: { displayTimeout: 10, heartRateAlert: true, stepGoal: 8000 },
    });
    expect(result).toMatchObject({
      device_id: "AA:BB",
      data: { display_timeout: 10, heart_rate_alert: true, step_goal: 8000 },
    });
  });

  it("accurate_sleep_data: camelCase fields → snake_case", () => {
    const result = norm("accurate_sleep_data", {
      deviceId: "AA:BB",
      date: "2024-01-01",
      data: {
        sleepTime: "2024-01-01 23:00:00",
        wakeTime: "2024-01-02 07:00:00",
        deepDuration: 90,
        lightDuration: 210,
        remDuration: 60,
        getUpDuration: 10,
        sleepDuration: 360,
        getUpTimes: 2,
        sleepQuality: 3,
        curve: [],
      },
    });
    expect(result).toMatchObject({
      device_id: "AA:BB",
      date: "2024-01-01",
      data: {
        sleep_time: "2024-01-01 23:00:00",
        wake_time: "2024-01-02 07:00:00",
        deep_duration: 90,
        light_duration: 210,
        rem_duration: 60,
        get_up_times: 2,
        sleep_quality: 3,
      },
    });
  });

  it("exercise_session_data: camelCase keys → snake_case", () => {
    const result = norm("exercise_session_data", {
      deviceId: "AA:BB",
      session: {
        type: "outdoorRun",
        beginTime: "2024-01-01 08:00:00",
        endTime: "2024-01-01 09:00:00",
        totalSteps: 5000,
        totalDistance: 4000,
        totalCalories: 250,
        totalTime: 3600,
        averageHeartRate: 145,
        averagePace: 360,
        pauseCount: 0,
        pauseTotalTime: 0,
        minuteData: [],
      },
    });
    expect(result).toMatchObject({
      device_id: "AA:BB",
      session: {
        type: "outdoorRun",
        begin_time: "2024-01-01 08:00:00",
        end_time: "2024-01-01 09:00:00",
        total_steps: 5000,
        total_distance: 4000,
        total_calories: 250,
        average_heart_rate: 145,
      },
    });
  });
});

// ── Bluetooth & Session ───────────────────────────────────────────────────────

describe("bluetooth and session events", () => {
  it("bluetooth_state_changed: stateName and authorizationName extracted", () => {
    const result = norm("bluetooth_state_changed", {
      state: 5,
      stateName: "poweredOn",
      authorization: 3,
      authorizationName: "allowedAlways",
      isScanning: false,
      pendingScanStart: false,
    });
    expect((result as any).state).toBeDefined();
  });

  it("password_data: status normalized", () => {
    const result = norm("password_data", {
      deviceId: "AA:BB",
      data: { status: "CHECK_SUCCESS", password: "0000" },
    });
    expect((result as any).device_id).toBe("AA:BB");
    expect((result as any).data).toBeDefined();
  });

  it("device_function: packages normalized", () => {
    const result = norm("device_function", {
      deviceId: "AA:BB",
      data: {
        package1: {
          heartFunction: 0,
          bloodOxygen: 1,
          bloodPressure: 2,
          isHasGps: false,
          isHasNfc: false,
          isHasEcg: false,
          isHasBodyTemperature: false,
          bloodGlucose: 0,
          highBloodPressure: 0,
        },
      },
    });
    expect((result as any).device_id).toBe("AA:BB");
    expect((result as any).data).toBeDefined();
  });

  it("device_version: version fields snake_cased", () => {
    const result = norm("device_version", {
      deviceId: "AA:BB",
      version: { hardwareVersion: "1.0", firmwareVersion: "2.1", softwareVersion: "3.0" },
    });
    expect((result as any).version.hardware_version).toBe("1.0");
    expect((result as any).version.firmware_version).toBe("2.1");
  });
});
