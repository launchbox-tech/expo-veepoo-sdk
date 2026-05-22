import { passthrough, type PartialEventNormalizers } from '@/bridge/event-envelope';

export const EVENT_NORMALIZERS = {
  exercise_session_data: passthrough<'exercise_session_data'>(),
  stored_temperature_data: passthrough<'stored_temperature_data'>(),
  stored_blood_glucose_data: passthrough<'stored_blood_glucose_data'>(),
  stored_hrv_data: passthrough<'stored_hrv_data'>(),
  stored_ecg_data: passthrough<'stored_ecg_data'>(),
  stored_body_composition_data: passthrough<'stored_body_composition_data'>(),
} satisfies PartialEventNormalizers;
