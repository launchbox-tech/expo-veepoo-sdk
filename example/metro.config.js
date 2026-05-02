const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Required only for local `file:..` package linking in this monorepo.
config.watchFolders = [path.resolve(__dirname, "..")];
if (config.resolver.unstable_enableSymlinks != null) {
  config.resolver.unstable_enableSymlinks = true;
}

module.exports = config;
