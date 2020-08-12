import { KlasaClient } from 'klasa';

export function rest(client: KlasaClient) {
	return ((client as unknown) as { rest: Rest }).rest;
}

interface Rest {
	cdn: {
		Avatar(id: string, avatar: string): string;
		DefaultAvatar(discriminator: number): string;
	};
}
