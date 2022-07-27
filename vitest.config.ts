import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	resolve: {
		alias: [{ find: '#lib', replacement: resolve('src/lib') }]
	},
	test: {
		globals: true,
		coverage: {
			enabled: true,
			reporter: ['text', 'lcov', 'clover'],
			include: ['./src/lib/**/*.ts']
		}
	}
});
