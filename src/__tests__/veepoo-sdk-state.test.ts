import { VeepooSdkState } from "@/sdk/veepoo-sdk-state";

describe("VeepooSdkState — Session transition methods", () => {
  let state: VeepooSdkState;

  beforeEach(() => {
    state = new VeepooSdkState();
  });

  // ── onDeviceConnected ─────────────────────────────────────────────────

  describe("onDeviceConnected", () => {
    it("sets connectedDeviceId to the given deviceId", () => {
      state.onDeviceConnected("abc");
      expect(state.connectedDeviceId).toBe("abc");
    });

    it("does not set connectedDeviceId for an empty string", () => {
      state.onDeviceConnected("");
      expect(state.connectedDeviceId).toBeNull();
    });
  });

  // ── onDeviceDisconnected ──────────────────────────────────────────────

  describe("onDeviceDisconnected", () => {
    it("clears connectedDeviceId when deviceId matches", () => {
      state.onDeviceConnected("abc");
      state.onDeviceDisconnected("abc");
      expect(state.connectedDeviceId).toBeNull();
    });

    it("does not clear connectedDeviceId when deviceId does not match", () => {
      state.onDeviceConnected("abc");
      state.onDeviceDisconnected("xyz");
      expect(state.connectedDeviceId).toBe("abc");
    });

    it("clears connectedDeviceId unconditionally when deviceId is undefined", () => {
      state.onDeviceConnected("abc");
      state.onDeviceDisconnected(undefined);
      expect(state.connectedDeviceId).toBeNull();
    });

    it("sets isScanning to false", () => {
      state.setScanning(true);
      state.onDeviceDisconnected("abc");
      expect(state.isScanning).toBe(false);
    });

    it("sets isScanning to false even when deviceId does not match connectedDeviceId", () => {
      state.onDeviceConnected("abc");
      state.setScanning(true);
      state.onDeviceDisconnected("xyz");
      expect(state.isScanning).toBe(false);
    });
  });

  // ── onConnectionStatusChanged ─────────────────────────────────────────

  describe("onConnectionStatusChanged", () => {
    it("clears connectedDeviceId when status is disconnected and deviceId matches", () => {
      state.onDeviceConnected("abc");
      state.onConnectionStatusChanged("abc", "disconnected");
      expect(state.connectedDeviceId).toBeNull();
    });

    it("does not clear connectedDeviceId when status is connected", () => {
      state.onDeviceConnected("abc");
      state.onConnectionStatusChanged("abc", "connected");
      expect(state.connectedDeviceId).toBe("abc");
    });

    it("clears connectedDeviceId unconditionally when status is disconnected and deviceId is undefined", () => {
      state.onDeviceConnected("abc");
      state.onConnectionStatusChanged(undefined, "disconnected");
      expect(state.connectedDeviceId).toBeNull();
    });

    it("does not clear connectedDeviceId when status is disconnected but deviceId does not match", () => {
      state.onDeviceConnected("abc");
      state.onConnectionStatusChanged("xyz", "disconnected");
      expect(state.connectedDeviceId).toBe("abc");
    });

    it("does not clear connectedDeviceId for status connecting", () => {
      state.onDeviceConnected("abc");
      state.onConnectionStatusChanged("abc", "connecting");
      expect(state.connectedDeviceId).toBe("abc");
    });
  });
});
