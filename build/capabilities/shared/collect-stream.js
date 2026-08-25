"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectStream = collectStream;
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
function collectStream(ctx, opts) {
    const { start, dataEvent, pick, onItem, completeEvent, isFailure, onComplete: onCompletePayload, progress, stallMs, } = opts;
    return new Promise((resolve, reject) => {
        const items = [];
        let stall = null;
        let settled = false;
        const settle = (outcome) => {
            if (settled)
                return;
            settled = true;
            if (stall)
                clearTimeout(stall);
            ctx.off(dataEvent, onData);
            ctx.off(completeEvent, onComplete);
            if (progress)
                ctx.off(progress.event, onProgress);
            outcome();
        };
        const armStall = () => {
            if (settled)
                return;
            if (stall)
                clearTimeout(stall);
            stall = setTimeout(() => settle(() => reject({
                code: "TIMEOUT",
                message: `${dataEvent} stream stalled (${stallMs}ms of silence)`,
            })), stallMs);
        };
        const onData = (payload) => {
            armStall();
            const item = pick(payload);
            items.push(item);
            onItem?.(item);
        };
        const onProgress = (payload) => {
            armStall();
            progress?.onProgress?.(payload);
        };
        const onComplete = (payload) => {
            onCompletePayload?.(payload);
            const failure = isFailure?.(payload) ?? null;
            settle(() => failure === null
                ? resolve(items)
                : reject({ code: "OPERATION_FAILED", message: failure }));
        };
        ctx.on(dataEvent, onData);
        ctx.on(completeEvent, onComplete);
        if (progress)
            ctx.on(progress.event, onProgress);
        armStall();
        start().catch((err) => settle(() => reject(err)));
    });
}
//# sourceMappingURL=collect-stream.js.map