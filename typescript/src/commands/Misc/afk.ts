import { envParseBoolean } from '#lib/env';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { GuildMessage } from '#lib/types';
import { ApplyOptions } from '@sapphire/decorators';
import { Time } from '@sapphire/time-utilities';
import { GuildMember, Permissions } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	enabled: envParseBoolean('REDIS_ENABLED'),
	cooldown: 20,
	description: LanguageKeys.Commands.Misc.AfkDescription,
	extendedHelp: LanguageKeys.Commands.Misc.AfkExtended,
	runIn: ['text', 'news']
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const content = args.finished ? args.t(LanguageKeys.Commands.Misc.AfkDefault) : await args.rest('string', { maximum: 100 });
		const name = this.removeAfkPrefix(message.member.displayName, args);

		await this.appendNickNamePrefix(message.member, name, args);
		await this.saveAfkMessage(message.member, name, content);

		return message.send(args.t(LanguageKeys.Commands.Misc.AfkSet));
	}

	private async appendNickNamePrefix(member: GuildMember, name: string, args: SkyraCommand.Args) {
		const me = member.guild.me!;

		// If Skyra does not have permissions to manage nicknames, return:
		if (!me.permissions.has(Permissions.FLAGS.MANAGE_NICKNAMES)) return;

		// If the target member is the guild owner, skip:
		if (member.isGuildOwner()) return;

		// If the target member has higher role hierarchy than Skyra, skip:
		if (member.roles.highest.position >= me.roles.highest.position) return;

		const prefix = args.t(LanguageKeys.Commands.Misc.AfkPrefix);
		if (prefix.length + name.length > 31) return;
		await member.setNickname(`${prefix} ${name}`);
	}

	private async saveAfkMessage(member: GuildMember, name: string, content: string) {
		const entry: AfkEntry = { time: Date.now(), name, content };
		await this.context.afk.psetex(`afk:${member.guild.id}:${member.id}`, Time.Day, JSON.stringify(entry));
	}

	private removeAfkPrefix(name: string, args: SkyraCommand.Args) {
		const prefix = args.t(LanguageKeys.Commands.Misc.AfkPrefix);
		return name.startsWith(prefix) ? name.slice(prefix.length + 1) : name;
	}
}

interface AfkEntry {
	time: number;
	name: string;
	content: string;
}
