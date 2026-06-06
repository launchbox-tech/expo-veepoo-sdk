jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { HistoricalQueryCapability } from '@/capabilities/historical-query';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';

describe('HistoricalQueryCapability', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let historicalQuery: HistoricalQueryCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    historicalQuery = new HistoricalQueryCapability(runtime.createCapabilityContext());
  });

  it('readDeviceAllData delegates to native and returns the native boolean', async () => {
    native.readDeviceAllData.mockResolvedValueOnce(true);

    const result = await historicalQuery.readDeviceAllData();

    expect(native.readDeviceAllData).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  it('startReadOriginData delegates to native', async () => {
    await historicalQuery.startReadOriginData();

    expect(native.startReadOriginData).toHaveBeenCalledTimes(1);
  });

  it('startReadOriginData surfaces native rejections through the error pipeline', async () => {
    const errorListener = jest.fn();
    runtime.on('error', errorListener);
    native.startReadOriginData.mockRejectedValueOnce(new Error('boom'));

    await expect(historicalQuery.startReadOriginData()).rejects.toMatchObject({
      code: 'OPERATION_FAILED',
    });
    expect(errorListener).toHaveBeenCalled();
  });

  describe('readExerciseSessions (stream-read collector, ADR 0015)', () => {
    // Native→JS event delivery (mock `_emit`) requires the bus's native
    // listeners, which attach on init.
    beforeEach(async () => {
      await runtime.init();
    });

    it('collects streamed sessions and resolves on exercise_read_complete', async () => {
      const promise = historicalQuery.readExerciseSessions();

      native._emit('exerciseSessionData', {
        deviceId: 'AA:BB',
        session: { type: 'outdoorRun', beginTime: '2026-06-05 10:00:00', minuteData: [] },
      });
      native._emit('exerciseSessionData', {
        deviceId: 'AA:BB',
        session: { type: 'outdoorWalk', beginTime: '2026-06-06 09:00:00', minuteData: [] },
      });
      native._emit('exerciseReadComplete', { deviceId: 'AA:BB', success: true });

      const sessions = await promise;
      expect(native.startReadExerciseData).toHaveBeenCalledTimes(1);
      expect(sessions).toHaveLength(2);
      // Keys deep-snake-cased by the bridge; the sport `type` VALUE is
      // normalized from the native tables' camelCase to canonical SportMode.
      expect(sessions[0]).toMatchObject({ type: 'outdoor_run', begin_time: '2026-06-05 10:00:00' });
      expect(sessions[1]).toMatchObject({ type: 'outdoor_walk', begin_time: '2026-06-06 09:00:00' });
    });

    it('resolves [] when completion arrives with nothing stored', async () => {
      const promise = historicalQuery.readExerciseSessions();

      native._emit('exerciseReadComplete', { deviceId: 'AA:BB', success: true });

      await expect(promise).resolves.toEqual([]);
    });

    it('ignores session events after completion (listeners removed)', async () => {
      const promise = historicalQuery.readExerciseSessions();
      native._emit('exerciseReadComplete', { deviceId: 'AA:BB', success: true });
      await promise;

      // A stray late event must not leak into a subsequent read.
      native._emit('exerciseSessionData', {
        deviceId: 'AA:BB',
        session: { type: 'hiking', beginTime: '2026-06-04 08:00:00', minuteData: [] },
      });
      const second = historicalQuery.readExerciseSessions();
      native._emit('exerciseReadComplete', { deviceId: 'AA:BB', success: true });
      await expect(second).resolves.toEqual([]);
    });

    it('rejects CAPABILITY_UNSUPPORTED distinctly when the Band has no exercise history', async () => {
      native.startReadExerciseData.mockRejectedValueOnce({
        code: 'CAPABILITY_UNSUPPORTED',
        message: 'Band does not support exercise history',
      });

      await expect(historicalQuery.readExerciseSessions()).rejects.toMatchObject({
        code: 'CAPABILITY_UNSUPPORTED',
      });
    });

    it('rejects TIMEOUT when the event stream stalls', async () => {
      jest.useFakeTimers();
      try {
        const promise = historicalQuery.readExerciseSessions();
        const assertion = expect(promise).rejects.toMatchObject({ code: 'TIMEOUT' });

        // One session arrives, then the Band goes silent — the watchdog
        // re-arms on each event and fires after 30s of silence.
        native._emit('exerciseSessionData', {
          deviceId: 'AA:BB',
          session: { type: 'outdoorRun', beginTime: '2026-06-05 10:00:00', minuteData: [] },
        });
        await jest.advanceTimersByTimeAsync(30_000);
        await assertion;
      } finally {
        jest.useRealTimers();
      }
    });

    it('progress events re-arm the watchdog — a slow transfer survives past the stall window', async () => {
      jest.useFakeTimers();
      try {
        const seen: Array<{ phase: string; current: number }> = [];
        const promise = historicalQuery.readExerciseSessions({
          onProgress: (p) => seen.push({ phase: p.phase, current: p.current }),
        });

        // 3 × 20s of silence, each broken by a progress event — total 60s,
        // well past the 30s stall, but never 30s without a sign of life.
        for (let i = 1; i <= 3; i++) {
          await jest.advanceTimersByTimeAsync(20_000);
          native._emit('exerciseReadProgress', {
            deviceId: 'AA:BB',
            progress: { phase: 'transfer', readState: 'reading', total: 10, current: i, progress: 50 },
          });
        }
        native._emit('exerciseReadComplete', { deviceId: 'AA:BB', success: true });

        await expect(promise).resolves.toEqual([]);
        expect(seen).toEqual([
          { phase: 'transfer', current: 1 },
          { phase: 'transfer', current: 2 },
          { phase: 'transfer', current: 3 },
        ]);
      } finally {
        jest.useRealTimers();
      }
    });

    it('rejects OPERATION_FAILED when the Band aborts (success: false)', async () => {
      const promise = historicalQuery.readExerciseSessions();
      native._emit('exerciseReadComplete', { deviceId: 'AA:BB', success: false });

      await expect(promise).rejects.toMatchObject({ code: 'OPERATION_FAILED' });
    });

    it('streams sessions via onSession even when the read later dies — partial data survives', async () => {
      jest.useFakeTimers();
      try {
        const streamed: string[] = [];
        const promise = historicalQuery.readExerciseSessions({
          onSession: (s) => streamed.push(s.begin_time),
        });
        const assertion = expect(promise).rejects.toMatchObject({ code: 'TIMEOUT' });

        native._emit('exerciseSessionData', {
          deviceId: 'AA:BB',
          session: { type: 'outdoorRun', beginTime: '2026-06-05 10:00:00', minuteData: [] },
        });
        // The read dies after the first session — the promise rejects, but
        // the streamed session was already delivered for persistence.
        await jest.advanceTimersByTimeAsync(30_000);
        await assertion;
        expect(streamed).toEqual(['2026-06-05 10:00:00']);
      } finally {
        jest.useRealTimers();
      }
    });
  });
});
