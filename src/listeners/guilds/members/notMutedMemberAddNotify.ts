import { GuildSettings, readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Events } from '#lib/types';
import { seconds } from '#utils/common';
import { Colors } from '#utils/constants';
import { getLogger, getUserMentionWithFlagsString } from '#utils/functions';
import { getFullEmbedAuthor } from '#utils/util';
import { EmbedBuilder, TimestampStyles, time } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';

const Root = LanguageKeys.Events.Guilds.Members;
const ChannelSettingsKey = GuildSettings.Channels.Logs.MemberAdd;

@ApplyOptions<Listener.Options>({ event: Events.NotMutedMemberAdd })
export class UserListener extends Listener {
	public async run(member: GuildMember) {
		const [t, logChannelId] = await readSettings(member, (settings) => [settings.getLanguage(), settings[ChannelSettingsKey]]);
		await getLogger(member.guild).send({
			key: ChannelSettingsKey,
			channelId: logChannelId,
			makeMessage: () => {
				const { user } = member;
				const description = t(Root.GuildMemberAddDescription, {
					user: getUserMentionWithFlagsString(user.flags?.bitfield ?? 0, user.id),
					relativeTime: time(seconds.fromMilliseconds(user.createdTimestamp), TimestampStyles.RelativeTime)
				});
				return new EmbedBuilder()
					.setColor(Colors.Green)
					.setAuthor(getFullEmbedAuthor(member.user))
					.setDescription(description)
					.setFooter({ text: t(Root.GuildMemberAdd) })
					.setTimestamp();
			}
		});
	}
}
