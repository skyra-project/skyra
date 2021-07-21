import { GuildSettings, readSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Events } from '#lib/types/Enums';
import { canSendMessages, deleteMessage } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';
import { isNullishOrZero } from '@sapphire/utilities';
import type { APIUser, GatewayGuildMemberRemoveDispatch } from 'discord-api-types/v6';
import type { Guild, GuildMember, TextChannel } from 'discord.js';
import type { TFunction } from 'i18next';

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
export class UserEvent extends Event {
	private readonly kTransformMessageRegExp = /%(?:MEMBER(?:NAME|TAG|(?:_(?:POSITION|HIGHEST_ROLE(?:NAME)?)))?|GUILD)%/g;

	public async run(guild: Guild, member: GuildMember | null, { user }: GatewayGuildMemberRemoveDispatch['d']) {
		const [channelID, content, timer, t] = await readSettings(guild, (settings) => [
			settings[GuildSettings.Channels.Farewell],
			settings[GuildSettings.Messages.Farewell],
			settings[GuildSettings.Messages.FarewellAutoDelete],
			settings.getLanguage()
		]);
		if (!channelID || !content) return;

		const channel = guild.channels.cache.get(channelID) as TextChannel | undefined;
		if (channel && canSendMessages(channel)) {
			const messageContent = this.transformMessage(t, guild, member, user, content);
			const message = await channel.send(messageContent, { allowedMentions: { users: [], roles: [] } });
			if (!isNullishOrZero(timer)) await deleteMessage(message, timer);
			return;
		}

		return writeSettings(guild, [[GuildSettings.Channels.Farewell, null]]);
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
