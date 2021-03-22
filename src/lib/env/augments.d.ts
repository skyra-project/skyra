import type { SkyraEnv } from './types';

declare global {
	namespace NodeJS {
		interface ProcessEnv extends SkyraEnv {}
	}
}
