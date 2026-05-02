/**
 * Mutable **Session** / scan / init fields driven by native events and host calls.
 * Controllers read via getters; mutations go through methods so the seam stays explicit.
 */
export class VeepooSdkState {
  private initialized = false;
  private scanning = false;
  private deviceId: string | null = null;
  private readonly originProgressByDevice = new Map<string, number>();

  get isInitialized(): boolean {
    return this.initialized;
  }

  markInitialized(value: boolean): void {
    this.initialized = value;
  }

  get isScanning(): boolean {
    return this.scanning;
  }

  setScanning(value: boolean): void {
    this.scanning = value;
  }

  get connectedDeviceId(): string | null {
    return this.deviceId;
  }

  setConnectedDeviceId(id: string | null): void {
    this.deviceId = id;
  }

  getLastReadOriginProgress(deviceId: string): number | undefined {
    return this.originProgressByDevice.get(deviceId);
  }

  recordReadOriginProgress(deviceId: string, value: number): void {
    this.originProgressByDevice.set(deviceId, value);
  }

  clearReadOriginProgressForDevice(deviceId: string): void {
    this.originProgressByDevice.delete(deviceId);
  }

  clearAllReadOriginProgress(): void {
    this.originProgressByDevice.clear();
  }

  /** Clears connection/session scan fields and origin-read dedup map (e.g. destroy). */
  reset(): void {
    this.initialized = false;
    this.scanning = false;
    this.deviceId = null;
    this.originProgressByDevice.clear();
  }
}
