
import {defineConfig, globalIgnores} from 'eslint/config'
import js from '@eslint/js';
import react from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';

export default defineConfig([
    globalIgnores(['dist']),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            js.configs.recommended,
            tseslint.configs.strict,
        ],
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
        plugins: {
            react,
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
]);
