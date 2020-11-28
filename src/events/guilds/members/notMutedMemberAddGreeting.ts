import { GuildSettings } from '#lib/database/index';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';
import { Guild, GuildMember, TextChannel, User } from 'discord.js';
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
		const [channelID, content, language] = await member.guild.readSettings((settings) => [
			settings[GuildSettings.Channels.Greeting],
			settings[GuildSettings.Messages.Greeting],
			settings.getLanguage()
		]);

		if (!channelID || !content) return;

		const channel = member.guild.channels.cache.get(channelID) as TextChannel;
		if (channel && channel.postable) {
			return channel.send(this.transformMessage(content, language, member.guild, member.user));
		}

		return member.guild.writeSettings([[GuildSettings.Channels.Greeting, null]]);
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
