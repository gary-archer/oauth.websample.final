
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config({
    files: ['**/*.ts'],
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
        'brace-style': ['error', '1tbs'],
        'indent': 'error',
        'max-len': ['error', { 'code': 120 }],
        'no-multiple-empty-lines': ['error', {'max': 1}],
        'no-trailing-spaces': 'error',
        'quotes': ['error', 'single', { 'avoidEscape': true }],
        'semi': 'error',
    },
});
