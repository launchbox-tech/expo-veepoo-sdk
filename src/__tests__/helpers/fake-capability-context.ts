/// <reference types="@types/jest" />
import {
  invokeOrThrow,
  invokeWithRecovery,
} from '@/bridge/native-invoke-pipeline';
import type { CapabilityContext } from '@/capabilities/shared/context';
import { mapNativeRejection } from '@/errors/map-native-rejection';
import type {
  LogLevel,
  LogScope,
  VeepooError,
  VeepooErrorCode,
  VeepooEvent,
  VeepooEventPayload,
} from '@/types/index';
import { makeMockNative, type MockNative } from './mock-native';

/**
 * Captured side effects on a {@link FakeCapabilityContext}. Tests reach for
 * the spies directly (assert call counts / args) and for the `emittedEvents`
 * list when ordering matters.
 */
export interface CapabilityContextSpies {
  invoke: jest.Mock;
  invokeWithRecovery: jest.Mock;
  emit: jest.Mock;
  emitDeviceEvent: jest.Mock;
  log: jest.Mock;
  setConnectedDeviceId: jest.Mock;
  setScanning: jest.Mock;
  /** Flat list of `(event, payload)` for both `emit` and `emitDeviceEvent`. */
  emittedEvents: Array<{ event: VeepooEvent; payload: unknown }>;
  /** Log entries, in call order. */
  logEntries: Array<{
    level: LogLevel;
    scope: LogScope;
    action: string;
    message: string;
    options?: { deviceId?: string; data?: unknown; error?: unknown };
  }>;
}

export type FakeCapabilityContext<TNative = MockNative> =
  CapabilityContext<TNative> & { spies: CapabilityContextSpies };

export interface FakeCapabilityContextOptions<TNative = MockNative> {
  native?: TNative;
  connectedDeviceId?: string | null;
  isScanning?: boolean;
}

/**
 * In-memory adapter satisfying {@link CapabilityContext}. Pairs with the
 * production adapter (`VeepooSDKRuntime.createCapabilityContext()`) so the
 * seam carries two adapters — the principle of "two adapters = real seam."
 *
 * Capabilities under test get the real `invoke` / `invokeWithRecovery`
 * pipeline (validate → native call → normalize). Emit/log calls are spied
 * and recorded; `connectedDeviceId` / `isScanning` are backed by mutable
 * locals so tests can advance state without wiring up `VeepooSDKRuntime`.
 */
export function makeFakeCapabilityContext<TNative = MockNative>(
  options: FakeCapabilityContextOptions<TNative> = {},
): FakeCapabilityContext<TNative> {
  const native =
    options.native ?? (makeMockNative() as unknown as TNative);
  let connectedDeviceId: string | null = options.connectedDeviceId ?? null;
  let isScanning = options.isScanning ?? false;

  const emittedEvents: CapabilityContextSpies['emittedEvents'] = [];
  const logEntries: CapabilityContextSpies['logEntries'] = [];

  const emit = jest.fn((event: VeepooEvent, payload: unknown) => {
    emittedEvents.push({ event, payload });
  });

  const emitDeviceEvent = jest.fn(
    (event: VeepooEvent, payload: Record<string, unknown>) => {
      const wrapped = { device_id: connectedDeviceId ?? '', ...payload };
      emittedEvents.push({ event, payload: wrapped });
    },
  );

  const log = jest.fn(
    (
      level: LogLevel,
      scope: LogScope,
      action: string,
      message: string,
      opts?: { deviceId?: string; data?: unknown; error?: unknown },
    ) => {
      logEntries.push({ level, scope, action, message, options: opts });
    },
  );

  const setConnectedDeviceId = jest.fn((id: string | null) => {
    connectedDeviceId = id;
  });

  const setScanning = jest.fn((v: boolean) => {
    isScanning = v;
  });

  const invoke = jest.fn() as jest.Mock;
  const invokeImpl: CapabilityContext<TNative>['invoke'] = (opts) => {
    invoke(opts);
    const { errorCode, errorDeviceId, ...rest } = opts;
    return invokeOrThrow({
      ...rest,
      mapError: (error: unknown) =>
        toVeepooError(
          error,
          errorCode,
          errorDeviceId ?? connectedDeviceId ?? undefined,
        ),
    });
  };

  const invokeWithRecoverySpy = jest.fn() as jest.Mock;
  const invokeWithRecoveryImpl: CapabilityContext<TNative>['invokeWithRecovery'] =
    (opts) => {
      invokeWithRecoverySpy(opts);
      const { errorCode, errorDeviceId, recoverWith, ...rest } = opts;
      return invokeWithRecovery({
        ...rest,
        recover: (error: unknown) => {
          toVeepooError(
            error,
            errorCode,
            errorDeviceId ?? connectedDeviceId ?? undefined,
          );
          return recoverWith;
        },
      });
    };

  const spies: CapabilityContextSpies = {
    invoke,
    invokeWithRecovery: invokeWithRecoverySpy,
    emit,
    emitDeviceEvent,
    log,
    setConnectedDeviceId,
    setScanning,
    emittedEvents,
    logEntries,
  };

  const ctx: FakeCapabilityContext<TNative> = {
    native,
    invoke: invokeImpl,
    invokeWithRecovery: invokeWithRecoveryImpl,
    emit: emit as CapabilityContext<TNative>['emit'],
    emitDeviceEvent:
      emitDeviceEvent as unknown as CapabilityContext<TNative>['emitDeviceEvent'],
    connectedDeviceId: () => connectedDeviceId,
    setConnectedDeviceId:
      setConnectedDeviceId as CapabilityContext<TNative>['setConnectedDeviceId'],
    isScanning: () => isScanning,
    setScanning: setScanning as CapabilityContext<TNative>['setScanning'],
    log: log as CapabilityContext<TNative>['log'],
    spies,
  };

  return ctx;
}

/**
 * Find the first emission for an event name — convenience for tests that
 * don't care about ordering.
 */
export function findEmission<K extends VeepooEvent>(
  ctx: FakeCapabilityContext<unknown>,
  event: K,
): VeepooEventPayload[K] | undefined {
  const entry = ctx.spies.emittedEvents.find((e) => e.event === event);
  return entry ? (entry.payload as VeepooEventPayload[K]) : undefined;
}

function toVeepooError(
  error: unknown,
  code: VeepooErrorCode | undefined,
  deviceId: string | undefined,
): VeepooError {
  return mapNativeRejection(error, {
    fallbackCode: code ?? 'OPERATION_FAILED',
    deviceId,
  });
}
