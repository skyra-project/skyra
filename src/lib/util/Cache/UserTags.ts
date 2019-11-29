import Collection, { CollectionConstructor } from '@discordjs/collection';
import { KlasaClient } from 'klasa';
import { User } from 'discord.js';
import { APIUserData } from '../../types/DiscordAPI';
import { api } from '../Models/Api';

export class UserTags extends Collection<string, UserTag> {

	public readonly client: KlasaClient;

	public constructor(client: KlasaClient) {
		super();
		this.client = client;
	}

	public getFirstKeyFromUserName(username: string) {
		for (const [key, value] of this.entries()) {
			if (username === value.username) return key;
		}

		return null;
	}

	public getKeyFromTag(tag: string) {
		const pieces = tag.split('#');
		if (pieces.length !== 2 || pieces[1].length !== 4) return;

		const [username, discriminator] = pieces;
		for (const [key, value] of this.entries()) {
			if (username === value.username && discriminator === value.discriminator) return key;
		}

		return null;
	}

	public create(user: APIUserData | User) {
		const tag: UserTag = {
			avatar: user.avatar,
			username: user.username,
			discriminator: user.discriminator
		};
		super.set(user.id, tag);
		return tag;
	}

	public fetch(id: string) {
		const existing = super.get(id);
		if (typeof existing !== 'undefined') return Promise.resolve(existing);

		return (api(this.client)
			.users(id)
			.get() as Promise<APIUserData>)
			.then(this.create.bind(this));
	}

	public fetchUsername(id: string) {
		return this.fetch(id).then(tag => tag.username);
	}

	public fetchEntry(id: string) {
		const existing = super.get(id);
		if (typeof existing !== 'undefined') return Promise.resolve([id, existing] as const);

		return (api(this.client)
			.users(id)
			.get() as Promise<APIUserData>)
			.then(data => [id, this.create(data)]);
	}

	public static get [Symbol.species](): CollectionConstructor {
		return Collection as unknown as CollectionConstructor;
	}

}

export interface UserTag {
	readonly avatar: string | null;
	readonly username: string;
	readonly discriminator: string;
}
