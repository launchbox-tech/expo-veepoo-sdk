import type { HalfHourData, OriginData, Spo2OriginData } from "../../types/index";
import type { VeepooEventPayload } from "../../types/index";
export declare function normalizeOriginDataList(value: unknown): OriginData[];
export declare function normalizeHalfHourData(value: unknown): HalfHourData;
/**
 * Bespoke envelope for the `read_origin_progress` event: the inner payload
 * lives under `progress` and carries camelCase keys that need clamping and
 * sane defaults. Returns the original envelope with the normalized `progress`.
 */
export declare function normalizeReadOriginProgressPayload(value: unknown): VeepooEventPayload['read_origin_progress'];
export declare function normalizeSpo2OriginData(value: unknown): Spo2OriginData;
//# sourceMappingURL=normalizers.d.ts.map