import { GuildSettings, ReactionRole } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, UserPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { LongLivingReactionCollector } from '#utils/LongLivingReactionCollector';
import { displayEmoji, resolveEmoji, sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { chunk } from '@sapphire/utilities';
import { Guild, MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['mrr', 'managereactionrole', 'managerolereaction', 'managerolereactions'],
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Management.ManageReactionRolesDescription,
	extendedHelp: LanguageKeys.Commands.Management.ManageReactionRolesExtended,
	permissionLevel: PermissionLevels.Administrator,
	runIn: ['text'],
	subCommands: ['add', 'remove', 'reset', { input: 'show', default: true }]
})
export class UserCommand extends SkyraCommand {
	public async add(message: GuildMessage, args: SkyraCommand.Args) {
		const role = await args.pick('roleName');
		if (!args.finished) {
			const channel = await args.pick('textChannelName');
			const emoji = await args.pick('emoji');
			const reactionRole: ReactionRole = {
				emoji: emoji!,
				message: null,
				channel: channel.id,
				role: role.id
			};

			await message.guild.writeSettings((settings) => {
				settings[GuildSettings.ReactionRoles].push(reactionRole);
			});

			return message.send(
				args.t(LanguageKeys.Commands.Management.ManageReactionRolesAddChannel, {
					emoji: displayEmoji(reactionRole.emoji),
					channel: channel!.toString()
				})
			);
		}

		await message.send(args.t(LanguageKeys.Commands.Management.ManageReactionRolesAddPrompt));

		const reaction = await LongLivingReactionCollector.collectOne({
			filter: (reaction) => reaction.userID === message.author.id && reaction.guild.id === message.guild.id
		});
		if (!reaction) this.error(LanguageKeys.Commands.Management.ManageReactionRolesAddMissing);

		const reactionRole: ReactionRole = {
			emoji: resolveEmoji(reaction.emoji)!,
			message: reaction.messageID,
			channel: reaction.channel.id,
			role: role.id
		};
		await message.guild.writeSettings((settings) => {
			settings[GuildSettings.ReactionRoles].push(reactionRole);
		});

		const url = `<https://discord.com/channels/${message.guild.id}/${reactionRole.channel}/${reactionRole.message}>`;
		return message.send(args.t(LanguageKeys.Commands.Management.ManageReactionRolesAdd, { emoji: displayEmoji(reactionRole.emoji), url }));
	}

	public async remove(message: GuildMessage, args: SkyraCommand.Args) {
		const role = await args.pick('roleName');
		const messageID = await args.pick('snowflake');

		const reactionRole = await message.guild.writeSettings((settings) => {
			const reactionRoles = settings[GuildSettings.ReactionRoles];

			const reactionRoleIndex = reactionRoles.findIndex((entry) => (entry.message ?? entry.channel) === messageID && entry.role === role.id);

			if (reactionRoleIndex === -1) this.error(LanguageKeys.Commands.Management.ManageReactionRolesRemoveNotExists);

			const removedReactionRole = reactionRoles[reactionRoleIndex];
			reactionRoles.splice(reactionRoleIndex, 1);

			return removedReactionRole;
		});

		const url = reactionRole.message
			? `<https://discord.com/channels/${message.guild.id}/${reactionRole.channel}/${reactionRole.message}>`
			: `<#${reactionRole.channel}>`;

		return message.send(args.t(LanguageKeys.Commands.Management.ManageReactionRolesRemove, { emoji: displayEmoji(reactionRole.emoji), url }));
	}

	public async reset(message: GuildMessage, args: SkyraCommand.Args) {
		await message.guild.writeSettings((settings) => {
			const reactionRoles = settings[GuildSettings.ReactionRoles];

			if (reactionRoles.length === 0) {
				this.error(LanguageKeys.Commands.Management.ManageReactionRolesResetEmpty);
			}

			reactionRoles.length = 0;
		});

		return message.send(args.t(LanguageKeys.Commands.Management.ManageReactionRolesReset));
	}

	public async show(message: GuildMessage, args: SkyraCommand.Args) {
		const reactionRoles = await message.guild.readSettings(GuildSettings.ReactionRoles);
		if (reactionRoles.length === 0) {
			this.error(LanguageKeys.Commands.Management.ManageReactionRolesShowEmpty);
		}

		const response = await sendLoadingMessage(message, args.t);

		const display = new UserPaginatedMessage({ template: new MessageEmbed().setColor(await this.context.db.fetchColor(message)) });

		for (const bulk of chunk(reactionRoles, 15)) {
			const serialized = bulk.map((value) => this.format(value, message.guild)).join('\n');
			display.addPageEmbed((template) => template.setDescription(serialized));
		}

		await display.start(response as GuildMessage, message.author);
		return response;
	}

	private format(entry: ReactionRole, guild: Guild): string {
		const emoji = displayEmoji(entry.emoji);
		const role = `<@&${entry.role}>`;
		const url = entry.message ? `[🔗](https://discord.com/channels/${guild.id}/${entry.channel}/${entry.message})` : `<#${entry.channel}>`;
		return `${emoji} | ${role} -> ${url}`;
	}
}
