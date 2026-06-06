"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireNonEmptyString = requireNonEmptyString;
exports.requireInRange = requireInRange;
exports.requireValidHour = requireValidHour;
exports.requireValidMinute = requireValidMinute;
function fail(message) {
    throw { code: 'INVALID_ARGUMENT', message };
}
function requireNonEmptyString(value, field) {
    if (typeof value !== 'string' || value.trim().length === 0) {
        fail(`${field} must be a non-empty string`);
    }
}
function requireInRange(value, field, min, max) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
        fail(`${field} must be between ${min} and ${max}`);
    }
}
function requireValidHour(value, field) {
    requireInRange(value, field, 0, 23);
}
function requireValidMinute(value, field) {
    requireInRange(value, field, 0, 59);
}
//# sourceMappingURL=assertions.js.map