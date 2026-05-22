import { OriginReadPipeline } from "@/bridge/origin-read-pipeline";
import { applyStateEvent } from "@/sdk/sdk-state-reducer";
import { VeepooSdkState } from "@/sdk/veepoo-sdk-state";

function makeCtx() {
  return { state: new VeepooSdkState(), originReadPipeline: new OriginReadPipeline() };
}

describe("applyStateEvent", () => {
  it("sets scanning on bluetooth_state_changed with a boolean is_scanning", () => {
    const ctx = makeCtx();
    applyStateEvent("bluetooth_state_changed", { is_scanning: true } as never, ctx);
    expect(ctx.state.isScanning).toBe(true);

    applyStateEvent("bluetooth_state_changed", { is_scanning: false } as never, ctx);
    expect(ctx.state.isScanning).toBe(false);
  });

  it("ignores bluetooth_state_changed when is_scanning is not a boolean", () => {
    const ctx = makeCtx();
    ctx.state.setScanning(true);
    applyStateEvent("bluetooth_state_changed", {} as never, ctx);
    expect(ctx.state.isScanning).toBe(true);
  });

  it("captures connectedDeviceId on device_connected", () => {
    const ctx = makeCtx();
    applyStateEvent("device_connected", { device_id: "AA:BB:CC" } as never, ctx);
    expect(ctx.state.connectedDeviceId).toBe("AA:BB:CC");
  });

  it("clears connectedDeviceId and pipeline entry on device_disconnected", () => {
    const ctx = makeCtx();
    ctx.state.setConnectedDeviceId("AA:BB:CC");
    ctx.originReadPipeline.shouldEmit({
      device_id: "AA:BB:CC",
      progress: { read_state: "reading", total_days: 1, current_day: 1, progress: 50 },
    } as never);

    applyStateEvent("device_disconnected", { device_id: "AA:BB:CC" } as never, ctx);

    expect(ctx.state.connectedDeviceId).toBeNull();
    // Pipeline entry cleared: a re-emit at the same progress is no longer deduped.
    const reEmits = ctx.originReadPipeline.shouldEmit({
      device_id: "AA:BB:CC",
      progress: { read_state: "reading", total_days: 1, current_day: 1, progress: 50 },
    } as never);
    expect(reEmits).toBe(true);
  });

  it("clears connectedDeviceId on connection_status_changed=disconnected for matching deviceId", () => {
    const ctx = makeCtx();
    ctx.state.setConnectedDeviceId("AA:BB:CC");
    applyStateEvent(
      "connection_status_changed",
      { device_id: "AA:BB:CC", status: "disconnected" } as never,
      ctx,
    );
    expect(ctx.state.connectedDeviceId).toBeNull();
  });

  it("keeps connectedDeviceId on connection_status_changed=connected", () => {
    const ctx = makeCtx();
    ctx.state.setConnectedDeviceId("AA:BB:CC");
    applyStateEvent(
      "connection_status_changed",
      { device_id: "AA:BB:CC", status: "connected" } as never,
      ctx,
    );
    expect(ctx.state.connectedDeviceId).toBe("AA:BB:CC");
  });

  it("ignores connection_status_changed when status is missing", () => {
    const ctx = makeCtx();
    ctx.state.setConnectedDeviceId("AA:BB:CC");
    applyStateEvent("connection_status_changed", { device_id: "AA:BB:CC" } as never, ctx);
    expect(ctx.state.connectedDeviceId).toBe("AA:BB:CC");
  });

  it("is a no-op for events that don't affect state", () => {
    const ctx = makeCtx();
    ctx.state.setConnectedDeviceId("AA:BB:CC");
    ctx.state.setScanning(true);

    applyStateEvent("battery_data", { device_id: "AA:BB:CC", data: {} } as never, ctx);
    applyStateEvent("sleep_data", { device_id: "AA:BB:CC", data: {} } as never, ctx);

    expect(ctx.state.connectedDeviceId).toBe("AA:BB:CC");
    expect(ctx.state.isScanning).toBe(true);
  });
});
