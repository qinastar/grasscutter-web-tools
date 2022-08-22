module.exports = {
  extends: [
    'eslint:recommended',
    'airbnb'
  ],
  plugins: [
    'react-hooks'
  ],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
  },
  globals: {
    window: true,
    document: true,
    WebSocket: true,
  },
  rules: {
    'import/no-import-module-exports': 'off',
    'react/jsx-props-no-spreading': 'off',
    'no-console': 'warn',
    'no-nested-ternary': 'warn',
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'no-trailing-spaces': 'off',
    'no-bitwise': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/tabindex-no-positive': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'off',
    'react/jsx-one-expression-per-line': 'off',
    'react/no-unused-prop-types': 'warn',
    'no-multi-spaces': 'off',
    'spaced-comment': 'off',
    'react/jsx-closing-tag-location': 'off',
    'react/jsx-wrap-multilines': 'off',
    'react/jsx-filename-extension': ['error', { extensions: ['.tsx', '.jsx'] }],
    'no-confusing-arrow': ['error', { allowParens: true }],
    'no-plusplus': 'off',
    'react/no-find-dom-node': 'warn',
    'prefer-template': 'warn',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/webpack/**/*.js'
        ],
      }
    ],
    'import/no-deprecated': 'error',
    'import/no-dynamic-require': 'off',
    'import/prefer-default-export': 'off',
    'import/order': ['error',
      {
        groups: [
          ['builtin', 'external'],
          'internal',
          ['parent', 'sibling', 'index']
        ],
      }
    ],
    'react/prop-types': [
      'error',
      {
        ignore: ['children'],
        customValidators: [],
        skipUndeclared: true,
      }
    ],
    'react/sort-comp': ['error', {
      order: [
        'static-methods',
        'lifecycle',
        'everything-else',
        '/^on.+$/',
        '/^handle.+$/',
        '/^.+[rR]enderer$/',
        '/^render.+$/',
        'render'
      ],
    }],
    'global-require': 'off',
    'no-return-assign': ['error', 'except-parens'],
    'no-unused-expressions': [
      'error',
      {
        allowShortCircuit: true,
        allowTernary: true,
      }
    ],
    'arrow-body-style': 'off',
    'class-methods-use-this': 'off',
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message: 'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
      {
        selector: 'LabeledStatement',
        message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      }
    ],
    'no-unused-vars': [
      'warn',
      {
        varsIgnorePattern: '[Ll]ogger',
        ignoreRestSiblings: true,
      }
    ],
    // 'no-magic-numbers': [
    //   'warn',
    //   {
    //     enforceConst: true,
    //     ignore: [-1, 0, 1],
    //     ignoreArrayIndexes: true,
    //   }
    // ],
    'no-warning-comments': [
      'warn',
      {
        terms: ['todo', 'fixme'],
        location: 'anywhere',
      }
    ],
    camelcase: [
      'error',
      {
        properties: 'never',
      }
    ],
    'func-names': ['error', 'as-needed'],
    'comma-dangle': [
      'error',
      {
        functions: 'never',
        arrays: 'never',
        imports: 'never',
        exports: 'never',
        objects: 'always-multiline',
      }
    ],
  },
};
