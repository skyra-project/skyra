import { GuildSettings, readSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Events } from '#lib/types/Enums';
import { deleteMessage } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { canSendMessages } from '@sapphire/discord.js-utilities';
import { Listener, ListenerOptions } from '@sapphire/framework';
import { isNullishOrZero } from '@sapphire/utilities';
import type { Guild, GuildMember, TextChannel, User } from 'discord.js';
import type { TFunction } from 'i18next';

const enum Matches {
	Guild = '%GUILD%',
	Member = '%MEMBER%',
	MemberName = '%MEMBERNAME%',
	MemberTag = '%MEMBERTAG%',
	MemberCount = '%MEMBERCOUNT%',
	Position = '%POSITION%'
}

@ApplyOptions<ListenerOptions>({ event: Events.NotMutedMemberAdd })
export class UserListener extends Listener {
	private readonly kTransformMessageRegExp = /%MEMBER%|%MEMBERNAME%|%MEMBERTAG%|%GUILD%|%POSITION%|%MEMBERCOUNT%/g;

	public async run(member: GuildMember) {
		const [channelId, greetingContent, timer, t] = await readSettings(member, (settings) => [
			settings[GuildSettings.Channels.Greeting],
			settings[GuildSettings.Messages.Greeting],
			settings[GuildSettings.Messages.GreetingAutoDelete],
			settings.getLanguage()
		]);

		if (!channelId || !greetingContent) return;

		const channel = member.guild.channels.cache.get(channelId) as TextChannel | undefined;
		if (channel && canSendMessages(channel)) {
			const content = this.transformMessage(greetingContent, t, member.guild, member.user);
			const message = await channel.send({ content, allowedMentions: { users: [member.id], roles: [] } });
			if (!isNullishOrZero(timer)) await deleteMessage(message, timer);
			return;
		}

		return writeSettings(member, [[GuildSettings.Channels.Greeting, null]]);
	}

	private transformMessage(str: string, t: TFunction, guild: Guild, user: User) {
		return str.replace(this.kTransformMessageRegExp, (match) => {
			switch (match) {
				case Matches.Member:
					return `<@${user.id}>`;
				case Matches.MemberName:
					return user.username;
				case Matches.MemberTag:
					return user.tag;
				case Matches.Guild:
					return guild.name;
				case Matches.Position:
					return t(LanguageKeys.Globals.OrdinalValue, { value: guild.memberCount });
				case Matches.MemberCount:
					return guild.memberCount.toString();
				default:
					return match;
			}
		});
	}
}
