import { chunk } from '@klasa/utils';
import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings, ReactionRole } from '@lib/types/settings/GuildSettings';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { LongLivingReactionCollector } from '@utils/LongLivingReactionCollector';
import { displayEmoji, resolveEmoji } from '@utils/util';
import { Guild, MessageEmbed, Role, TextChannel } from 'discord.js';
import { ArrayActions, KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['mrr'],
	bucket: 2,
	cooldown: 10,
	description: language => language.tget('COMMAND_MANAGEREACTIONROLES_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_MANAGEREACTIONROLES_EXTENDED'),
	permissionLevel: PermissionLevels.Administrator,
	runIn: ['text'],
	subcommands: true,
	usage: '<add|remove|reset|show:default> (role:role) (message:messageOrChannel) (reaction:reaction)',
	usageDelim: ' '
})
@CreateResolvers([
	['role', (arg, possible, message, [type]) => type === 'add' || type === 'remove'
		? message.client.arguments.get('rolename')!.run(arg, possible, message)
		: undefined],
	['messageOrChannel', (arg, possible, message, [type]) => type === 'add'
		? arg
			? message.client.arguments.get('textchannelname')!.run(arg, possible, message)
			: undefined
		: type === 'remove'
			? message.client.arguments.get('snowflake')!.run(arg, possible, message)
			: undefined],
	['reaction', (arg, possible, message, [type, , channel]) => type === 'add' && channel
		? message.client.arguments.get('emoji')!.run(arg, possible, message)
		: undefined]
])
export default class extends SkyraCommand {

	public async show(message: KlasaMessage) {
		const reactionRoles = message.guild!.settings.get(GuildSettings.ReactionRoles);
		if (reactionRoles.length === 0) {
			throw message.language.tget('COMMAND_MANAGEREACTIONROLES_SHOW_EMPTY');
		}

		const response = await message.sendEmbed(new MessageEmbed()
			.setDescription(message.language.tget('SYSTEM_LOADING'))
			.setColor(BrandingColors.Secondary));

		const display = new UserRichDisplay(new MessageEmbed()
			.setColor(await DbSet.fetchColor(message)));

		for (const bulk of chunk(reactionRoles, 20)) {
			const serialized = bulk.map(value => this.format(value, message.guild!)).join('\n');
			display.addPage((template: MessageEmbed) => template.setDescription(serialized));
		}

		await display.start(response, message.author.id);
		return response;
	}

	public async add(message: KlasaMessage, [role, channel, emoji]: [Role, TextChannel?, string?]) {
		if (emoji) {
			const reactionRole: ReactionRole = {
				emoji: emoji!,
				message: null,
				channel: channel!.id,
				role: role.id
			};
			await message.guild!.settings.update(GuildSettings.ReactionRoles, reactionRole, {
				arrayAction: ArrayActions.Add,
				extraContext: { author: message.author.id }
			});

			return message.sendLocale('COMMAND_MANAGEREACTIONROLES_ADD_CHANNEL', [displayEmoji(reactionRole.emoji), channel]);
		}

		await message.sendLocale('COMMAND_MANAGEREACTIONROLES_ADD_PROMPT');

		const reaction = await LongLivingReactionCollector.collectOne(this.client, {
			filter: reaction => reaction.userID === message.author.id && reaction.guild.id === message.guild!.id
		});
		if (!reaction) throw message.language.tget('COMMAND_MANAGEREACTIONROLES_ADD_MISSING');

		const reactionRole: ReactionRole = {
			emoji: resolveEmoji(reaction.emoji)!,
			message: reaction.messageID,
			channel: reaction.channel.id,
			role: role.id
		};
		await message.guild!.settings.update(GuildSettings.ReactionRoles, reactionRole, {
			arrayAction: ArrayActions.Add,
			extraContext: { author: message.author.id }
		});

		const url = `<https://discord.com/channels/${message.guild!.id}/${reactionRole.channel}/${reactionRole.message}>`;
		return message.sendLocale('COMMAND_MANAGEREACTIONROLES_ADD', [displayEmoji(reactionRole.emoji), url]);
	}

	public async remove(message: KlasaMessage, [role, messageID]: [Role, string]) {
		const reactionRoles = message.guild!.settings.get(GuildSettings.ReactionRoles);
		const reactionRoleIndex = reactionRoles.findIndex(entry => entry.message === messageID && entry.role === role.id);
		if (reactionRoleIndex === -1) throw message.language.tget('COMMAND_MANAGEREACTIONROLES_REMOVE_NOTEXISTS');

		const reactionRole = reactionRoles[reactionRoleIndex];
		await message.guild!.settings.update(GuildSettings.ReactionRoles, reactionRole, {
			arrayAction: ArrayActions.Remove,
			arrayIndex: reactionRoleIndex,
			extraContext: { author: message.author.id }
		});
		const url = `https://discord.com/channels/${message.guild!.id}/${reactionRole.channel}/${reactionRole.message}`;
		return message.sendLocale('COMMAND_MANAGEREACTIONROLES_REMOVE', [displayEmoji(reactionRole.emoji), url]);
	}

	public async reset(message: KlasaMessage) {
		const reactionRoles = message.guild!.settings.get(GuildSettings.ReactionRoles);
		if (reactionRoles.length === 0) {
			throw message.language.tget('COMMAND_MANAGEREACTIONROLES_RESET_EMPTY');
		}

		await message.guild!.settings.reset(GuildSettings.ReactionRoles, {
			extraContext: { author: message.author.id }
		});
		return message.sendLocale('COMMAND_MANAGEREACTIONROLES_RESET');
	}

	private format(entry: ReactionRole, guild: Guild): string {
		const emoji = displayEmoji(entry.emoji);
		const role = `<@&${entry.role}>`;
		const url = entry.message ? `[🔗](https://discord.com/channels/${guild.id}/${entry.channel}/${entry.message})` : `<#${entry.channel}>`;
		return `${emoji} | ${role} -> ${url}`;
	}

}
