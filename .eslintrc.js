module.exports = {
  'root': true,
  'env': {
    'node': true
  },
  'extends': [
    'eslint:recommended',
  ],
  'rules': {
    'array-bracket-spacing': [ 'warn', 'always' ],
    'arrow-spacing': 'warn',

    // allow console and debugger in development
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 0,
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 0
  },
  'overrides': [
    {
      'files': [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      'env': {
        'jest': true
      }
    },
    {
      'files': [
        '**/*.ts',
        '**/*.tsx',
        '**/*.vue' // Vue files are expected to be written in TS
      ],
      'extends': [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
      'parserOptions': {
        'parser': '@typescript-eslint/parser',
        'project': './tsconfig.json'
      },
      'rules': {
        "@typescript-eslint/explicit-function-return-type": 'off'
      }
    },
    {
      'files': [
        '**/*.vue'
      ],
      'extends': [
        'plugin:vue/recommended',
        '@vue/standard',
        '@vue/typescript/recommended',
      ],
      'rules': {
        'vue/array-bracket-spacing': [ 'warn', 'always' ],
        'vue/arrow-spacing': 'warn'
      }
    }
  ]
}
