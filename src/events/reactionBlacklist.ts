import { HardPunishment, ModerationEvent } from '@lib/structures/ModerationEvent';
import { SelfModeratorBitField } from '@lib/structures/SelfModeratorBitField';
import { Colors } from '@lib/types/constants/Constants';
import { Events } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { Adder } from '@utils/Adder';
import { MessageLogsEnum } from '@utils/constants';
import { LLRCData } from '@utils/LongLivingReactionCollector';
import { api } from '@utils/Models/Api';
import { floatPromise, twemoji } from '@utils/util';
import { GuildMember, MessageEmbed, Permissions } from 'discord.js';

type ArgumentType = [LLRCData, string];

export default class extends ModerationEvent<ArgumentType> {
	protected keyEnabled: string = GuildSettings.Selfmod.Reactions.Enabled;
	protected softPunishmentPath: string = GuildSettings.Selfmod.Reactions.SoftAction;
	protected hardPunishmentPath: HardPunishment<typeof GuildSettings.Selfmod.Reactions.HardAction> = {
		action: GuildSettings.Selfmod.Reactions.HardAction,
		actionDuration: GuildSettings.Selfmod.Reactions.HardActionDuration,
		adder: 'reactions',
		adderMaximum: GuildSettings.Selfmod.Reactions.ThresholdMaximum,
		adderDuration: GuildSettings.Selfmod.Reactions.ThresholdDuration
	};

	public async run(data: LLRCData, emoji: string) {
		if (
			!data.guild.settings.get(this.keyEnabled) ||
			data.guild.settings.get(GuildSettings.Selfmod.Reactions.BlackList).length === 0 ||
			data.guild.settings.get(GuildSettings.Selfmod.IgnoreChannels).includes(data.channel.id)
		)
			return;

		const member = await data.guild.members.fetch(data.userID);
		if (member.user.bot || this.hasPermissions(member)) return;

		const args = [data, emoji] as const;
		const preProcessed = this.preProcess(args);
		if (preProcessed === null) return;

		const filter = data.guild.settings.get(this.softPunishmentPath) as number;
		const bitfield = new SelfModeratorBitField(filter);
		this.processSoftPunishment(args, preProcessed, bitfield);

		if (this.hardPunishmentPath === null) return;

		const maximum = data.guild.settings.get(this.hardPunishmentPath.adderMaximum) as number;
		if (!maximum) return this.processHardPunishment(data.guild, data.userID, data.guild.settings.get(this.hardPunishmentPath.action));

		const duration = data.guild.settings.get(this.hardPunishmentPath.adderDuration) as number;
		if (!duration) return this.processHardPunishment(data.guild, data.userID, data.guild.settings.get(this.hardPunishmentPath.action));

		const $adder = this.hardPunishmentPath.adder;
		if (data.guild.security.adders[$adder] === null) {
			data.guild.security.adders[$adder] = new Adder(maximum, duration);
		}

		try {
			const points = typeof preProcessed === 'number' ? preProcessed : 1;
			data.guild.security.adders[$adder]!.add(data.userID, points);
		} catch {
			await this.processHardPunishment(data.guild, data.userID, data.guild.settings.get(this.hardPunishmentPath.action));
		}
	}

	protected preProcess([data, emoji]: Readonly<ArgumentType>) {
		return data.guild.settings.get(GuildSettings.Selfmod.Reactions.BlackList).includes(emoji) ? 1 : null;
	}

	protected onDelete([data, emoji]: Readonly<ArgumentType>) {
		floatPromise(
			this,
			api(this.client)
				.channels(data.channel.id)
				.messages(data.messageID)
				.reactions(emoji, data.userID)
				.delete({ reason: '[MODERATION] Automatic Removal of Blacklisted Emoji.' })
		);
	}

	protected onAlert([data]: Readonly<ArgumentType>) {
		floatPromise(
			this,
			data.channel.sendLocale('monitorReactionsFilter', [{ user: `<@${data.userID}>` }]).then((message) => message.nuke(15000))
		);
	}

	protected async onLogMessage([data]: Readonly<ArgumentType>) {
		const user = await this.client.users.fetch(data.userID);
		return new MessageEmbed()
			.setColor(Colors.Red)
			.setAuthor(`${user.tag} (${user.id})`, user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setThumbnail(
				data.emoji.id === null
					? `https://twemoji.maxcdn.com/72x72/${twemoji(data.emoji.name!)}.png`
					: `https://cdn.discordapp.com/emojis/${data.emoji.id}.${data.emoji.animated ? 'gif' : 'png'}?size=64`
			)
			.setDescription(
				`[${data.guild.language.get('jumpTo')}](https://discord.com/channels/${data.guild.id}/${data.channel.id}/${data.messageID})`
			)
			.setFooter(`${data.channel.name} | ${data.guild.language.get('constMonitorReactionfilter')}`)
			.setTimestamp();
	}

	protected onLog(args: Readonly<ArgumentType>) {
		this.client.emit(Events.GuildMessageLog, MessageLogsEnum.Moderation, args[0].guild, this.onLogMessage.bind(this, args));
	}

	private hasPermissions(member: GuildMember) {
		return member.guild.settings.get(GuildSettings.Roles.Moderator)
			? member.roles.cache.has(member.guild.settings.get(GuildSettings.Roles.Moderator))
			: member.permissions.has(Permissions.FLAGS.BAN_MEMBERS);
	}
}
