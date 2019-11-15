import { ModerationEvent, HardPunishment } from '../lib/structures/ModerationEvent';
import { LLRCData } from '../lib/util/LongLivingReactionCollector';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { GuildMember, Permissions, MessageEmbed } from 'discord.js';
import { SelfModeratorBitField, SelfModeratorHardActionFlags } from '../lib/structures/SelfModeratorBitField';
import { Adder } from '../lib/util/Adder';
import { floatPromise, getDisplayAvatar, twemoji } from '../lib/util/util';
import { api } from '../lib/util/Models/Api';
import { Events } from '../lib/types/Enums';
import { MessageLogsEnum } from '../lib/util/constants';

type ArgumentType = [LLRCData, string];

export default class extends ModerationEvent<ArgumentType> {

	protected keyEnabled: string = GuildSettings.Selfmod.Reactions.Enabled;
	protected softPunishmentPath: string = GuildSettings.Selfmod.Reactions.SoftAction;
	protected hardPunishmentPath: HardPunishment = {
		action: GuildSettings.Selfmod.Reactions.HardAction,
		actionDuration: GuildSettings.Selfmod.Reactions.HardActionDuration,
		adder: 'reactions',
		adderMaximum: GuildSettings.Selfmod.Reactions.ThresholdMaximum,
		adderDuration: GuildSettings.Selfmod.Reactions.ThresholdDuration
	};

	public async run(data: LLRCData, emoji: string) {
		if (!data.guild.settings.get(this.keyEnabled) as boolean
			|| data.guild.settings.get(GuildSettings.Selfmod.IgnoreChannels).includes(data.channel.id)) return;

		const member = await data.guild.members.fetch(data.userID);
		if (this.hasPermissions(member)) return;

		const args = [data, emoji] as const;
		const preProcessed = this.preProcess(args);
		if (preProcessed === null) return;

		const filter = data.guild.settings.get(this.softPunishmentPath) as number;
		const bitfield = new SelfModeratorBitField(filter);
		this.processSoftPunishment(args, preProcessed, bitfield);

		if (this.hardPunishmentPath === null) return;

		const maximum = data.guild.settings.get(this.hardPunishmentPath.adderMaximum) as number;
		if (!maximum) return this.processHardPunishment(data.guild, data.userID, data.guild.settings.get(this.hardPunishmentPath.action) as SelfModeratorHardActionFlags);

		const duration = data.guild.settings.get(this.hardPunishmentPath.adderDuration) as number;
		if (!duration) return this.processHardPunishment(data.guild, data.userID, data.guild.settings.get(this.hardPunishmentPath.action) as SelfModeratorHardActionFlags);

		const $adder = this.hardPunishmentPath.adder;
		if (data.guild.security.adders[$adder] === null) {
			data.guild.security.adders[$adder] = new Adder(maximum, duration);
		}

		try {
			const points = typeof preProcessed === 'number' ? preProcessed : 1;
			data.guild.security.adders[$adder]!.add(data.userID, points);
		} catch {
			await this.processHardPunishment(data.guild, data.userID, data.guild.settings.get(this.hardPunishmentPath.action) as SelfModeratorHardActionFlags);
		}
	}

	protected preProcess([data, emoji]: Readonly<ArgumentType>) {
		return data.channel.guild.settings.get(GuildSettings.Selfmod.Reactions.BlackList).includes(emoji) ? 1 : null;
	}

	protected onDelete([data, emoji]: Readonly<ArgumentType>) {
		floatPromise(this, api(this.client).channels(data.channel.id)
			.messages(data.messageID)
			.reactions(emoji, data.userID)
			.delete({ reason: '[MODERATION] Automatic Removal of Blacklisted Emoji.' }));
	}

	protected onAlert([data]: Readonly<ArgumentType>) {
		floatPromise(this, data.channel.sendLocale('MONITOR_REACTIONSFILTER', [`<@${data.userID}>`])
			.then(message => message.nuke(15000)));
	}

	protected async onLogMessage([data]: Readonly<ArgumentType>) {
		const userTag = await this.client.userTags.fetch(data.userID);
		return new MessageEmbed()
			.setColor(0xFFAB40)
			.setAuthor(`${userTag.username}#${userTag.discriminator} (${data.userID})`, getDisplayAvatar(data.userID, userTag))
			.setThumbnail(data.emoji.id === null
				? `https://twemoji.maxcdn.com/2/72x72/${twemoji(data.emoji.name)}.png`
				: `https://cdn.discordapp.com/emojis/${data.emoji.id}.${data.emoji.animated ? 'gif' : 'png'}`)
			.setDescription(`[${data.guild.language.tget('JUMPTO')}](https://discordapp.com/channels/${data.guild.id}/${data.channel.id}/${data.messageID})`)
			.setFooter(`${data.channel.guild.language.tget('EVENTS_REACTION')} • ${data.channel.name}`)
			.setTimestamp();
	}

	protected onLog(args: Readonly<ArgumentType>) {
		this.client.emit(Events.GuildMessageLog, MessageLogsEnum.Reaction, args[0].guild, this.onLogMessage.bind(this, args));
	}

	private hasPermissions(member: GuildMember) {
		return member.guild.settings.get(GuildSettings.Roles.Moderator)
			? member.roles.has(member.guild.settings.get(GuildSettings.Roles.Moderator))
			: member.permissions.has(Permissions.FLAGS.BAN_MEMBERS);
	}

}
