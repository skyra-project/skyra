import { GuildEntity, GuildSettings } from '#lib/database';
import { api } from '#lib/discord/Api';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { HardPunishment, ModerationEvent, SelfModeratorBitField } from '#lib/moderation';
import type { KeyOfType } from '#lib/types';
import { Colors } from '#lib/types/Constants';
import { Events } from '#lib/types/Enums';
import { hasAtLeastOneKeyInMap } from '#utils/comparators';
import { MessageLogsEnum } from '#utils/constants';
import type { LLRCData } from '#utils/LongLivingReactionCollector';
import { floatPromise, twemoji } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import type { EventOptions } from '@sapphire/framework';
import { GuildMember, MessageEmbed, Permissions } from 'discord.js';

type ArgumentType = [LLRCData, string];

@ApplyOptions<EventOptions>({ event: Events.RawReactionAdd })
export class UserModerationEvent extends ModerationEvent<ArgumentType, unknown> {
	protected keyEnabled: KeyOfType<GuildEntity, boolean> = GuildSettings.Selfmod.Reactions.Enabled;
	protected softPunishmentPath: KeyOfType<GuildEntity, number> = GuildSettings.Selfmod.Reactions.SoftAction;
	protected hardPunishmentPath: HardPunishment = {
		action: GuildSettings.Selfmod.Reactions.HardAction,
		actionDuration: GuildSettings.Selfmod.Reactions.HardActionDuration,
		adder: 'reactions'
	};

	public async run(data: LLRCData, emoji: string) {
		const [enabled, blockedReactions, ignoredChannels, softAction, hardAction, adder] = await data.guild.readSettings((settings) => [
			settings[GuildSettings.Selfmod.Reactions.Enabled],
			settings[GuildSettings.Selfmod.Reactions.BlackList],
			settings[GuildSettings.Channels.Ignore.ReactionAdd],
			settings[GuildSettings.Selfmod.Reactions.SoftAction],
			settings[GuildSettings.Selfmod.Reactions.HardAction],
			settings.adders[this.hardPunishmentPath.adder]
		]);

		if (!enabled || blockedReactions.length === 0 || ignoredChannels.includes(data.channel.id)) return;

		const member = await data.guild.members.fetch(data.userID);
		if (member.user.bot || (await this.hasPermissions(member))) return;

		const args = [data, emoji] as const;
		const preProcessed = await this.preProcess(args);
		if (preProcessed === null) return;

		this.processSoftPunishment(args, preProcessed, new SelfModeratorBitField(softAction));

		if (!adder) return this.processHardPunishment(data.guild, data.userID, hardAction);

		try {
			const points = typeof preProcessed === 'number' ? preProcessed : 1;
			adder.add(data.userID, points);
		} catch {
			await this.processHardPunishment(data.guild, data.userID, hardAction);
		}
	}

	protected async preProcess([data, emoji]: Readonly<ArgumentType>) {
		return (await data.guild.readSettings(GuildSettings.Selfmod.Reactions.BlackList)).includes(emoji) ? 1 : null;
	}

	protected onDelete([data, emoji]: Readonly<ArgumentType>) {
		floatPromise(
			api()
				.channels(data.channel.id)
				.messages(data.messageID)
				.reactions(emoji, data.userID)
				.delete({ reason: '[MODERATION] Automatic Removal of Blacklisted Emoji.' })
		);
	}

	protected onAlert([data]: Readonly<ArgumentType>) {
		floatPromise(
			data.channel.sendTranslated(LanguageKeys.Events.Reactions.Filter, [{ user: `<@${data.userID}>` }]).then((message) => message.nuke(15000))
		);
	}

	protected async onLogMessage([data]: Readonly<ArgumentType>) {
		const user = await this.context.client.users.fetch(data.userID);
		const t = await data.guild.fetchT();
		return new MessageEmbed()
			.setColor(Colors.Red)
			.setAuthor(`${user.tag} (${user.id})`, user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setThumbnail(
				data.emoji.id === null
					? `https://twemoji.maxcdn.com/72x72/${twemoji(data.emoji.name!)}.png`
					: `https://cdn.discordapp.com/emojis/${data.emoji.id}.${data.emoji.animated ? 'gif' : 'png'}?size=64`
			)
			.setDescription(`[${t(LanguageKeys.Misc.JumpTo)}](https://discord.com/channels/${data.guild.id}/${data.channel.id}/${data.messageID})`)
			.setFooter(`${data.channel.name} | ${t(LanguageKeys.Events.Reactions.FilterFooter)}`)
			.setTimestamp();
	}

	protected onLog(args: Readonly<ArgumentType>) {
		this.context.client.emit(Events.GuildMessageLog, MessageLogsEnum.Moderation, args[0].guild, this.onLogMessage.bind(this, args));
	}

	private async hasPermissions(member: GuildMember) {
		const roles = await member.guild.readSettings(GuildSettings.Roles.Moderator);
		return roles.length === 0 ? member.permissions.has(Permissions.FLAGS.BAN_MEMBERS) : hasAtLeastOneKeyInMap(member.roles.cache, roles);
	}
}
