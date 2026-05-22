import { VeepooSdkState } from "@/sdk/veepoo-sdk-state";

describe("VeepooSdkState — Session/scan/init state", () => {
  let state: VeepooSdkState;

  beforeEach(() => {
    state = new VeepooSdkState();
  });

  // ── Public setters (capability-driven mutations) ──────────────────────

  describe("setters", () => {
    it("setConnectedDeviceId mutates connectedDeviceId", () => {
      state.setConnectedDeviceId("abc");
      expect(state.connectedDeviceId).toBe("abc");
      state.setConnectedDeviceId(null);
      expect(state.connectedDeviceId).toBeNull();
    });

    it("setScanning mutates isScanning", () => {
      state.setScanning(true);
      expect(state.isScanning).toBe(true);
      state.setScanning(false);
      expect(state.isScanning).toBe(false);
    });

    it("markInitialized mutates isInitialized", () => {
      state.markInitialized(true);
      expect(state.isInitialized).toBe(true);
      state.markInitialized(false);
      expect(state.isInitialized).toBe(false);
    });

    it("reset clears all fields", () => {
      state.setConnectedDeviceId("abc");
      state.setScanning(true);
      state.markInitialized(true);
      state.reset();
      expect(state.connectedDeviceId).toBeNull();
      expect(state.isScanning).toBe(false);
      expect(state.isInitialized).toBe(false);
    });
  });

  // ── applyEvent: bluetooth_state_changed ──────────────────────────────

  describe("applyEvent('bluetooth_state_changed')", () => {
    it("sets isScanning when is_scanning is a boolean", () => {
      state.applyEvent("bluetooth_state_changed", { is_scanning: true } as never);
      expect(state.isScanning).toBe(true);
      state.applyEvent("bluetooth_state_changed", { is_scanning: false } as never);
      expect(state.isScanning).toBe(false);
    });

    it("ignores payload when is_scanning is not a boolean", () => {
      state.setScanning(true);
      state.applyEvent("bluetooth_state_changed", {} as never);
      expect(state.isScanning).toBe(true);
    });
  });

  // ── applyEvent: device_connected ─────────────────────────────────────

  describe("applyEvent('device_connected')", () => {
    it("captures connectedDeviceId for a non-empty deviceId", () => {
      state.applyEvent("device_connected", { device_id: "AA:BB:CC" } as never);
      expect(state.connectedDeviceId).toBe("AA:BB:CC");
    });

    it("does not capture connectedDeviceId for an empty string", () => {
      state.applyEvent("device_connected", { device_id: "" } as never);
      expect(state.connectedDeviceId).toBeNull();
    });
  });

  // ── applyEvent: device_disconnected ──────────────────────────────────

  describe("applyEvent('device_disconnected')", () => {
    it("clears connectedDeviceId when deviceId matches", () => {
      state.setConnectedDeviceId("abc");
      state.applyEvent("device_disconnected", { device_id: "abc" } as never);
      expect(state.connectedDeviceId).toBeNull();
    });

    it("does not clear connectedDeviceId when deviceId does not match", () => {
      state.setConnectedDeviceId("abc");
      state.applyEvent("device_disconnected", { device_id: "xyz" } as never);
      expect(state.connectedDeviceId).toBe("abc");
    });

    it("clears connectedDeviceId unconditionally when deviceId is undefined", () => {
      state.setConnectedDeviceId("abc");
      state.applyEvent("device_disconnected", {} as never);
      expect(state.connectedDeviceId).toBeNull();
    });

    it("sets isScanning to false", () => {
      state.setScanning(true);
      state.applyEvent("device_disconnected", { device_id: "abc" } as never);
      expect(state.isScanning).toBe(false);
    });

    it("sets isScanning to false even when deviceId does not match", () => {
      state.setConnectedDeviceId("abc");
      state.setScanning(true);
      state.applyEvent("device_disconnected", { device_id: "xyz" } as never);
      expect(state.isScanning).toBe(false);
    });
  });

  // ── applyEvent: connection_status_changed ────────────────────────────

  describe("applyEvent('connection_status_changed')", () => {
    it("clears connectedDeviceId when status is disconnected and deviceId matches", () => {
      state.setConnectedDeviceId("abc");
      state.applyEvent("connection_status_changed", {
        device_id: "abc",
        status: "disconnected",
      } as never);
      expect(state.connectedDeviceId).toBeNull();
    });

    it("does not clear connectedDeviceId when status is connected", () => {
      state.setConnectedDeviceId("abc");
      state.applyEvent("connection_status_changed", {
        device_id: "abc",
        status: "connected",
      } as never);
      expect(state.connectedDeviceId).toBe("abc");
    });

    it("clears connectedDeviceId unconditionally when status is disconnected and deviceId is undefined", () => {
      state.setConnectedDeviceId("abc");
      state.applyEvent("connection_status_changed", {
        status: "disconnected",
      } as never);
      expect(state.connectedDeviceId).toBeNull();
    });

    it("does not clear connectedDeviceId when status is disconnected but deviceId does not match", () => {
      state.setConnectedDeviceId("abc");
      state.applyEvent("connection_status_changed", {
        device_id: "xyz",
        status: "disconnected",
      } as never);
      expect(state.connectedDeviceId).toBe("abc");
    });

    it("does not clear connectedDeviceId for status connecting", () => {
      state.setConnectedDeviceId("abc");
      state.applyEvent("connection_status_changed", {
        device_id: "abc",
        status: "connecting",
      } as never);
      expect(state.connectedDeviceId).toBe("abc");
    });

    it("ignores payload when status is missing", () => {
      state.setConnectedDeviceId("abc");
      state.applyEvent("connection_status_changed", { device_id: "abc" } as never);
      expect(state.connectedDeviceId).toBe("abc");
    });
  });

  // ── applyEvent: device_connect_status (alias channel) ────────────────

  describe("applyEvent('device_connect_status')", () => {
    it("clears connectedDeviceId when status is disconnected and deviceId matches", () => {
      state.setConnectedDeviceId("abc");
      state.applyEvent("device_connect_status", {
        device_id: "abc",
        status: "disconnected",
      } as never);
      expect(state.connectedDeviceId).toBeNull();
    });
  });

  // ── applyEvent: no-op events ─────────────────────────────────────────

  describe("applyEvent — non-state-affecting events", () => {
    it("is a no-op for events without a reducer branch", () => {
      state.setConnectedDeviceId("abc");
      state.setScanning(true);

      state.applyEvent("battery_data", { device_id: "abc", data: {} } as never);
      state.applyEvent("sleep_data", { device_id: "abc", data: {} } as never);

      expect(state.connectedDeviceId).toBe("abc");
      expect(state.isScanning).toBe(true);
    });
  });
});
