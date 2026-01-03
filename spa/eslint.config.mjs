
import eslint from '@eslint/js';
import react from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';

export default tseslint.config({
    extends: [
        eslint.configs.recommended,
        ...tseslint.configs.strict,
    ],
    files: [
        '**/*.ts','**/*.tsx',
    ],
    plugins: {
        react,
    },
    rules: {
        'brace-style': ['error', '1tbs'],
        'max-len': ['error', { 'code': 120 }],
        'no-multiple-empty-lines': ['error', {'max': 1}],
        'no-trailing-spaces': 'error',
        'quotes': ['error', 'single', { 'avoidEscape': true }],
        'semi': 'error',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-extraneous-class': 'off',
        '@typescript-eslint/explicit-module-boundary-types': ['error', {
            'allowArgumentsExplicitlyTypedAsAny': true,
        }],
        ... react.configs.recommended.rules,
        'react/react-in-jsx-scope': 'off',
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
});
