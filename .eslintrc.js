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
    'no-console': process.env.NODE_ENV === 'production' ? [ 'error', { allow: [ 'warn', 'error' ] } ] : 0,
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
        '**/*.js'
      ],
      'parserOptions': {
        'ecmaVersion': 7,
        'sourceType': 'module'
      }
    },
    {
      'files': [
        '**/*.ts',
        '**/*.tsx',
        '**/*.vue' // Vue files are expected to be written in TS
      ],
      'extends': [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
      'parserOptions': {
        'parser': '@typescript-eslint/parser',
        'project': 'tsconfig.json',
        'extraFileExtensions': [ '.vue' ]
      },
      'rules': {
        // Support for optional chaining
        // See https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-unused-expressions.md
        'no-unused-expressions': 'off',
        '@typescript-eslint/no-unused-expressions': [ 'error' ],

        '@typescript-eslint/explicit-function-return-type': 'off',

        // Constraining rules added by @typescript-eslint/eslint-plugin@3.5.0
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off'
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
        'array-bracket-spacing': [ 'warn', 'always' ],
        'vue/array-bracket-spacing': [ 'warn', 'always' ],
        'vue/arrow-spacing': 'warn',
        'vue/max-attributes-per-line': [ 'error', {
          'singleline': 3,
          'multiline': {
            'max': 1,
            'allowFirstLine': false
          }
        } ],

        // Support for optional chaining
        // See https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-unused-expressions.md
        'no-unused-expressions': 'off',
        '@typescript-eslint/no-unused-expressions': [ 'error' ],

        // allow console and debugger in development
        'no-console': process.env.NODE_ENV === 'production' ? [ 'error', { allow: [ 'warn', 'error' ] } ] : 0,
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 0
      }
    }
  ]
}
