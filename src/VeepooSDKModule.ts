import type { LogEntry } from './types/index.js';
import type { VeepooSDKInterface } from './VeepooSDK.js';

export type LogListener = (entry: LogEntry) => void;

/** @deprecated Use {@link VeepooSDKInterface} directly. */
export type VeepooSDKModuleInterface = VeepooSDKInterface;
