import type { FunctionStatus, TestState } from '../types/index';
export declare function isRecord(value: unknown): value is Record<string, unknown>;
export declare function clamp(value: number, min: number, max: number): number;
export declare function toNumber(value: unknown): number | undefined;
export declare function toInt(value: unknown, fallback?: number): number;
export declare function toBoolean(value: unknown, fallback?: boolean): boolean;
export declare function toStringValue(value: unknown, fallback?: string): string;
export declare function normalizeFunctionStatus(value: unknown): FunctionStatus;
export declare function normalizeTestState(value: unknown): TestState;
//# sourceMappingURL=primitives.d.ts.map