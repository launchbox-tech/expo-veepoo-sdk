"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepSnakeKeys = deepSnakeKeys;
exports.deepCamelKeys = deepCamelKeys;
function toSnakeCase(key) {
    return key
        // pass 1: collapse consecutive-uppercase runs before a capitalised word
        // e.g. "BTState" → "BT_State", "HTMLParser" → "HTML_Parser"
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
        // pass 2: insert underscore at every lower/digit → upper boundary
        // e.g. "deviceId" → "device_Id", "spo2Value" → "spo2_Value"
        .replace(/([a-z\d])([A-Z])/g, '$1_$2')
        .toLowerCase();
}
function toCamelCase(key) {
    return key.replace(/_([a-z\d])/g, (_, c) => c.toUpperCase());
}
function deepSnakeKeys(value) {
    if (Array.isArray(value))
        return value.map(deepSnakeKeys);
    if (value !== null && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value).map(([k, v]) => [
            toSnakeCase(k),
            deepSnakeKeys(v),
        ]));
    }
    return value;
}
function deepCamelKeys(value) {
    if (Array.isArray(value))
        return value.map(deepCamelKeys);
    if (value !== null && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value).map(([k, v]) => [
            toCamelCase(k),
            deepCamelKeys(v),
        ]));
    }
    return value;
}
//# sourceMappingURL=deep-keys.js.map