import nx from '@nx/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import eslintPrettier from 'eslint-plugin-prettier';
import tseslint from 'typescript-eslint';

const typeAwareConfigs = tseslint.configs.recommendedTypeCheckedOnly.map((config) => ({
    ...config,
    files: config.files ?? ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts'],
    languageOptions: {
        ...(config.languageOptions ?? {}),
        parserOptions: {
            ...(config.languageOptions?.parserOptions ?? {}),
            projectService: true,
            tsconfigRootDir: import.meta.dirname,
        },
    },
    rules: {
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unsafe-argument': 'error',
        '@typescript-eslint/no-unsafe-assignment': 'error',
        '@typescript-eslint/no-unsafe-call': 'error',
        '@typescript-eslint/no-unsafe-member-access': 'error',

        '@typescript-eslint/await-thenable': 'error',
        '@typescript-eslint/no-misused-promises': 'error',
        '@typescript-eslint/promise-function-async': 'warn',

        '@typescript-eslint/prefer-nullish-coalescing': 'warn',

        '@typescript-eslint/no-magic-numbers': 'off',
        '@typescript-eslint/no-extraneous-class': 'off',
        '@typescript-eslint/class-methods-use-this': 'off',
        '@typescript-eslint/prefer-destructuring': 'off',
        '@typescript-eslint/no-unused-vars': 'warn',
    },
}));

export default [
    ...nx.configs['flat/base'],
    ...nx.configs['flat/typescript'],
    ...nx.configs['flat/javascript'],
    ...typeAwareConfigs,
    eslintConfigPrettier,
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        plugins: {
            prettier: eslintPrettier,
        },
        rules: {
            'prettier/prettier': 'error',
            'arrow-body-style': ['error', 'as-needed'],
            'prefer-arrow-callback': 'error',
        },
    },
    {
        ignores: ['**/dist', '**/out-tsc', 'jest.config.cts'],
    },
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        rules: {
            '@nx/enforce-module-boundaries': [
                'error',
                {
                    enforceBuildableLibDependency: true,
                    allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
                    depConstraints: [
                        {
                            sourceTag: '*',
                            onlyDependOnLibsWithTags: ['*'],
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts', '**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],
        // Override or add rules here
        rules: {
            'sort-imports': [
                'warn',
                {
                    ignoreCase: true,
                    ignoreDeclarationSort: true,
                },
            ],
            'no-console': ['error', { allow: ['warn', 'error'] }],
            semi: ['warn', 'always'],
        },
    },
];
