export async function setup() {
	await import('#lib/setup');
}

export async function teardown() {
	const { client } = await import('./mocks/MockInstances');

	client.destroy();
}
