import type { AutoMeasureSetting } from '../types/index.js';
import { isRecord, toInt, toBoolean } from './primitives.js';

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
