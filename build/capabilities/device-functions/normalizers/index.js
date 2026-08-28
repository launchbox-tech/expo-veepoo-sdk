"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeDeviceFunctions = normalizeDeviceFunctions;
const primitives_1 = require("../../../shared/primitives");
const package1_1 = require("./package1");
const package2_1 = require("./package2");
const package3_1 = require("./package3");
const package4_5_1 = require("./package4-5");
function normalizeDeviceFunctions(value) {
    const record = (0, primitives_1.isRecord)(value) ? value : {};
    // package4/5 have no flat-record form — each returns undefined unless the
    // payload nests it — so they are added only when present, keeping the
    // three-package shape callers see today.
    const package4 = (0, package4_5_1.normalizePackage4)(record);
    const package5 = (0, package4_5_1.normalizePackage5)(record);
    return {
        package1: (0, package1_1.normalizePackage1)(record),
        package2: (0, package2_1.normalizePackage2)(record),
        package3: (0, package3_1.normalizePackage3)(record),
        ...(package4 ? { package4 } : {}),
        ...(package5 ? { package5 } : {}),
    };
}
//# sourceMappingURL=index.js.map