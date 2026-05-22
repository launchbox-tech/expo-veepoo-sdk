/** Band's classic Bluetooth connection state (used in `deviceBTStateChanged` event). */
export type DeviceBTState = 'disconnected' | 'connected' | 'pairing';

/**
 * Band's classic Bluetooth status returned by `readDeviceBTStatus`.
 * Classic BT is the secondary radio used for phone-call audio forwarding.
 */
export interface DeviceBTStatus {
  /** Whether the Band's classic BT radio is on. */
  is_bt_open: boolean;
  /** Whether the Band auto-reconnects classic BT. */
  is_auto_connect: boolean;
  /** Whether multimedia audio is routed through the Band. */
  is_audio_open: boolean;
  /** Whether pairing info exists on the Band. */
  has_pair_info: boolean;
  /** Current connection state. */
  state: DeviceBTState;
}
