import { APIUserData, WSGuildMemberRemove } from '@lib/types/DiscordAPI';
import { Events } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { MessageLogsEnum } from '@utils/constants';
import { Guild, MessageEmbed, TextChannel } from 'discord.js';
import { Event, EventStore } from 'klasa';
import { Colors } from '@lib/types/constants/Constants';
import { MemberTag } from '@utils/Cache/MemberTags';
import { getDisplayAvatar } from '@utils/util';

const enum Matches {
	Guild = '%GUILD%',
	Member = '%MEMBER%',
	MemberName = '%MEMBERNAME%',
	MemberTag = '%MEMBERTAG%'
}

export default class extends Event {

	private readonly kTransformMessageRegExp = /%MEMBER%|%MEMBERNAME%|%MEMBERTAG%|%GUILD%/g;

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'GUILD_MEMBER_REMOVE', emitter: store.client.ws });
	}

	public run(data: WSGuildMemberRemove) {
		const guild = this.client.guilds.get(data.guild_id);
		if (!guild || !guild.available) return;

		if (!this.client.guilds.some(g => g.memberTags.has(data.user.id))) this.client.userTags.delete(data.user.id);
		if (guild.members.has(data.user.id)) guild.members.delete(data.user.id);
		if (guild.security.raid.has(data.user.id)) guild.security.raid.delete(data.user.id);
		this.handleFarewellMessage(guild, data.user);

		if (guild.settings.get(GuildSettings.Events.MemberRemove)) {
			this.handleMemberLog(guild, data);
		}

		guild.memberTags.delete(data.user.id);
	}

	private handleMemberLog(guild: Guild, data: WSGuildMemberRemove) {
		const memberTag = guild.memberTags.get(data.user.id);
		this.client.emit(Events.GuildMessageLog, MessageLogsEnum.Member, guild, () => new MessageEmbed()
			.setColor(Colors.Red)
			.setAuthor(`${data.user.username}#${data.user.discriminator} (${data.user.id})`, getDisplayAvatar(data.user.id, data.user))
			.setDescription(guild.language.tget('EVENTS_GUILDMEMBERREMOVE_DESCRIPTION', `<@${data.user.id}>`, this.processJoinedTimestamp(memberTag)))
			.setFooter(guild.language.tget('EVENTS_GUILDMEMBERREMOVE'))
			.setTimestamp());
	}

	private processJoinedTimestamp(memberTag: MemberTag | undefined) {
		if (typeof memberTag === 'undefined') return -1;
		if (memberTag.joinedAt === null) return -1;
		return Date.now() - memberTag.joinedAt;
	}

	private handleFarewellMessage(guild: Guild, user: APIUserData) {
		const channelsFarewell = guild.settings.get(GuildSettings.Channels.Farewell);
		const messagesFarewell = guild.settings.get(GuildSettings.Messages.Farewell);
		if (channelsFarewell && messagesFarewell) {
			const channel = guild.channels.get(channelsFarewell) as TextChannel;
			if (channel && channel.postable) {
				channel.send(this.transformMessage(guild, user))
					.catch(error => this.client.emit(Events.ApiError, error));
			} else {
				guild.settings.reset(GuildSettings.Channels.Farewell)
					.catch(error => this.client.emit(Events.Wtf, error));
			}
		}
	}

	private transformMessage(guild: Guild, user: APIUserData) {
		return guild.settings.get(GuildSettings.Messages.Farewell).replace(this.kTransformMessageRegExp, match => {
			switch (match) {
				case Matches.Member: return `<@${user.id}>`;
				case Matches.MemberName: return user.username;
				case Matches.MemberTag: return `${user.username}#${user.discriminator}`;
				case Matches.Guild: return guild.name;
				default: return match;
			}
		});
	}

}
