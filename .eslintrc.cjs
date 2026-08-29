module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    // A leading underscore is this repo's existing marker for a binding that
    // exists only to be discarded — the omit-by-destructuring idiom
    // (`const { dropped: _dropped, ...rest } = obj`) and unused callback args
    // such as the full-match group in `String.replace`. The convention was in
    // the code before it was in the config; this makes the linter agree.
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
  },
  env: {
    es2021: true,
    node: true,
  },
  ignorePatterns: [
    'build/',
    'android/',
    'ios/',
    'node_modules/',
    'example/',
  ],
  overrides: [
    {
      files: ['**/__tests__/**/*.ts', '**/*.test.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};
