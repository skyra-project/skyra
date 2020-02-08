import { LanguageStore as InternalLanguageStore } from 'klasa';
import { createClient } from './MockClient';

export class MockLanguageStore extends InternalLanguageStore {

	public constructor(client: ReturnType<typeof createClient>, name: string, holds: any) {
		super(client, name, holds);
	}

}

export function createLanguageStore(client: ReturnType<typeof createClient>, name: string, holds: any): InternalLanguageStore {
	return new MockLanguageStore(client, name, holds) as unknown as InternalLanguageStore;
}
