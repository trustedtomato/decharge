module.exports = {
  env: {
    es2021: true,
    node: true
  },
  extends: [
    'preact',
    'standard'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    'no-useless-constructor': 1,
    'react/display-name': [0],
    'react/no-danger': 0
  }
}
