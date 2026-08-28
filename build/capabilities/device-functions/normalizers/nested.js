"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readDeclaredFields = readDeclaredFields;
const primitives_1 = require("../../../shared/primitives");
/**
 * Reads a nested native package (`{ package2: { … } }`) through the declared
 * field table.
 *
 * Only declared keys are kept: a native key that no interface declares used to
 * be spread through verbatim behind a cast, which is how twelve camelCase keys
 * reached JS under names nothing could read (#210). An absent field stays
 * absent — never defaulted to `0` or `'unknown'` — so callers can still tell
 * "the band did not report it" from a real value.
 */
function readDeclaredFields(nested, fields) {
    const result = {};
    for (const [key, value] of Object.entries(nested)) {
        const kind = fields[key];
        if (kind === undefined || value === undefined || value === null)
            continue;
        result[key] = kind === 'number' ? (0, primitives_1.toInt)(value) : (0, primitives_1.normalizeFunctionStatus)(value);
    }
    return result;
}
//# sourceMappingURL=nested.js.map