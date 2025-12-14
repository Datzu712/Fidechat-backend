import { createDefaultPreset } from 'ts-jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';
import type { Config } from 'jest';

const tsJestTransformCfg = createDefaultPreset().transform;

export default <Config>{
    testEnvironment: 'node',
    transform: {
        ...tsJestTransformCfg,
    },
    testMatch: ['**/*.spec.ts', '**/*.test.ts', '**/*.e2e-spec.ts'],
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    modulePaths: [compilerOptions.baseUrl],
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths /*, { prefix: '<rootDir>/' } */),
    forceExit: true, // todo: remove this when jest issue is resolved
};
