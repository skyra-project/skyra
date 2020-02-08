import { client } from './MockInstances';

afterAll(() => {
	client.destroy();
});
