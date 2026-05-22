#!/usr/bin/env node
/**
 * Bootstrap for the contract-check entrypoint emitted by
 * `tsconfig.tools.json`. The compiled `.js` files preserve `@/*` import
 * specifiers from source — tsc does not rewrite paths. Node has no native
 * support for the alias, so we install a `Module._resolveFilename` shim that
 * remaps `@/*` to `build/*` before requiring the real entrypoint.
 *
 * Used by `package.json` `check:*` scripts.
 */
const Module = require("module");
const path = require("path");

const buildRoot = path.join(__dirname, "..", "build");
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  if (typeof request === "string" && request.startsWith("@/")) {
    return origResolve.call(this, path.join(buildRoot, request.slice(2)), parent, ...rest);
  }
  return origResolve.call(this, request, parent, ...rest);
};

require(path.join(buildRoot, "bridge-contract", "run-contract-checks.js"));
