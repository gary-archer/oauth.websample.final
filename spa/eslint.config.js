
import eslint from '@eslint/js';
import react from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';

export default tseslint.config({
    files: [
        '**/*.ts','**/*.tsx',
    ],
    plugins: {
        react,
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
    extends: [
        eslint.configs.strict,
        ...tseslint.configs.strict,
    ],
    rules: {
        '@typescript-eslint/explicit-module-boundary-types': ['error', {
            'allowArgumentsExplicitlyTypedAsAny': true,
        }],  
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-extraneous-class': 'off',
        '@typescript-eslint/quotes': ['error', 'single', { 'avoidEscape': true }],
        'brace-style': ['error', '1tbs'],
        'indent': 'error',
        'max-len': ['error', { 'code': 120 }],
        'no-multiple-empty-lines': ['error', {'max': 1}],
        'no-trailing-spaces': 'error',
        'semi': 'error',
        ...react.configs.recommended.rules,
    },
});
