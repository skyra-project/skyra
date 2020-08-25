import Collection, { CollectionConstructor } from '@discordjs/collection';
import { RequestHandler } from '@klasa/request-handler';
import { CLIENT_ID } from '@root/config';
import { APIErrors } from '@utils/constants';
import { resolveOnErrorCodes } from '@utils/util';
import { GuildMember, Role } from 'discord.js';
import { KlasaGuild } from 'klasa';

export class MemberTags extends Collection<string, MemberTag> {
	public readonly kGuild: KlasaGuild;
	private kFetchAllPromise: Promise<void> | null = null;
	private readonly kRequestHandler: RequestHandler<string, GuildMember>;

	public constructor(guild: KlasaGuild) {
		super();
		this.kGuild = guild;
		this.kRequestHandler = new RequestHandler<string, GuildMember>(this.requestHandlerGet.bind(this), this.requestHandlerGetAll.bind(this));
	}

	public create(member: GuildMember) {
		const tag: MemberTag = {
			nickname: member.nickname || null,
			joinedAt: member.joinedTimestamp,
			roles: this.getRawRoles(member)
		};
		super.set(member.id, tag);
		this.kGuild.client.userTags.create(member.user);
		return tag;
	}

	public getFirstKeyFromUserName(username: string) {
		for (const [key, value] of this.kGuild.client.userTags) {
			if (username === value.username) return key;
		}

		return null;
	}

	public getKeyFromTag(tag: string) {
		const pieces = tag.split('#');
		if (pieces.length !== 2 || pieces[1].length !== 4) return;

		const [username, discriminator] = pieces;
		for (const [key, value] of this.kGuild.client.userTags) {
			if (username === value.username && discriminator === value.discriminator) return key;
		}

		return null;
	}

	public async fetch(id: string): Promise<MemberTag | null>;
	public async fetch(): Promise<this>;
	public async fetch(id?: string): Promise<MemberTag | null | this> {
		if (typeof id === 'undefined') {
			if (this.kFetchAllPromise === null) {
				this.kFetchAllPromise = this.fetchAll();
			}

			await this.kFetchAllPromise;
			return this;
		}

		const existing = this.get(id);
		if (typeof existing !== 'undefined') return existing;

		const member = await resolveOnErrorCodes(this.kRequestHandler.push(id), APIErrors.UnknownMember);
		return member ? this.create(member) : null;
	}

	public mapUsernames() {
		const output = new Collection<string, string>();
		for (const key of this.keys()) {
			const userTag = this.kGuild.client.userTags.get(key);
			if (typeof userTag !== 'undefined') output.set(key, userTag.username);
		}

		return output;
	}

	public *manageableMembers() {
		const skyraHighestRole = this.getSkyraHighestRole();
		if (skyraHighestRole === null) throw new Error('Unreachable.');

		const skyraPosition = skyraHighestRole.position;
		const nonManageableRoles = this.kGuild.roles.filter((role) => role.position >= skyraPosition);
		if (nonManageableRoles.size === 0) {
			yield* this.entries();
		} else {
			for (const tag of this.entries()) {
				if (tag[1].roles.some((role) => nonManageableRoles.has(role))) continue;
				if (tag[0] === this.kGuild.ownerID) continue;
				yield tag;
			}
		}
	}

	public static get [Symbol.species](): CollectionConstructor {
		return (Collection as unknown) as CollectionConstructor;
	}

	private async fetchAll() {
		try {
			const members = await this.kGuild.members.fetch();
			for (const member of members.values()) this.create(member);
		} finally {
			this.kFetchAllPromise = null;
		}
	}

	private getRawRoles(member: GuildMember) {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const casted = (member as unknown) as { _roles: string[] } & GuildMember;
		return casted._roles;
	}

	private getSkyraHighestRole() {
		const guildSelfMember = this.kGuild.me;
		if (guildSelfMember !== null) return guildSelfMember.roles.highest;

		const rawGuildSelfMember = this.get(CLIENT_ID);
		if (typeof rawGuildSelfMember === 'undefined') return null;

		let highest: Role | null = null;
		for (const roleID of rawGuildSelfMember.roles) {
			const role = this.kGuild.roles.get(roleID);
			if (typeof role === 'undefined') continue;

			if (highest === null || highest.position < role.position) highest = role;
		}

		return highest;
	}

	private requestHandlerGet(id: string) {
		return this.kGuild.members.fetch(id);
	}

	private requestHandlerGetAll(ids: readonly string[]) {
		return Promise.all(ids.map((id) => this.kGuild.members.fetch(id)));
	}
}

export interface MemberTag {
	nickname: string | null;
	joinedAt: number | null;
	roles: readonly string[];
}
