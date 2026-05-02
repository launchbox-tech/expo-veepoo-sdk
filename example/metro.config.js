// Metro does not read tsconfig `paths`. The example imports `expo-veepoo-sdk` while the
// parent package name is `@gaozh1024/expo-veepoo-sdk`, so the default resolver can fail.
//
// `file:..` symlinks the whole repo under node_modules; watching the entire parent tree
// pulls in `…/expo-veepoo-sdk/example/node_modules/…` recursively (Watchman "File name too long").
// We resolve the module to `../src` and only watch library roots we need.
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const libraryRoot = path.resolve(projectRoot, "..");
const librarySourceEntry = path.join(libraryRoot, "src/index.ts");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

config.watchFolders = [
  path.join(libraryRoot, "src"),
  path.join(libraryRoot, "build"),
  path.join(libraryRoot, "android"),
  path.join(libraryRoot, "ios"),
];

if (config.resolver.unstable_enableSymlinks != null) {
  config.resolver.unstable_enableSymlinks = true;
}

const upstreamResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform, ...rest) => {
  if (moduleName === "expo-veepoo-sdk") {
    return { type: "sourceFile", filePath: librarySourceEntry };
  }
  if (typeof upstreamResolveRequest === "function") {
    return upstreamResolveRequest(context, moduleName, platform, ...rest);
  }
  return context.resolveRequest(context, moduleName, platform, ...rest);
};

/** Breaks Metro symlink crawl: …/node_modules/expo-veepoo-sdk/example/node_modules/… */
const blockNestedLocalInstall =
  /[/\\]expo-veepoo-sdk[/\\]example[/\\]node_modules[/\\]expo-veepoo-sdk([/\\]|$)/;
config.resolver.blockList = [...(config.resolver.blockList ?? []), blockNestedLocalInstall];

module.exports = config;
