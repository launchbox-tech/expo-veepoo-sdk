"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Parity between `VeepooEventPayload` and the runtime event set is enforced
// in `src/bridge/event-registry.ts` via
// `EVENT_DEFINITIONS satisfies { [K in VeepooEvent]: EventDef<K> }`.
// Adding or removing an event in one place without the other is a TS error
// there — this file does not need a separate runtime-vs-type check.
//# sourceMappingURL=events.js.map