import { GuildEntity, GuildSettings, readSettings } from '#lib/database';
import { api } from '#lib/discord/Api';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { HardPunishment, ModerationListener, SelfModeratorBitField } from '#lib/moderation';
import { Events } from '#lib/types/Enums';
import { floatPromise, seconds } from '#utils/common';
import { Colors } from '#utils/constants';
import { deleteMessage, getEmojiReactionFormat, SerializedEmoji } from '#utils/functions';
import type { LLRCData } from '#utils/LongLivingReactionCollector';
import { twemoji } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import type { ListenerOptions } from '@sapphire/framework';
import { fetchT, sendLocalized } from '@sapphire/plugin-i18next';
import { hasAtLeastOneKeyInMap, Nullish, PickByValue } from '@sapphire/utilities';
import { GuildMember, MessageEmbed, Permissions } from 'discord.js';

type ArgumentType = [data: LLRCData, reaction: SerializedEmoji, channelId: string | Nullish, blockedReactions: string[]];

@ApplyOptions<ListenerOptions>({ event: Events.RawReactionAdd })
export class UserModerationEvent extends ModerationListener<ArgumentType, unknown> {
	protected keyEnabled: PickByValue<GuildEntity, boolean> = GuildSettings.Selfmod.Reactions.Enabled;
	protected softPunishmentPath: PickByValue<GuildEntity, number> = GuildSettings.Selfmod.Reactions.SoftAction;
	protected hardPunishmentPath: HardPunishment = {
		action: GuildSettings.Selfmod.Reactions.HardAction,
		actionDuration: GuildSettings.Selfmod.Reactions.HardActionDuration,
		adder: 'reactions'
	};

	public async run(data: LLRCData, emoji: SerializedEmoji) {
		const [enabled, blockedReactions, logChannelId, ignoredChannels, softAction, hardAction, adder] = await readSettings(
			data.guild,
			(settings) => [
				settings[GuildSettings.Selfmod.Reactions.Enabled],
				settings[GuildSettings.Selfmod.Reactions.Blocked],
				settings[GuildSettings.Channels.Logs.Moderation],
				settings[GuildSettings.Channels.Ignore.ReactionAdd],
				settings[GuildSettings.Selfmod.Reactions.SoftAction],
				settings[GuildSettings.Selfmod.Reactions.HardAction],
				settings.adders[this.hardPunishmentPath.adder]
			]
		);

		if (!enabled || blockedReactions.length === 0 || ignoredChannels.includes(data.channel.id)) return;

		const member = await data.guild.members.fetch(data.userId);
		if (member.user.bot || (await this.hasPermissions(member))) return;

		const args = [data, emoji, logChannelId, blockedReactions] as const;
		const preProcessed = this.preProcess(args);
		if (preProcessed === null) return;

		this.processSoftPunishment(args, preProcessed, new SelfModeratorBitField(softAction));

		if (!adder) return this.processHardPunishment(data.guild, data.userId, hardAction);

		try {
			const points = typeof preProcessed === 'number' ? preProcessed : 1;
			adder.add(data.userId, points);
		} catch {
			await this.processHardPunishment(data.guild, data.userId, hardAction);
		}
	}

	protected preProcess([, emoji, , blockedReactions]: Readonly<ArgumentType>) {
		return blockedReactions.includes(emoji) ? 1 : null;
	}

	protected onDelete([data, emoji]: Readonly<ArgumentType>) {
		floatPromise(
			api()
				.channels(data.channel.id)
				.messages(data.messageId)
				.reactions(getEmojiReactionFormat(emoji), data.userId)
				.delete({ reason: '[MODERATION] Automatic Removal of Blocked Emoji.' })
		);
	}

	protected onAlert([data]: Readonly<ArgumentType>) {
		floatPromise(
			sendLocalized(data.channel, { keys: LanguageKeys.Events.Reactions.Filter, formatOptions: { user: `<@${data.userId}>` } }).then(
				(message) => deleteMessage(message, seconds(15))
			)
		);
	}

	protected async onLogMessage([data]: Readonly<ArgumentType>) {
		const user = await this.container.client.users.fetch(data.userId);
		const t = await fetchT(data.guild);
		return new MessageEmbed()
			.setColor(Colors.Red)
			.setAuthor({ name: `${user.tag} (${user.id})`, iconURL: user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }) })
			.setThumbnail(
				data.emoji.id === null
					? `https://twemoji.maxcdn.com/72x72/${twemoji(data.emoji.name!)}.png`
					: `https://cdn.discordapp.com/emojis/${data.emoji.id}.${data.emoji.animated ? 'gif' : 'png'}?size=64`
			)
			.setDescription(`[${t(LanguageKeys.Misc.JumpTo)}](https://discord.com/channels/${data.guild.id}/${data.channel.id}/${data.messageId})`)
			.setFooter({ text: `${data.channel.name} | ${t(LanguageKeys.Events.Reactions.FilterFooter)}` })
			.setTimestamp();
	}

	protected onLog(args: Readonly<ArgumentType>) {
		this.container.client.emit(
			Events.GuildMessageLog,
			args[0].guild,
			args[2],
			GuildSettings.Channels.Logs.Moderation,
			this.onLogMessage.bind(this, args)
		);
	}

	private async hasPermissions(member: GuildMember) {
		const roles = await readSettings(member, GuildSettings.Roles.Moderator);
		return roles.length === 0 ? member.permissions.has(Permissions.FLAGS.BAN_MEMBERS) : hasAtLeastOneKeyInMap(member.roles.cache, roles);
	}
}
