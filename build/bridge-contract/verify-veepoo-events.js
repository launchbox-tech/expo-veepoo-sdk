"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractKotlinNativeEvents = extractKotlinNativeEvents;
exports.extractSwiftNativeEvents = extractSwiftNativeEvents;
exports.sliceSwiftEventsHeader = sliceSwiftEventsHeader;
exports.setDiff = setDiff;
exports.verifyVeepooEventsContract = verifyVeepooEventsContract;
const fs_1 = require("fs");
const path_1 = require("path");
const event_registry_1 = require("../bridge/event-registry");
/** Kotlin `VeepooSDKConstants.kt` event string literals (excludes TAG). */
function extractKotlinNativeEvents(source) {
    const out = new Set();
    for (const m of source.matchAll(/const val (\w+) = "([^"]+)"/g)) {
        const name = m[1];
        const value = m[2];
        if (!name || !value)
            continue;
        if (name === "TAG")
            continue;
        out.add(value);
    }
    return out;
}
/** Swift event-constants file: `= "eventName"` string literals only. */
function extractSwiftNativeEvents(swiftHeader) {
    const out = new Set();
    for (const m of swiftHeader.matchAll(/= "([^"]+)"/g)) {
        const s = m[1];
        if (s && /^[a-z][a-zA-Z0-9]*$/.test(s))
            out.add(s);
    }
    return out;
}
/**
 * Until #194 the event constants lived inside VeepooSDK.swift and the
 * verifier had to slice the top of the file. They now live in their own
 * VeepooEvents.swift, but we keep this helper so older callers that still
 * pass the whole module file see the same behaviour: take everything up to
 * the permission-delegate marker if present, otherwise the whole file.
 */
function sliceSwiftEventsHeader(swiftSource) {
    const marker = "// MARK: - 权限";
    const idx = swiftSource.indexOf(marker);
    if (idx === -1)
        return swiftSource;
    return swiftSource.slice(0, idx);
}
function setDiff(a, b) {
    const onlyA = [...a].filter(x => !b.has(x)).sort();
    const onlyB = [...b].filter(x => !a.has(x)).sort();
    return { onlyA, onlyB };
}
function verifyVeepooEventsContract(repoRoot) {
    const errors = [];
    const expectedNative = new Set(event_registry_1.NATIVE_EMITTED_EVENTS);
    const kotlinPath = (0, path_1.join)(repoRoot, "android/src/main/kotlin/expo/modules/veepoo/VeepooSDKConstants.kt");
    const kotlin = extractKotlinNativeEvents((0, fs_1.readFileSync)(kotlinPath, "utf8"));
    const swiftPath = (0, path_1.join)(repoRoot, "ios/VeepooSDK/VeepooEvents.swift");
    const swift = extractSwiftNativeEvents(sliceSwiftEventsHeader((0, fs_1.readFileSync)(swiftPath, "utf8")));
    const checks = [
        ["Kotlin VeepooSDKConstants.kt", expectedNative, kotlin],
        ["Swift VeepooEvents.swift", expectedNative, swift],
    ];
    for (const [label, exp, act] of checks) {
        const { onlyA, onlyB } = setDiff(exp, act);
        if (onlyA.length || onlyB.length) {
            errors.push(`${label}: mismatch — missing ${JSON.stringify(onlyA)}; extra ${JSON.stringify(onlyB)}`);
        }
    }
    for (const e of event_registry_1.JS_LOCAL_ONLY_EVENTS) {
        if (expectedNative.has(e)) {
            errors.push(`jsLocalOnly event "${e}" must not appear in NATIVE_EMITTED_EVENTS`);
        }
    }
    return errors;
}
//# sourceMappingURL=verify-veepoo-events.js.map