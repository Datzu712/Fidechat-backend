// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import standardJS from 'eslint-config-love';

export default tseslint.config(
    {
        ignores: ['eslint.config.mjs', './src/common/logger'], // I should change my custom logger to pino logger some day
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    eslintPluginPrettierRecommended,
    standardJS,
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
            sourceType: 'commonjs',
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        rules: {
            '@typescript-eslint/interface-name-prefix': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': 'warn',
            'array-callback-return': 1,
            semi: ['warn', 'always'],
            'no-void': 0,
            '@typescript-eslint/no-confusing-void-expression': 0,
            'prettier/prettier': 2,
            '@typescript-eslint/adjacent-overload-signatures': 'error',
            '@typescript-eslint/ban-ts-comment': 'error',
            'no-case-declarations': 'warn',
            'no-sparse-arrays': 'warn',
            'no-regex-spaces': 'error',
            'use-isnan': 'error',
            'no-fallthrough': 'error',
            'no-empty-pattern': 'error',
            'no-redeclare': 'off',
            'no-self-assign': 'error',
            '@typescript-eslint/semi': 0,
            '@typescript-eslint/indent': 0,
            'eslint@typescript-eslint/member-delimiter-style': 0,
            strict: 'off',
            '@typescript-eslint/strict-boolean-expressions': 0,
            '@typescript-eslint/prefer-nullish-coalescing': 0,
            '@typescript-eslint/no-non-null-assertion': 0,
            'sort-imports': [
                'warn',
                {
                    ignoreCase: true,
                    ignoreDeclarationSort: true,
                },
            ],
            'no-undef': 'off',
            'no-console': 'off',
            '@typescript-eslint/no-magic-numbers': 'off',
            'no-implicit-globals': 'off',
            '@typescript-eslint/prefer-destructuring': 'off',
            '@typescript-eslint/class-methods-use-this': 'off',
            '@typescript-eslint/no-floating-promises': 'warn',
            '@typescript-eslint/no-unsafe-argument': 'warn',
            '@typescript-eslint/return-await': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-type-assertion': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
        },
    },
);
