import { GuildSettings } from '@lib/database';
import { Events } from '@lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';
import { resolveOnErrorCodes } from '@utils/util';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';
import { Guild, GuildMember, User } from 'discord.js';
import { Event, EventOptions, Language } from 'klasa';

const enum Matches {
	Guild = '%GUILD%',
	Member = '%MEMBER%',
	MemberName = '%MEMBERNAME%',
	MemberTag = '%MEMBERTAG%',
	MemberCount = '%MEMBERCOUNT%',
	Position = '%POSITION%'
}

@ApplyOptions<EventOptions>({ event: Events.NotMutedMemberAdd })
export default class extends Event {
	private readonly kTransformMessageRegExp = /%MEMBER%|%MEMBERNAME%|%MEMBERTAG%|%GUILD%|%POSITION%|%MEMBERCOUNT%/g;

	public async run(member: GuildMember) {
		const [messagesJoinDM, language] = await member.guild.readSettings((settings) => [
			settings[GuildSettings.Messages.JoinDM],
			settings.getLanguage()
		]);
		if (!messagesJoinDM) return;

		return resolveOnErrorCodes(
			member.user.send(this.transformMessage(messagesJoinDM, language, member.guild, member.user)),
			RESTJSONErrorCodes.CannotSendMessagesToThisUser
		);
	}

	private transformMessage(str: string, language: Language, guild: Guild, user: User) {
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
					return language.ordinal(guild.memberCount);
				case Matches.MemberCount:
					return guild.memberCount.toString();
				default:
					return match;
			}
		});
	}
}
