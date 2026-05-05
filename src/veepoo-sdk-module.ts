import type { LogEntry } from './types/index';
import type { VeepooSDKInterface } from './veepoo-sdk';

export type LogListener = (entry: LogEntry) => void;

/** @deprecated Use {@link VeepooSDKInterface} directly. */
export type VeepooSDKModuleInterface = VeepooSDKInterface;
