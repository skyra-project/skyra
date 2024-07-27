import { readSettings, writeSettings, writeSettingsTransaction, type ReactionRole } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraSubcommand } from '#lib/structures';
import { PermissionLevels, type GuildMessage } from '#lib/types';
import { minutes } from '#utils/common';
import { getEmojiString, getEmojiTextFormat } from '#utils/functions';
import { LongLivingReactionCollector } from '#utils/LongLivingReactionCollector';
import { getColor, sendLoadingMessage } from '#utils/util';
import { channelMention, hideLinkEmbed, hyperlink, roleMention } from '@discordjs/builders';
import { ApplyOptions, RequiresClientPermissions } from '@sapphire/decorators';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { chunk } from '@sapphire/utilities';
import { EmbedBuilder, PermissionFlagsBits, type Guild } from 'discord.js';

@ApplyOptions<SkyraSubcommand.Options>({
	aliases: ['mrr', 'managereactionrole', 'managerolereaction', 'managerolereactions'],
	description: LanguageKeys.Commands.Management.ManageReactionRolesDescription,
	detailedDescription: LanguageKeys.Commands.Management.ManageReactionRolesExtended,
	permissionLevel: PermissionLevels.Administrator,
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	subcommands: [
		{ name: 'add', messageRun: 'add' },
		{ name: 'remove', messageRun: 'remove' },
		{ name: 'reset', messageRun: 'reset' },
		{ name: 'show', messageRun: 'show', default: true }
	]
})
export class UserCommand extends SkyraSubcommand {
	public async add(message: GuildMessage, args: SkyraSubcommand.Args) {
		const role = await args.pick('roleName');
		if (!args.finished) {
			const channel = await args.pick('textChannelName');
			const emoji = await args.pick('emoji');
			const reactionRole: ReactionRole = {
				emoji: getEmojiString(emoji),
				message: null,
				channel: channel.id,
				role: role.id
			};

			await writeSettings(message.guild, (settings) => ({
				reactionRoles: settings.reactionRoles.concat(reactionRole)
			}));

			const content = args.t(LanguageKeys.Commands.Management.ManageReactionRolesAddChannel, {
				emoji: getEmojiTextFormat(reactionRole.emoji),
				channel: channel!.toString()
			});
			return send(message, content);
		}

		await send(message, args.t(LanguageKeys.Commands.Management.ManageReactionRolesAddPrompt));

		const reaction = await LongLivingReactionCollector.collectOne({
			filter: (reaction) => reaction.userId === message.author.id && reaction.guild.id === message.guild.id
		});

		if (!reaction) this.error(LanguageKeys.Commands.Management.ManageReactionRolesAddMissing);

		const reactionRole: ReactionRole = {
			emoji: getEmojiString(reaction.emoji),
			message: reaction.messageId,
			channel: reaction.channel.id,
			role: role.id
		};
		await writeSettings(message.guild, (settings) => ({
			reactionRoles: settings.reactionRoles.concat(reactionRole)
		}));

		const url = `<https://discord.com/channels/${message.guild.id}/${reactionRole.channel}/${reactionRole.message}>`;
		const content = args.t(LanguageKeys.Commands.Management.ManageReactionRolesAdd, {
			emoji: getEmojiTextFormat(reactionRole.emoji),
			url
		});
		return send(message, content);
	}

	public async remove(message: GuildMessage, args: SkyraSubcommand.Args) {
		const role = await args.pick('roleName');
		const messageId = await args.pick('snowflake');

		await using trx = await writeSettingsTransaction(message.guild);
		const index = trx.settings.reactionRoles.findIndex((entry) => (entry.message ?? entry.channel) === messageId && entry.role === role.id);
		if (index === -1) this.error(LanguageKeys.Commands.Management.ManageReactionRolesRemoveNotExists);

		const reactionRole = trx.settings.reactionRoles[index];
		await trx.write({ reactionRoles: trx.settings.reactionRoles.toSpliced(index, 1) }).submit();

		const url = reactionRole.message
			? `<https://discord.com/channels/${message.guild.id}/${reactionRole.channel}/${reactionRole.message}>`
			: `<#${reactionRole.channel}>`;

		const content = args.t(LanguageKeys.Commands.Management.ManageReactionRolesRemove, {
			emoji: getEmojiTextFormat(reactionRole.emoji),
			url
		});
		return send(message, content);
	}

	public async reset(message: GuildMessage, args: SkyraSubcommand.Args) {
		await writeSettings(message.guild, { reactionRoles: [] });
		const content = args.t(LanguageKeys.Commands.Management.ManageReactionRolesReset);
		return send(message, content);
	}

	@RequiresClientPermissions(PermissionFlagsBits.EmbedLinks)
	public async show(message: GuildMessage, args: SkyraSubcommand.Args) {
		const settings = await readSettings(message.guild);
		const { reactionRoles } = settings;
		if (reactionRoles.length === 0) {
			this.error(LanguageKeys.Commands.Management.ManageReactionRolesShowEmpty);
		}

		const response = await sendLoadingMessage(message, args.t);

		const display = new PaginatedMessage({
			template: new EmbedBuilder().setColor(getColor(message))
		});

		display.setIdle(minutes(5));
		for (const bulk of chunk(reactionRoles, 15)) {
			const serialized = bulk.map((value) => this.format(value, message.guild)).join('\n');
			display.addPageEmbed((embed) => embed.setDescription(serialized));
		}

		await display.run(response, message.author);
		return response;
	}

	private format(entry: ReactionRole, guild: Guild): string {
		const emoji = getEmojiTextFormat(entry.emoji);
		const role = roleMention(entry.role);
		const url = entry.message
			? hyperlink('🔗', hideLinkEmbed(`https://discord.com/channels/${guild.id}/${entry.channel}/${entry.message}`))
			: channelMention(entry.channel);
		return `${emoji} | ${role} -> ${url}`;
	}
}
