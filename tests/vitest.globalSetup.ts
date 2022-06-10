export async function setup() {
	await import('#lib/setup');
}

export async function teardown() {
	const { client } = await import('./common/MockInstances');

	client.destroy();
}
