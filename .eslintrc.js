module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: 'airbnb-base',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    'immutable',
  ],
  rules: {
    'immutable/no-mutation': 1,
    'no-underscore-dangle': 0,
    'no-plusplus': 0,
    'import/extensions': 0,
  },
};
