import type { LogEntry } from './types/index.js';
import type {
  SdkLifecycleInterface,
  BandDiscoveryInterface,
  SessionInterface,
  HealthDataInterface,
  DeviceSettingsInterface,
  RealtimeTestsInterface,
} from './sdk/subsystem-interfaces.js';

export type LogListener = (entry: LogEntry) => void;

export interface VeepooSDKModuleInterface
  extends SdkLifecycleInterface,
    BandDiscoveryInterface,
    SessionInterface,
    HealthDataInterface,
    DeviceSettingsInterface,
    RealtimeTestsInterface {}
