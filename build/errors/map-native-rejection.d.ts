import type { VeepooError, VeepooErrorCode } from "../types/errors";
export declare function isVeepooErrorShape(error: unknown): error is VeepooError;
export interface MapNativeRejectionContext {
    fallbackCode: VeepooErrorCode;
    deviceId?: string;
}
/**
 * Maps Expo / native module rejections to {@link VeepooError} per ADR 0003.
 * Pass-through when `error` is already a shaped {@link VeepooError} (e.g. from validators).
 */
export declare function mapNativeRejection(error: unknown, ctx: MapNativeRejectionContext): VeepooError;
//# sourceMappingURL=map-native-rejection.d.ts.map