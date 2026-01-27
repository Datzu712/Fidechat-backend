/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { IEnvironmentVariables } from '@/config/env';

declare global {
	namespace NodeJS {
		interface ProcessEnv extends IEnvironmentVariables {}
	}
}

export {};
