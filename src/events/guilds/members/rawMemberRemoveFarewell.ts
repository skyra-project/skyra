import { GuildSettings } from '@lib/database';
import { Events } from '@lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';
import { APIUser, GatewayGuildMemberRemoveDispatch } from 'discord-api-types/v6';
import { Guild, TextChannel } from 'discord.js';
import { Event, EventOptions } from 'klasa';

const enum Matches {
	Guild = '%GUILD%',
	Member = '%MEMBER%',
	MemberName = '%MEMBERNAME%',
	MemberTag = '%MEMBERTAG%'
}

@ApplyOptions<EventOptions>({ event: Events.RawMemberRemove })
export default class extends Event {
	private readonly kTransformMessageRegExp = /%MEMBER%|%MEMBERNAME%|%MEMBERTAG%|%GUILD%/g;

	public async run(guild: Guild, { user }: GatewayGuildMemberRemoveDispatch['d']) {
		const [channelID, content] = await guild.readSettings([GuildSettings.Channels.Farewell, GuildSettings.Messages.Farewell]);
		if (!channelID || !content) return;

		const channel = guild.channels.cache.get(channelID) as TextChannel;
		if (channel && channel.postable) {
			return channel.send(this.transformMessage(guild, user, content));
		}

		return guild.writeSettings([[GuildSettings.Channels.Farewell, null]]);
	}

	private transformMessage(guild: Guild, user: APIUser, content: string) {
		return content.replace(this.kTransformMessageRegExp, (match) => {
			switch (match) {
				case Matches.Member:
					return `<@${user.id}>`;
				case Matches.MemberName:
					return user.username;
				case Matches.MemberTag:
					return `${user.username}#${user.discriminator}`;
				case Matches.Guild:
					return guild.name;
				default:
					return match;
			}
		});
	}
}
