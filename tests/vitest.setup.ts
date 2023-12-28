import '#lib/setup';
import { client } from './mocks/MockInstances.js';

afterAll(async () => {
	await client.destroy();
});
