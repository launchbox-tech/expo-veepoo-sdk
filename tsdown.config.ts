import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/plugin/index.ts'],
  format: 'cjs',
  outDir: 'build',
  dts: false,
  sourcemap: true,
  clean: true,
  splitting: false,
  deps: {
    neverBundle: ['expo-modules-core', 'expo', 'react', 'react-native'],
  },
  rolldownOptions: {
    output: { exports: 'named' },
  },
});
