import Collection, { CollectionConstructor } from '@discordjs/collection';
import { KlasaGuild } from 'klasa';
import { APIErrors } from '../constants';
import { GuildMember } from 'discord.js';

export class MemberNicknames extends Collection<string, string | null> {

	public readonly guild: KlasaGuild;

	public constructor(guild: KlasaGuild) {
		super();
		this.guild = guild;
	}

	public create(member: GuildMember) {
		super.set(member.id, member.nickname || null);
		this.guild.client.userTags.create(member.user);
		return member.nickname;
	}

	public getFirstKeyFromUserName(username: string) {
		for (const [key, value] of this.guild.client.userTags) {
			if (username === value.username) return key;
		}

		return null;
	}

	public getKeyFromTag(tag: string) {
		const pieces = tag.split('#');
		if (pieces.length !== 2 || pieces[1].length !== 4) return;

		const [username, discriminator] = pieces;
		for (const [key, value] of this.guild.client.userTags) {
			if (username === value.username && discriminator === value.discriminator) return key;
		}

		return null;
	}

	public async fetch(id: string): Promise<string | null>;
	public async fetch(): Promise<this>;
	public async fetch(id?: string): Promise<string | null | this> {
		if (typeof id === 'undefined') {
			const members = await this.guild.members.fetch();
			for (const member of members.values()) this.create(member);
			return this;
		}

		const existing = this.get(id);
		if (typeof existing !== 'undefined') return existing;

		try {
			const member = await this.guild.members.fetch(id);
			return this.create(member);
		} catch (error) {
			if (error.code === APIErrors.UnknownMember) return null;
			throw error;
		}
	}

	public mapUsernames() {
		const output = new Collection<string, string>();
		for (const key of this.keys()) {
			const userTag = this.guild.client.userTags.get(key);
			if (typeof userTag !== 'undefined') output.set(key, userTag.username);
		}

		return output;
	}

	public static get [Symbol.species](): CollectionConstructor {
		return Collection as unknown as CollectionConstructor;
	}

}
