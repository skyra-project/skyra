import { GuildSettings } from '#lib/database';
import { envParseBoolean } from '#lib/env';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, UserPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { LongWidthSpace } from '#utils/constants';
import { requiresLevel } from '#utils/decorators';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import { chunk, isNullish, Nullish } from '@sapphire/utilities';
import { GuildMember, MessageEmbed, Permissions } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	enabled: envParseBoolean('REDIS_ENABLED'),
	cooldown: 20,
	description: LanguageKeys.Commands.Misc.AfkDescription,
	extendedHelp: LanguageKeys.Commands.Misc.AfkExtended,
	runIn: ['text', 'news'],
	subCommands: ['ignore', 'reset', 'clear', 'list', 'show', { input: 'set', default: true }]
})
export class UserCommand extends SkyraCommand {
	public async ignore(message: GuildMessage, args: SkyraCommand.Args) {
		const key = this.getKey(message.member);
		const raw = await this.context.afk.get(key);
		if (raw === null) this.error(LanguageKeys.Commands.Misc.AfkNotSetSelf);

		const channel = args.finished ? message.channel : await args.pick('textOrNewsChannelName');
		const value = JSON.parse(raw) as AfkEntry;
		const index = (value.channels ??= []).indexOf(channel.id);
		if (index === -1) {
			value.channels.push(channel.id);
			await this.insert(key, value);
			return message.send(args.t(LanguageKeys.Commands.Misc.AfkAddedIgnoredChannel, { channel: channel.toString() }));
		}

		value.channels.splice(index, 1);
		await this.insert(key, value);
		return message.send(args.t(LanguageKeys.Commands.Misc.AfkRemovedIgnoredChannel, { channel: channel.toString() }));
	}

	public reset(message: GuildMessage, args: SkyraCommand.Args) {
		return args.finished ? this.resetSelf(message, args) : this.resetUser(message, args);
	}

	public async clear(message: GuildMessage, args: SkyraCommand.Args) {
		if (args.finished) return this.clearSelf(message, args);

		const allResult = await args.pickResult(UserCommand.all);
		return allResult.success ? this.clearAll(message, args) : this.clearUser(message, args);
	}

	@requiresLevel(PermissionLevels.Moderator, LanguageKeys.Commands.Misc.AfkPermissionLevelList)
	public async list(message: GuildMessage, args: SkyraCommand.Args) {
		const entries = await this.fetchEntries(this.getTemplate(message.member), false);
		if (entries.size === 0) this.error(LanguageKeys.Commands.Misc.AfkNoEntries);

		const entriesPerPage = 20;
		const display = new UserPaginatedMessage({
			template: new MessageEmbed()
				.setAuthor(message.guild.name, message.guild.iconURL({ size: 128, format: 'png', dynamic: true }) ?? undefined)
				.setTitle(args.t(LanguageKeys.Commands.Misc.AfkListTitle))
				.setColor(await this.context.db.fetchColor(message))
				.setFooter(` - ${args.t(LanguageKeys.Commands.Misc.AfkListFooter, { count: entries.size })}`)
				.setTimestamp()
		});

		let i = 0;
		for (const page of chunk([...entries.entries()], entriesPerPage)) {
			display.addPageEmbed((embed) => embed.setDescription(this.generatePage(page, i)));
			i += entriesPerPage;
		}

		return display.start(message);
	}

	public async show(message: GuildMessage, args: SkyraCommand.Args) {
		const member = args.finished ? message.member : await args.pick('member');
		const [, entry] = await this.fetchEntry(member, message.member === member);
		return message.send(
			new MessageEmbed()
				.setAuthor(`${entry.name} (${member.id})`, member.user.displayAvatarURL({ size: 128, dynamic: true, format: 'png' }))
				.setColor(await this.context.db.fetchColor(message))
				.setDescription(entry.content)
				.setFooter(args.t(LanguageKeys.Commands.Misc.AfkShowFooter))
				.setTimestamp()
		);
	}

	public async set(message: GuildMessage, args: SkyraCommand.Args) {
		const content = args.finished ? args.t(LanguageKeys.Commands.Misc.AfkDefault) : await args.rest('string', { maximum: 100 });

		const [prefix, force, roleID] = await message.guild.readSettings((settings) => [
			settings[GuildSettings.Afk.Prefix] ?? args.t(LanguageKeys.Commands.Misc.AfkPrefix),
			settings[GuildSettings.Afk.PrefixForce],
			settings[GuildSettings.Afk.Role]
		]);
		const name = this.removeAfkPrefix(message.member.displayName, prefix);

		await Promise.all([this.addNickName(message.member, name, prefix, force), this.addRole(message.member, roleID)]);
		await this.saveAfkMessage(message.member, name, content);

		return message.send(args.t(LanguageKeys.Commands.Misc.AfkSet));
	}

	private async addNickName(member: GuildMember, name: string, prefix: string, force: boolean) {
		const me = member.guild.me!;

		// If Skyra does not have permissions to manage nicknames, return:
		if (!me.permissions.has(Permissions.FLAGS.MANAGE_NICKNAMES)) return;

		// If the target member is the guild owner, skip:
		if (member.isGuildOwner()) return;

		// If the target member has higher role hierarchy than Skyra, skip:
		if (member.roles.highest.position >= me.roles.highest.position) return;

		if (!force && prefix.length + name.length >= 32) return;
		await member.setNickname(`${prefix} ${name}`.slice(0, 32));
	}

	private async addRole(member: GuildMember, roleID: string | Nullish) {
		if (isNullish(roleID)) return;

		const role = member.guild.roles.cache.get(roleID);
		if (role === undefined) {
			await member.guild.writeSettings([[GuildSettings.Afk.Role, null]]);
			return;
		}

		if (role.position >= member.guild.me!.roles.highest.position) {
			return;
		}

		const { roles } = member;
		if (!roles.cache.has(role.id)) {
			await roles.add(role.id);
		}
	}

	private async saveAfkMessage(member: GuildMember, name: string, content: string) {
		await this.insert(this.getKey(member), { time: Date.now(), name, content });
	}

	private removeAfkPrefix(name: string, prefix: string) {
		return name.startsWith(prefix) ? name.slice(prefix.length + 1) : name;
	}

	private async resetSelf(message: GuildMessage, args: SkyraCommand.Args) {
		await this.handleResetAfk(args, message.member, true);
		return message.send(args.t(LanguageKeys.Commands.Misc.AfkResetSelf));
	}

	@requiresLevel(PermissionLevels.Moderator, LanguageKeys.Commands.Misc.AfkPermissionLevelResetUser)
	private async resetUser(message: GuildMessage, args: SkyraCommand.Args) {
		const member = await args.pick('member');
		if (member.id === message.member.id) return this.resetSelf(message, args);

		await this.handleResetAfk(args, member, false);
		return message.send(args.t(LanguageKeys.Commands.Misc.AfkReset, { user: member.toString() }), { allowedMentions: { roles: [], users: [] } });
	}

	private async handleResetAfk(args: SkyraCommand.Args, member: GuildMember, targetIsSelf: boolean) {
		const key = this.getKey(member);
		const raw = await this.context.afk.get(key);
		if (raw === null) {
			this.error(targetIsSelf ? LanguageKeys.Commands.Misc.AfkNotSetSelf : LanguageKeys.Commands.Misc.AfkNotSet, { user: member.toString() });
		}

		return this.handleResetAfkWithEntry(args, key, JSON.parse(raw));
	}

	private async handleResetAfkWithEntry(args: SkyraCommand.Args, key: string, value: AfkEntry) {
		value.content = args.t(LanguageKeys.Commands.Misc.AfkDefault);
		await this.insert(key, value);
	}

	private async clearSelf(message: GuildMessage, args: SkyraCommand.Args) {
		await this.handleClearAfk(message.member, true);
		return message.send(args.t(LanguageKeys.Commands.Misc.AfkClearSelf));
	}

	@requiresLevel(PermissionLevels.Moderator, LanguageKeys.Commands.Misc.AfkPermissionLevelClearUser)
	private async clearUser(message: GuildMessage, args: SkyraCommand.Args) {
		const member = await args.pick('member');
		if (member.id === message.member.id) return this.clearSelf(message, args);

		await this.handleClearAfk(member, false);
		return message.send(args.t(LanguageKeys.Commands.Misc.AfkClear, { user: member.toString() }), { allowedMentions: { roles: [], users: [] } });
	}

	@requiresLevel(PermissionLevels.Moderator, LanguageKeys.Commands.Misc.AfkPermissionLevelClearAll)
	private async clearAll(message: GuildMessage, args: SkyraCommand.Args) {
		const template = this.getTemplate(message.member);
		const entries = await this.fetchEntries(template);
		if (entries.size === 0) this.error(LanguageKeys.Commands.Misc.AfkNoEntries);

		const roleID = await this.getRole(message.member);
		await message.send(args.t(LanguageKeys.Commands.Misc.AfkClearAllStarting, { count: entries.size }));
		let i = 0;
		let failed = 0;

		const idOffset = template.length - 1;
		const members = message.guild.members.cache;
		for (const [id, value] of entries) {
			const member = members.get(id.slice(idOffset));
			if (member === undefined) await this.context.afk.del(id);
			else await this.handleClearAfkWithEntry(member, id, value, roleID).catch(() => ++failed);

			if (++i % 10 === 0) {
				const percentage = (i / entries.size) * 100;
				await message.send(args.t(LanguageKeys.Commands.Misc.AfkClearAllProgress, { count: i, percentage: Math.round(percentage) }));
			}
		}

		const totalLine = i === failed ? '' : args.t(LanguageKeys.Commands.Misc.AfkClearAllTotal, { count: i });
		const failedLine = failed === 0 ? '' : `\n${args.t(LanguageKeys.Commands.Misc.AfkClearAllFailed, { count: failed })}`;

		// We're done!
		const embed = new MessageEmbed()
			.setColor(await this.context.db.fetchColor(message))
			.setTitle(args.t(LanguageKeys.Commands.Misc.AfkClearAllTitle))
			.setDescription(totalLine + failedLine);
		return message.send(null, embed);
	}

	private async handleClearAfk(member: GuildMember, targetIsSelf: boolean) {
		const key = this.getKey(member);
		const raw = await this.context.afk.get(key);
		if (raw === null) {
			this.error(targetIsSelf ? LanguageKeys.Commands.Misc.AfkNotSetSelf : LanguageKeys.Commands.Misc.AfkNotSet, { user: member.toString() });
		}

		const roleID = await this.getRole(member);
		return this.handleClearAfkWithEntry(member, key, JSON.parse(raw), roleID);
	}

	private async handleClearAfkWithEntry(member: GuildMember, key: string, value: AfkEntry, roleID: string | null) {
		await this.context.afk.del(key);
		await this.handleClearNickName(member, value.name);
		await this.handleClearRole(member, roleID);
	}

	private async handleClearRole(member: GuildMember, roleID: string | null) {
		if (roleID === null) return;

		const { roles } = member;
		if (roles.cache.has(roleID)) {
			await roles.remove(roleID);
		}
	}

	private async handleClearNickName(member: GuildMember, name: string) {
		// If the target member is the guild's owner, return:
		if (member.isGuildOwner()) return;

		const me = member.guild.me!;

		// If Skyra does not have permissions to manage nicknames, return:
		if (!me.permissions.has(Permissions.FLAGS.MANAGE_NICKNAMES)) return;

		// If the target member has higher role hierarchy than Skyra, return:
		if (member.roles.highest.position >= me.roles.highest.position) return;

		await member.setNickname(name);
	}

	private generatePage(entries: [string, AfkEntry][], index: number) {
		const lines: string[] = [];
		for (const [id, value] of entries) {
			lines.push(`❯ \`${++index}\`: **${value.name}** (\`${id}\`)`, `${LongWidthSpace}└─ ${value.content}`);
		}

		return lines.join('\n');
	}

	private async fetchEntry(member: GuildMember, targetIsSelf: boolean): Promise<[string, AfkEntry]> {
		const key = this.getKey(member);
		const raw = await this.context.afk.get(key);
		if (raw === null) {
			this.error(targetIsSelf ? LanguageKeys.Commands.Misc.AfkNotSetSelf : LanguageKeys.Commands.Misc.AfkNotSet, { user: member.toString() });
		}

		return [key, JSON.parse(raw)];
	}

	private async fetchEntries(template: string, fullKeys = true) {
		const values = new Map<string, AfkEntry>();

		const keys = await this.fetchKeys(template);
		if (keys.length === 0) return values;

		const rawValues = await this.context.afk.mget(...keys);

		const keyIterator = keys.values();
		const offset = fullKeys ? 0 : template.length - 1;
		for (const rawValue of rawValues) {
			const id = keyIterator.next().value as string;
			if (rawValue !== null) values.set(offset === 0 ? id : id.slice(offset), JSON.parse(rawValue));
		}

		return values;
	}

	private async fetchKeys(template: string) {
		const users = new Set<string>();
		const cache = this.context.afk;

		let cursor = '0';
		do {
			// `scan` returns a tuple with the next cursor (which must be used for the
			// next iteration) and an array of the matching keys. The iterations end when
			// cursor becomes '0' again.
			const response = await cache.scan(cursor, 'MATCH', template);
			[cursor] = response;

			for (const key of response[1]) {
				users.add(key);
			}
		} while (cursor !== '0');

		return [...users];
	}

	private async getRole(member: GuildMember) {
		const roleID = await member.guild.readSettings(GuildSettings.Afk.Role);
		return this.handleRole(member, roleID);
	}

	private async handleRole(member: GuildMember, roleID: string | Nullish) {
		if (isNullish(roleID)) return null;

		const role = member.guild.roles.cache.get(roleID);
		if (role === undefined) {
			await member.guild.writeSettings([[GuildSettings.Afk.Role, null]]);
			return null;
		}

		return role.id;
	}

	private getTemplate(member: GuildMember) {
		return `afk:${member.guild.id}:*`;
	}

	private getKey(member: GuildMember) {
		return `afk:${member.guild.id}:${member.id}`;
	}

	private insert(key: string, value: AfkEntry) {
		return this.context.afk.psetex(key, Time.Day, JSON.stringify(value));
	}

	private static readonly all = Args.make<true>(async (parameter, { argument, args }) => {
		if (parameter.toLowerCase() === args.t(LanguageKeys.Arguments.All)) return Args.ok(true);
		return Args.error({ argument, parameter });
	});
}

interface AfkEntry {
	time: number;
	name: string;
	content: string;
	channels?: string[];
}
