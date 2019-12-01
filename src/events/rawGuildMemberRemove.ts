import { Guild, MessageEmbed, TextChannel } from 'discord.js';
import { APIUserData, WSGuildMemberRemove } from '../lib/types/DiscordAPI';
import { Events } from '../lib/types/Enums';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { MessageLogsEnum } from '../lib/util/constants';
import { Event, EventStore } from 'klasa';
import { rest } from '../lib/util/Models/Rest';

const REGEXP = /%MEMBER%|%MEMBERNAME%|%MEMBERTAG%|%GUILD%/g;
const MATCHES = {
	GUILD: '%GUILD%',
	MEMBER: '%MEMBER%',
	MEMBERNAME: '%MEMBERNAME%',
	MEMBERTAG: '%MEMBERTAG%'
};

export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'GUILD_MEMBER_REMOVE', emitter: store.client.ws });
	}

	public run(data: WSGuildMemberRemove) {
		const guild = this.client.guilds.get(data.guild_id);
		if (!guild || !guild.available) return;

		guild.nicknames.delete(data.user.id);
		if (!this.client.guilds.some(g => g.nicknames.has(data.user.id))) this.client.userTags.delete(data.user.id);
		if (guild.members.has(data.user.id)) guild.members.delete(data.user.id);
		if (guild.security.raid.has(data.user.id)) guild.security.raid.delete(data.user.id);
		this.handleFarewellMessage(guild, data.user);

		if (guild.settings.get(GuildSettings.Events.MemberRemove)) {
			this.handleMemberLog(guild, data);
		}
	}

	public handleMemberLog(guild: Guild, data: WSGuildMemberRemove) {
		this.client.emit(Events.GuildMessageLog, MessageLogsEnum.Member, guild, () => new MessageEmbed()
			.setColor(0xF9A825)
			.setAuthor(`${data.user.username}#${data.user.discriminator} (${data.user.id})`, data.user.avatar
				? rest(this.client).cdn.Avatar(data.user.id, data.user.avatar)
				: rest(this.client).cdn.DefaultAvatar(Number(data.user.discriminator) % 5))
			.setFooter('Member left')
			.setTimestamp());
	}

	public handleFarewellMessage(guild: Guild, user: APIUserData) {
		const channelsFarewell = guild.settings.get(GuildSettings.Channels.Farewell);
		const messagesFarewell = guild.settings.get(GuildSettings.Messages.Farewell);
		if (channelsFarewell && messagesFarewell) {
			const channel = guild.channels.get(channelsFarewell) as TextChannel;
			if (channel && channel.postable) {
				channel.send(this.transformMessage(guild, user))
					.catch(error => this.client.emit(Events.ApiError, error));
			} else {
				guild.settings.reset(GuildSettings.Channels.Farewell, { throwOnError: true })
					.catch(error => this.client.emit(Events.Wtf, error));
			}
		}
	}

	public transformMessage(guild: Guild, user: APIUserData) {
		return guild.settings.get(GuildSettings.Messages.Farewell).replace(REGEXP, match => {
			switch (match) {
				case MATCHES.MEMBER: return `<@${user.id}>`;
				case MATCHES.MEMBERNAME: return user.username;
				case MATCHES.MEMBERTAG: return `${user.username}#${user.discriminator}`;
				case MATCHES.GUILD: return guild.name;
				default: return match;
			}
		});
	}

}
