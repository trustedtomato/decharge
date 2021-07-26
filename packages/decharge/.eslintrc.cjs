module.exports = {
  env: {
    es2021: true,
    node: true,
    browser: true
  },
  globals: {
    expect: false
  },
  extends: [
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
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': ['error']
  }
}
