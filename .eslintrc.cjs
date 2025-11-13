module.exports = {
  root: true,
  extends: ['next/core-web-vitals'],
  parserOptions: {
    ecmaVersion: 2023,
    sourceType: 'module',
  },
  rules: {
    'react/jsx-key': ['warn', { checkFragmentShorthand: true }],
    'no-console': ['warn', { allow: ['error', 'warn'] }],
    '@next/next/no-img-element': 'off',
    'react/no-unescaped-entities': 'off',
  },
}
