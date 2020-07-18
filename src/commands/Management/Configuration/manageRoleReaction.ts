import { codeBlock } from '@klasa/utils';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { api } from '@utils/Models/Api';
import { resolveEmoji } from '@utils/util';
import { Role } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['mrr'],
	bucket: 2,
	cooldown: 10,
	description: language => language.tget('COMMAND_MANAGEROLEREACTION_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_MANAGEROLEREACTION_EXTENDED'),
	permissionLevel: PermissionLevels.Administrator,
	requiredPermissions: ['ADD_REACTIONS', 'READ_MESSAGE_HISTORY'],
	runIn: ['text'],
	subcommands: true,
	usage: '<add|remove|reset|show:default> (role:rolename) (emoji:emoji)',
	usageDelim: ' '
})
@CreateResolvers([
	[
		'emoji', async (arg, _, message, [action]) => {
			if (action === 'show' || action === 'reset') return undefined;
			if (!arg) throw message.language.tget('COMMAND_MANAGEROLEREACTION_REQUIRED_REACTION');

			const emoji = resolveEmoji(arg);
			if (emoji === null) throw message.language.tget('COMMAND_TRIGGERS_INVALIDREACTION');

			try {
				await message.react(emoji);
				return emoji;
			} catch {
				throw message.language.tget('COMMAND_TRIGGERS_INVALIDREACTION');
			}
		}
	],
	[
		'rolename', (arg, possible, message, [action]) => {
			if (action !== 'add') return undefined;
			if (!arg) throw message.language.tget('COMMAND_MANAGEROLEREACTION_REQUIRED_ROLE');
			return message.client.arguments.get('rolename')!.run(arg, possible, message);
		}
	]
])
export default class extends SkyraCommand {

	public async show(message: KlasaMessage) {
		const list = new Set(message.guild!.settings.get(GuildSettings.Roles.Reactions));
		const oldLength = list.size;
		if (!list.size) throw message.language.tget('COMMAND_MANAGEROLEREACTION_LIST_EMPTY');
		const lines: string[] = [];
		for (const entry of list) {
			const role = message.guild!.roles.get(entry.role);
			if (role) lines.push(`${role.name.padEnd(25, ' ')} :: ${entry.emoji}`);
			else list.delete(entry);
		}
		if (oldLength !== list.size) {
			await message.guild!.settings.update(GuildSettings.Roles.Reactions, [...list], {
				arrayAction: 'overwrite',
				extraContext: { author: message.author.id }
			});
		}
		if (!lines.length) throw message.language.tget('COMMAND_MANAGEROLEREACTION_LIST_EMPTY');
		return message.sendMessage(codeBlock('asciicode', lines.join('\n')));
	}

	public async add(message: KlasaMessage, [role, reaction]: [Role, string]) {
		if (this.checkRoleReaction(message, reaction, role.id)) throw message.language.tget('COMMAND_MANAGEROLEREACTION_EXISTS');
		await message.guild!.settings.update(GuildSettings.Roles.Reactions, { emoji: reaction, role: role.id }, {
			arrayAction: 'add',
			extraContext: { author: message.author.id }
		});
		if (message.guild!.settings.get(GuildSettings.Roles.MessageReaction)) {
			await this.reactMessage(
				message.guild!.settings.get(GuildSettings.Channels.Roles),
				message.guild!.settings.get(GuildSettings.Roles.MessageReaction),
				reaction
			);
		}
		return message.sendLocale('COMMAND_MANAGEROLEREACTION_ADD');
	}

	public async remove(message: KlasaMessage, [, reaction]: [Role, string]) {
		const list = message.guild!.settings.get(GuildSettings.Roles.Reactions);
		if (!list.length) throw message.language.tget('COMMAND_MANAGEROLEREACTION_LIST_EMPTY');
		const entry = list.find(en => en.emoji === reaction);
		if (!entry) throw message.language.tget('COMMAND_MANAGEROLEREACTION_REMOVE_NOTEXISTS');
		await message.guild!.settings.update(GuildSettings.Roles.Reactions, entry, {
			arrayAction: 'remove',
			extraContext: { author: message.author.id }
		});
		return message.sendLocale('COMMAND_MANAGEROLEREACTION_REMOVE');
	}

	public async reset(message: KlasaMessage) {
		const list = message.guild!.settings.get(GuildSettings.Roles.Reactions);
		if (!list.length) throw message.language.tget('COMMAND_MANAGEROLEREACTION_LIST_EMPTY');
		await message.guild!.settings.reset(GuildSettings.Roles.Reactions);
		return message.sendLocale('COMMAND_MANAGEROLEREACTION_RESET');
	}

	private reactMessage(channelID: string, messageID: string, reaction: string) {
		return api(this.client)
			.channels(channelID)
			.messages(messageID)
			.reactions(this.client.emojis.resolveIdentifier(reaction)!, '@me')
			.put();
	}

	private checkRoleReaction(message: KlasaMessage, reaction: string, roleID: string) {
		const list = message.guild!.settings.get(GuildSettings.Roles.Reactions);
		if (list.length) for (const entry of list) if (entry.emoji === reaction || entry.role === roleID) return true;
		return false;
	}

}
