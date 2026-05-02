import { mock } from "bun:test";

/** Bun's runner loads real `react-native` (Flow `import typeof`), which it cannot parse. Mock before any SUT import. */
mock.module("react-native", () => ({
  Platform: { OS: "ios" as const },
}));

mock.module("expo-modules-core", () => ({
  requireNativeModule: () => ({}),
}));
