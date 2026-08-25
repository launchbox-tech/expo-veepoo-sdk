import type { VeepooEvent, VeepooEventPayload } from "../../types/index";
import type { CapabilityContext } from "../../capabilities/shared/context";
/**
 * Stream-read collector (ADR 0015): one vendor command, N data events, a
 * dedicated completion event. Subscribes BEFORE firing the command (events
 * may start before the command promise settles), collects every data event,
 * resolves on completion, and guards with a stall watchdog — a command the
 * Band silently drops never completes, so `stallMs` of event silence rejects
 * with `TIMEOUT` instead of hanging the caller forever. Progress events
 * (when the read has them) re-arm the watchdog — a slow transfer streaming
 * progress is alive, not stalled. All listeners are removed on every exit
 * path.
 */
export declare function collectStream<D extends VeepooEvent, C extends VeepooEvent, T>(ctx: Pick<CapabilityContext<unknown>, "on" | "off">, opts: {
    /** Fires the vendor command. Rejections propagate to the caller. */
    start: () => Promise<unknown>;
    dataEvent: D;
    pick: (payload: VeepooEventPayload[D]) => T;
    /** Streams each picked item as it arrives — lets callers persist
     * incrementally so a mid-read death keeps everything received so far
     * (the resolved array is all-or-nothing; this hook is not). */
    onItem?: (item: T) => void;
    completeEvent: C;
    /** Returns an error message when the completion payload signals a vendor
     * abort (e.g. `success: false`) — the collector rejects instead of
     * resolving partial data as if it were everything. */
    isFailure?: (payload: VeepooEventPayload[C]) => string | null;
    /** Hands the raw completion payload to the caller. Fires on BOTH outcomes
     * — a payload that carries read diagnostics explains a failure at least as
     * often as a success, so it must not be reachable only via `resolve`.
     * Kept as a hook rather than widening the resolved value: every other
     * caller of this collector wants the items and nothing else. */
    onComplete?: (payload: VeepooEventPayload[C]) => void;
    /** Progress stream of the same read: re-arms the watchdog; `onProgress`
     * forwards each payload to the caller (host progress bars). */
    progress?: {
        event: VeepooEvent;
        onProgress?: (payload: never) => void;
    };
    /** Max silence between events before the read is declared dead. */
    stallMs: number;
}): Promise<T[]>;
//# sourceMappingURL=collect-stream.d.ts.map