import '#root/config';
import { client } from '#mocks/MockInstances';
import { TimerManager } from '@sapphire/time-utilities';

afterAll(() => {
	client.destroy();
	TimerManager.destroy();
});
