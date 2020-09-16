import { KlasaClient } from 'klasa';

export function rest(client: KlasaClient) {
	return Reflect.get(client, 'rest') as Rest;
}

interface Rest {
	cdn: {
		Avatar(id: string, avatar: string): string;
		DefaultAvatar(discriminator: number): string;
	};
}
