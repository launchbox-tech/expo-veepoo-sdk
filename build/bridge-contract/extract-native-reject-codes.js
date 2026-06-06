"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractNativeRejectCodes = extractNativeRejectCodes;
const fs_1 = require("fs");
const path_1 = require("path");
const REJECT_FIRST_ARG = /\.reject\s*\(\s*"([A-Z][A-Z0-9_]*)"/g;
function walkFiles(dir, ext, out) {
    for (const name of (0, fs_1.readdirSync)(dir)) {
        if (name === "Pods" || name === "build")
            continue;
        const p = (0, path_1.join)(dir, name);
        const st = (0, fs_1.statSync)(p);
        if (st.isDirectory())
            walkFiles(p, ext, out);
        else if (name.endsWith(ext))
            out.push(p);
    }
}
/** Collect unique first-arg string codes passed to `.reject("CODE"` in native bridge sources. */
function extractNativeRejectCodes(repoRoot) {
    const files = [];
    walkFiles((0, path_1.join)(repoRoot, "android/src/main/kotlin/expo/modules/veepoo"), ".kt", files);
    walkFiles((0, path_1.join)(repoRoot, "ios/VeepooSDK"), ".swift", files);
    const codes = new Set();
    for (const file of files) {
        const src = (0, fs_1.readFileSync)(file, "utf8");
        let m;
        const re = new RegExp(REJECT_FIRST_ARG.source, "g");
        while ((m = re.exec(src)) !== null) {
            const code = m[1];
            if (code)
                codes.add(code);
        }
    }
    return codes;
}
//# sourceMappingURL=extract-native-reject-codes.js.map