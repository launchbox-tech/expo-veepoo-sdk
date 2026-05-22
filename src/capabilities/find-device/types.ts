/** Phone → Band find / anti-loss (vibrate, screen on). Emitted on `findDeviceState`. */
export type FindDevicePhase =
  | 'unsupported'
  | 'searching'
  | 'found'
  | 'timeout'
  | 'stopped';
