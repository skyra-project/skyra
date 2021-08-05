import { GuildSettings, readSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Events } from '#lib/types/Enums';
import { deleteMessage } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { canSendMessages } from '@sapphire/discord.js-utilities';
import { Listener, ListenerOptions } from '@sapphire/framework';
import { isNullishOrZero } from '@sapphire/utilities';
import type { APIUser, GatewayGuildMemberRemoveDispatch } from 'discord-api-types/v9';
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

@ApplyOptions<ListenerOptions>({ event: Events.RawMemberRemove })
export class UserListener extends Listener {
	private readonly kTransformMessageRegExp = /%(?:MEMBER(?:NAME|TAG|(?:_(?:POSITION|HIGHEST_ROLE(?:NAME)?)))?|GUILD)%/g;

	public async run(guild: Guild, member: GuildMember | null, { user }: GatewayGuildMemberRemoveDispatch['d']) {
		const [channelId, farewellContent, timer, t] = await readSettings(guild, (settings) => [
			settings[GuildSettings.Channels.Farewell],
			settings[GuildSettings.Messages.Farewell],
			settings[GuildSettings.Messages.FarewellAutoDelete],
			settings.getLanguage()
		]);
		if (!channelId || !farewellContent) return;

		const channel = guild.channels.cache.get(channelId) as TextChannel | undefined;
		if (channel && canSendMessages(channel)) {
			const content = this.transformMessage(t, guild, member, user, farewellContent);
			const message = await channel.send({ content, allowedMentions: { users: [], roles: [] } });
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
