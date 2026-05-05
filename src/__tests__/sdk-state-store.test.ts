jest.mock("expo-modules-core", () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

import { VeepooSDK } from "@/veepoo-sdk";
import { VeepooSDKStateStore } from "@/react/sdk-state-store";
import { makeMockNative } from "./helpers/mock-native";

async function makeInitializedStore() {
  const native = makeMockNative();
  native.init = jest.fn().mockResolvedValue(undefined);
  const sdk = new VeepooSDK(native);
  await sdk.init();
  const store = new VeepooSDKStateStore(sdk);
  return { sdk, native, store };
}

describe("VeepooSDKStateStore", () => {
  // ── Initial snapshot ─────────────────────────────────────────────────────

  describe("initial snapshot", () => {
    it("reflects a freshly-initialized SDK (all false, no deviceId)", async () => {
      const { store } = await makeInitializedStore();
      expect(store.getSnapshot()).toEqual({
        initialized: true,
        isConnected: false,
        isReady: false,
        isScanning: false,
        connectedDeviceId: null,
      });
    });

    it("reads pre-existing connection state from SDK getters at construction", async () => {
      const native = makeMockNative();
      native.init = jest.fn().mockResolvedValue(undefined);
      const sdk = new VeepooSDK(native);
      await sdk.init();
      // Simulate a connection event before store is constructed
      native._emit("deviceConnected", { deviceId: "pre-existing" });
      const store = new VeepooSDKStateStore(sdk);
      expect(store.getSnapshot().isConnected).toBe(true);
      expect(store.getSnapshot().connectedDeviceId).toBe("pre-existing");
    });
  });

  // ── sdkInitialized event ─────────────────────────────────────────────────

  describe("sdkInitialized event", () => {
    it("sets initialized to true on init()", async () => {
      const native = makeMockNative();
      native.init = jest.fn().mockResolvedValue(undefined);
      const sdk = new VeepooSDK(native);
      // Create store before init to observe the transition
      const store = new VeepooSDKStateStore(sdk);
      expect(store.getSnapshot().initialized).toBe(false);
      await sdk.init();
      expect(store.getSnapshot().initialized).toBe(true);
    });
  });

  // ── deviceConnected event ────────────────────────────────────────────────

  describe("deviceConnected event", () => {
    it("sets isConnected and connectedDeviceId", async () => {
      const { native, store } = await makeInitializedStore();
      native._emit("deviceConnected", { deviceId: "band-001" });
      const snap = store.getSnapshot();
      expect(snap.isConnected).toBe(true);
      expect(snap.connectedDeviceId).toBe("band-001");
    });

    it("does not set isReady (requires deviceReady)", async () => {
      const { native, store } = await makeInitializedStore();
      native._emit("deviceConnected", { deviceId: "band-001" });
      expect(store.getSnapshot().isReady).toBe(false);
    });
  });

  // ── deviceReady event ────────────────────────────────────────────────────

  describe("deviceReady event", () => {
    it("sets isReady and connectedDeviceId", async () => {
      const { native, store } = await makeInitializedStore();
      native._emit("deviceConnected", { deviceId: "band-001" });
      native._emit("deviceReady", { deviceId: "band-001" });
      const snap = store.getSnapshot();
      expect(snap.isReady).toBe(true);
      expect(snap.connectedDeviceId).toBe("band-001");
    });
  });

  // ── deviceDisconnected event ─────────────────────────────────────────────

  describe("deviceDisconnected event", () => {
    it("clears isConnected, isReady, and connectedDeviceId", async () => {
      const { native, store } = await makeInitializedStore();
      native._emit("deviceConnected", { deviceId: "band-001" });
      native._emit("deviceReady", { deviceId: "band-001" });
      native._emit("deviceDisconnected", { deviceId: "band-001" });
      const snap = store.getSnapshot();
      expect(snap.isConnected).toBe(false);
      expect(snap.isReady).toBe(false);
      expect(snap.connectedDeviceId).toBeNull();
    });
  });

  // ── scanStarted / scanStopped events ─────────────────────────────────────

  describe("scan events", () => {
    it("scanStarted sets isScanning to true", async () => {
      const { sdk, store } = await makeInitializedStore();
      await sdk.discovery.startScan();
      expect(store.getSnapshot().isScanning).toBe(true);
    });

    it("scanStopped sets isScanning to false", async () => {
      const { sdk, store } = await makeInitializedStore();
      await sdk.discovery.startScan();
      await sdk.discovery.stopScan();
      expect(store.getSnapshot().isScanning).toBe(false);
    });
  });

  // ── subscribe ────────────────────────────────────────────────────────────

  describe("subscribe", () => {
    it("calls listener when state changes", async () => {
      const { native, store } = await makeInitializedStore();
      const listener = jest.fn();
      store.subscribe(listener);
      native._emit("deviceConnected", { deviceId: "band-001" });
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("returned unsubscribe stops further notifications", async () => {
      const { native, store } = await makeInitializedStore();
      const listener = jest.fn();
      const unsubscribe = store.subscribe(listener);
      unsubscribe();
      native._emit("deviceConnected", { deviceId: "band-001" });
      expect(listener).not.toHaveBeenCalled();
    });

    it("getSnapshot returns the same reference when state has not changed", async () => {
      const { store } = await makeInitializedStore();
      expect(store.getSnapshot()).toBe(store.getSnapshot());
    });

    it("getSnapshot returns a new reference after a state change", async () => {
      const { native, store } = await makeInitializedStore();
      const before = store.getSnapshot();
      native._emit("deviceConnected", { deviceId: "band-001" });
      expect(store.getSnapshot()).not.toBe(before);
    });
  });

  // ── destroy ──────────────────────────────────────────────────────────────

  describe("destroy", () => {
    it("stops listener notifications after destroy", async () => {
      const { native, store } = await makeInitializedStore();
      const listener = jest.fn();
      store.subscribe(listener);
      store.destroy();
      native._emit("deviceConnected", { deviceId: "band-001" });
      expect(listener).not.toHaveBeenCalled();
    });

    it("stops state updates after destroy", async () => {
      const { native, store } = await makeInitializedStore();
      const snapshotBefore = store.getSnapshot();
      store.destroy();
      native._emit("deviceConnected", { deviceId: "band-001" });
      expect(store.getSnapshot()).toBe(snapshotBefore);
    });
  });
});
