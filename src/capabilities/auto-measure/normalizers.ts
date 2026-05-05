import type { AutoMeasureSetting } from "@/types/index";
import { isRecord, toInt, toBoolean } from "@/normalizers/primitives";

export function normalizeAutoMeasureSettings(value: unknown): AutoMeasureSetting[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord).map((item) => ({
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
    current_end_minute: toInt(item.currentEndMinute ?? item.current_end_minute),
  }));
}
