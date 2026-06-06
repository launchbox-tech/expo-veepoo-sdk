"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePackage4 = normalizePackage4;
exports.normalizePackage5 = normalizePackage5;
const primitives_1 = require("../../../shared/primitives");
function normalizePackage4(record) {
    if (!(0, primitives_1.isRecord)(record.package4))
        return undefined;
    return Object.fromEntries(Object.entries(record.package4).map(([key, item]) => [key, (0, primitives_1.normalizeFunctionStatus)(item)]));
}
function normalizePackage5(record) {
    if (!(0, primitives_1.isRecord)(record.package5))
        return undefined;
    return Object.fromEntries(Object.entries(record.package5).map(([key, item]) => [key, (0, primitives_1.normalizeFunctionStatus)(item)]));
}
//# sourceMappingURL=package4-5.js.map