const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..");

// Required only for local `file:..` package linking in this monorepo.
config.watchFolders = [workspaceRoot];
if (config.resolver.unstable_enableSymlinks != null) {
  config.resolver.unstable_enableSymlinks = true;
}

// The linked local package resolves at its REAL path in the repo root, which
// has its own copies of these singletons (bun auto-installs peerDependencies
// there for the library's own dev/tooling). Resolving the package's
// `require("react")` against the repo-root node_modules loads a SECOND React
// instance, which breaks hooks ("Invalid hook call" / "useRef of null").
// Force every singleton to the example app's single copy.
const singletons = [
  "react",
  "react-dom",
  "react-native",
  "expo",
  "expo-modules-core",
];
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  ...Object.fromEntries(
    singletons.map((name) => [name, path.join(projectRoot, "node_modules", name)])
  ),
};

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const existingBlockList = config.resolver.blockList
  ? Array.isArray(config.resolver.blockList)
    ? config.resolver.blockList
    : [config.resolver.blockList]
  : [];
config.resolver.blockList = [
  ...existingBlockList,
  // Block the repo-root duplicates so resolution falls back to extraNodeModules.
  new RegExp(
    `^${escapeRegExp(path.join(workspaceRoot, "node_modules"))}/(?:${singletons
      .map(escapeRegExp)
      .join("|")})/.*$`
  ),
];

module.exports = config;
