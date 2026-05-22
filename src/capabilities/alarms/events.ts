import { passthrough, wrapInner, type PartialEventNormalizers } from '@/bridge/event-envelope';
import { normalizeAlarmList, normalizeHeartRateAlarm } from './normalizers';

export const EVENT_NORMALIZERS = {
  alarm_data: wrapInner('alarms', normalizeAlarmList, { fallbackKey: 'data' }),
  heart_rate_alarm_data: wrapInner('data', normalizeHeartRateAlarm),
  spo2_alarm_data: passthrough<'spo2_alarm_data'>(),
} satisfies PartialEventNormalizers;
