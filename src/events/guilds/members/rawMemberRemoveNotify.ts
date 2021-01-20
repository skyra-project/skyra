import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors } from '#lib/types/Constants';
import { Events } from '#lib/types/Enums';
import { MessageLogsEnum, Moderation } from '#utils/constants';
import { getDisplayAvatar } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import type { GatewayGuildMemberRemoveDispatch } from 'discord-api-types/v6';
import { Guild, GuildMember, MessageEmbed } from 'discord.js';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ event: Events.RawMemberRemove })
export default class extends Event {
	public async run(guild: Guild, member: GuildMember | null, { user }: GatewayGuildMemberRemoveDispatch['d']) {
		const [enabled, t] = await guild.readSettings((settings) => [settings[GuildSettings.Events.MemberRemove], settings.getLanguage()]);
		if (!enabled) return;

		const isModerationAction = await this.isModerationAction(guild, user);

		const footer = isModerationAction.kicked
			? t(LanguageKeys.Events.GuildMemberKicked)
			: isModerationAction.banned
			? t(LanguageKeys.Events.GuildMemberBanned)
			: isModerationAction.softbanned
			? t(LanguageKeys.Events.GuildMemberSoftBanned)
			: t(LanguageKeys.Events.GuildMemberRemove);

		const time = this.processJoinedTimestamp(member);
		this.context.client.emit(Events.GuildMessageLog, MessageLogsEnum.Member, guild, () =>
			new MessageEmbed()
				.setColor(Colors.Red)
				.setAuthor(`${user.username}#${user.discriminator} (${user.id})`, getDisplayAvatar(user.id, user))
				.setDescription(
					t(time === -1 ? LanguageKeys.Events.GuildMemberRemoveDescription : LanguageKeys.Events.GuildMemberRemoveDescriptionWithJoinedAt, {
						mention: `<@${user.id}>`,
						time
					})
				)
				.setFooter(footer)
				.setTimestamp()
		);
	}

	private async isModerationAction(guild: Guild, user: GatewayGuildMemberRemoveDispatch['d']['user']): Promise<IsModerationAction> {
		await guild.moderation.waitLock();

		const latestLogForUser = guild.moderation.getLatestLogForUser(user.id);

		if (latestLogForUser === null) {
			return {
				kicked: false,
				banned: false,
				softbanned: false
			};
		}

		return {
			kicked: latestLogForUser.isType(Moderation.TypeCodes.Kick),
			banned: latestLogForUser.isType(Moderation.TypeCodes.Ban),
			softbanned: latestLogForUser.isType(Moderation.TypeCodes.SoftBan)
		};
	}

	private processJoinedTimestamp(member: GuildMember | null) {
		if (member === null) return -1;
		if (member.joinedTimestamp === null) return -1;
		return Date.now() - member.joinedTimestamp;
	}
}

interface IsModerationAction {
	readonly kicked: boolean;
	readonly banned: boolean;
	readonly softbanned: boolean;
}
