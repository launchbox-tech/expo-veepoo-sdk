/** Copy JSON contract into build/ so Node CLI and Metro can resolve it next to emitted .js. */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const src = path.join(root, "src/bridge-contract/native-rejection-codes.json");
const destDir = path.join(root, "build/bridge-contract");
const dest = path.join(destDir, "native-rejection-codes.json");

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
