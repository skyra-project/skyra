import { readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Events } from '#lib/types';
import { seconds } from '#utils/common';
import { Colors } from '#utils/constants';
import { getLogger, getModeration, getUserMentionWithFlagsString } from '#utils/functions';
import { TypeVariation } from '#utils/moderationConstants';
import { getFullEmbedAuthor } from '#utils/util';
import { EmbedBuilder, TimestampStyles, time } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { GatewayGuildMemberRemoveDispatchData, Guild, GuildMember } from 'discord.js';

const Root = LanguageKeys.Events.Guilds.Members;

@ApplyOptions<Listener.Options>({ event: Events.RawMemberRemove })
export class UserListener extends Listener {
	public async run(guild: Guild, member: GuildMember | null, { user }: GatewayGuildMemberRemoveDispatchData) {
		const settings = await readSettings(guild);
		const targetChannelId = settings.channelsLogsMemberRemove;
		if (isNullish(targetChannelId)) return;

		const isModerationAction = await this.isModerationAction(guild, user);

		const t = settings.getLanguage();
		const footer = isModerationAction.kicked
			? t(Root.GuildMemberKicked)
			: isModerationAction.banned
				? t(Root.GuildMemberBanned)
				: isModerationAction.softbanned
					? t(Root.GuildMemberSoftBanned)
					: t(Root.GuildMemberRemove);

		const joinedTimestamp = this.processJoinedTimestamp(member);
		await getLogger(guild).send({
			key: 'channelsLogsMemberRemove',
			channelId: targetChannelId,
			makeMessage: () => {
				const key = joinedTimestamp === -1 ? Root.GuildMemberRemoveDescription : Root.GuildMemberRemoveDescriptionWithJoinedAt;
				const description = t(key, {
					user: getUserMentionWithFlagsString(user.flags ?? 0, user.id),
					relativeTime: time(seconds.fromMilliseconds(joinedTimestamp), TimestampStyles.RelativeTime)
				});

				return new EmbedBuilder()
					.setColor(Colors.Red)
					.setAuthor(getFullEmbedAuthor(user))
					.setDescription(description)
					.setFooter({ text: footer })
					.setTimestamp();
			}
		});
	}

	private async isModerationAction(guild: Guild, user: GatewayGuildMemberRemoveDispatchData['user']): Promise<IsModerationAction> {
		const moderation = getModeration(guild);
		await moderation.waitLock();

		const latestLogForUser = moderation.getLatestRecentCachedEntryForUser(user.id);

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
			softbanned: latestLogForUser.type === TypeVariation.Softban
		};
	}

	private processJoinedTimestamp(member: GuildMember | null) {
		if (member === null) return -1;
		if (member.joinedTimestamp === null) return -1;
		return member.joinedTimestamp;
	}
}

interface IsModerationAction {
	readonly kicked: boolean;
	readonly banned: boolean;
	readonly softbanned: boolean;
}
