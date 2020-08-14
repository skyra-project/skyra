import { Client, LanguageStore as InternalLanguageStore } from 'klasa';

export class MockLanguageStore extends InternalLanguageStore {
	public constructor(client: Client, name: string, holds: any) {
		super(client, name, holds);
	}
}

export function createLanguageStore(...[client, name, holds]: ConstructorParameters<typeof MockLanguageStore>): InternalLanguageStore {
	return new MockLanguageStore(client, name, holds) as InternalLanguageStore;
}
