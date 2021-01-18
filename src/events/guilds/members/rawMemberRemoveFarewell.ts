import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import type { APIUser, GatewayGuildMemberRemoveDispatch } from 'discord-api-types/v6';
import type { Guild, GuildMember, TextChannel } from 'discord.js';
import type { TFunction } from 'i18next';
import { Event, EventOptions } from 'klasa';

const enum Matches {
	Guild = '%GUILD%',
	Member = '%MEMBER%',
	MemberName = '%MEMBERNAME%',
	MemberPosition = '%MEMBER_POSITION%',
	MemberHighestRole = '%MEMBER_HIGHEST_ROLE%',
	MemberHighestRoleName = '%MEMBER_HIGHEST_ROLENAME%',
	MemberTag = '%MEMBERTAG%'
}

@ApplyOptions<EventOptions>({ event: Events.RawMemberRemove })
export default class extends Event {
	private readonly kTransformMessageRegExp = /%(?:MEMBER(?:NAME|TAG|(?:_(?:POSITION|HIGHEST_ROLE(?:NAME)?)))?|GUILD)%/g;

	public async run(guild: Guild, member: GuildMember | null, { user }: GatewayGuildMemberRemoveDispatch['d']) {
		const [channelID, content, t] = await guild.readSettings((settings) => [
			settings[GuildSettings.Channels.Farewell],
			settings[GuildSettings.Messages.Farewell],
			settings.getLanguage()
		]);
		if (!channelID || !content) return;

		const channel = guild.channels.cache.get(channelID) as TextChannel;
		if (channel && channel.postable) {
			return channel.send(this.transformMessage(t, guild, member, user, content), {
				allowedMentions: { users: [], roles: [] }
			});
		}

		return guild.writeSettings([[GuildSettings.Channels.Farewell, null]]);
	}

	private transformMessage(t: TFunction, guild: Guild, member: GuildMember | null, user: APIUser, content: string) {
		return content.replace(this.kTransformMessageRegExp, (match) => {
			switch (match) {
				case Matches.Member:
					return `<@${user.id}>`;
				case Matches.MemberName:
					return user.username;
				case Matches.MemberTag:
					return `${user.username}#${user.discriminator}`;
				case Matches.MemberPosition:
					return this.getMemberPosition(member, t);
				case Matches.MemberHighestRole:
					return member?.roles.highest.toString() ?? t(LanguageKeys.Globals.Unknown);
				case Matches.MemberHighestRoleName:
					return member?.roles.highest.name ?? t(LanguageKeys.Globals.Unknown);
				case Matches.Guild:
					return guild.name;
				default:
					return match;
			}
		});
	}

	private getMemberPosition(member: GuildMember | null, t: TFunction) {
		if (member === null) return t(LanguageKeys.Globals.Unknown);

		const { joinedTimestamp, guild } = member;
		if (joinedTimestamp === null) return t(LanguageKeys.Globals.Unknown);

		let position = 1;
		for (const value of guild.members.cache.values()) {
			if (value.joinedTimestamp !== null && value.joinedTimestamp < joinedTimestamp) position++;
		}

		return t(LanguageKeys.Globals.OrdinalValue, { value: position });
	}
}
