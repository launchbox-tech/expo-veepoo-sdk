"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passthrough = void 0;
exports.wrapInner = wrapInner;
const primitives_1 = require("../shared/primitives");
/** Identity normalizer for events whose envelope needs no value-level rewriting. */
const passthrough = () => (raw) => raw;
exports.passthrough = passthrough;
/**
 * Spread the envelope, replace one inner-payload field with its normalized
 * shape. `fallbackKey` lets a few events tolerate native sending the inner
 * payload under either of two camelCase keys.
 */
function wrapInner(field, normalize, options) {
    return (raw) => {
        const p = (0, primitives_1.isRecord)(raw) ? raw : {};
        const primary = p[field];
        const value = options?.fallbackKey !== undefined && primary === undefined
            ? p[options.fallbackKey]
            : primary;
        return { ...p, [field]: normalize(value) };
    };
}
//# sourceMappingURL=event-envelope.js.map