import Collection, { CollectionConstructor } from '@discordjs/collection';
import { KlasaGuild } from 'klasa';
import { APIErrors } from '../constants';
import { GuildMember } from 'discord.js';

export class MemberTags extends Collection<string, MemberTag> {

	public readonly guild: KlasaGuild;

	public constructor(guild: KlasaGuild) {
		super();
		this.guild = guild;
	}

	public create(member: GuildMember) {
		const tag: MemberTag = {
			nickname: member.nickname || null,
			roles: this.getRawRoles(member)
		};
		super.set(member.id, tag);
		this.guild.client.userTags.create(member.user);
		return tag;
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

	public async fetch(id: string): Promise<MemberTag | null>;
	public async fetch(): Promise<this>;
	public async fetch(id?: string): Promise<MemberTag | null | this> {
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

	private getRawRoles(member: GuildMember) {
		const casted = member as unknown as { _roles: string[] } & GuildMember;
		return casted._roles;
	}

}

export interface MemberTag {
	nickname: string | null;
	roles: readonly string[];
}
