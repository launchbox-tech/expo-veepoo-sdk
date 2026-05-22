import type { BloodGlucoseUnit } from '@/types/settings';

export interface BloodGlucoseRiskConfig {
  low: number;
  high: number;
  unit: BloodGlucoseUnit;
}
