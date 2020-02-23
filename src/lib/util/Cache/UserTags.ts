import Collection, { CollectionConstructor } from '@discordjs/collection';
import { APIUserData } from '@lib/types/DiscordAPI';
import { User } from 'discord.js';
import { KlasaClient } from 'klasa';
import { RequestHandler } from '@klasa/request-handler';

export class UserTags extends Collection<string, UserTag> {

	public readonly client: KlasaClient;
	private readonly kRequestHandler = new RequestHandler<string, APIUserData>(
		this.requestHandlerGet.bind(this),
		this.requestHandlerGetAll.bind(this)
	);

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
			discriminator: user.discriminator,
			bot: user.bot
		};
		super.set(user.id, tag);
		return tag;
	}

	public async fetch(id: string) {
		const existing = super.get(id);
		if (typeof existing !== 'undefined') return existing;

		const user = await this.kRequestHandler.push(id);
		return this.create(user);
	}

	public async fetchUsername(id: string) {
		const userTag = await this.fetch(id);
		return userTag.username;
	}

	public async fetchEntry(id: string) {
		const userTag = await this.fetch(id);
		return [id, userTag] as const;
	}

	public static get [Symbol.species](): CollectionConstructor {
		return Collection as unknown as CollectionConstructor;
	}

	private requestHandlerGet(id: string) {
		return this.client.users.fetch(id);
	}

	private requestHandlerGetAll(ids: readonly string[]) {
		return Promise.all(ids.map(id => this.requestHandlerGet(id)));
	}

}

export interface UserTag {
	readonly avatar: string | null;
	readonly username: string;
	readonly discriminator: string;
	readonly bot?: boolean;
}
