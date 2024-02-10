import { GuildSettings, readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Events } from '#lib/types';
import { Colors } from '#utils/constants';
import { getModeration } from '#utils/functions';
import { TypeVariation } from '#utils/moderationConstants';
import { getFullEmbedAuthor } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { GatewayGuildMemberRemoveDispatch, Guild, GuildMember } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.RawMemberRemove })
export class UserListener extends Listener {
	public async run(guild: Guild, member: GuildMember | null, { user }: GatewayGuildMemberRemoveDispatch['d']) {
		const key = GuildSettings.Channels.Logs.MemberRemove;
		const [logChannelId, t] = await readSettings(guild, (settings) => [settings[key], settings.getLanguage()]);
		if (isNullish(logChannelId)) return;

		const isModerationAction = await this.isModerationAction(guild, user);

		const footer = isModerationAction.kicked
			? t(LanguageKeys.Events.Guilds.Members.GuildMemberKicked)
			: isModerationAction.banned
				? t(LanguageKeys.Events.Guilds.Members.GuildMemberBanned)
				: isModerationAction.softbanned
					? t(LanguageKeys.Events.Guilds.Members.GuildMemberSoftBanned)
					: t(LanguageKeys.Events.Guilds.Members.GuildMemberRemove);

		const time = this.processJoinedTimestamp(member);
		this.container.client.emit(Events.GuildMessageLog, guild, logChannelId, key, () =>
			new EmbedBuilder()
				.setColor(Colors.Red)
				.setAuthor(getFullEmbedAuthor(user))
				.setDescription(
					t(
						time === -1
							? LanguageKeys.Events.Guilds.Members.GuildMemberRemoveDescription
							: LanguageKeys.Events.Guilds.Members.GuildMemberRemoveDescriptionWithJoinedAt,
						{
							mention: `<@${user.id}>`,
							time
						}
					)
				)
				.setFooter({ text: footer })
				.setTimestamp()
		);
	}

	private async isModerationAction(guild: Guild, user: GatewayGuildMemberRemoveDispatch['d']['user']): Promise<IsModerationAction> {
		const moderation = getModeration(guild);
		await moderation.waitLock();

		const latestLogForUser = moderation.getLatestLogForUser(user.id);

		if (latestLogForUser === null) {
			return {
				kicked: false,
				banned: false,
				softbanned: false
			};
		}

		return {
			kicked: latestLogForUser.type === TypeVariation.Kick,
			banned: latestLogForUser.type === TypeVariation.Ban,
			softbanned: latestLogForUser.type === TypeVariation.SoftBan
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
