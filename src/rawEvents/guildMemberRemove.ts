import { Guild, MessageEmbed, TextChannel } from 'discord.js';
import { RawEvent } from '../lib/structures/RawEvent';
import { APIUserData, WSGuildMemberRemove } from '../lib/types/DiscordAPI';
import { Events } from '../lib/types/Enums';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { MessageLogsEnum } from '../lib/util/constants';

const REGEXP = /%MEMBER%|%MEMBERNAME%|%MEMBERTAG%|%GUILD%/g;
const MATCHES = {
	GUILD: '%GUILD%',
	MEMBER: '%MEMBER%',
	MEMBERNAME: '%MEMBERNAME%',
	MEMBERTAG: '%MEMBERTAG%'
};

export default class extends RawEvent {

	public async run(data: WSGuildMemberRemove): Promise<void> {
		const guild = this.client.guilds.get(data.guild_id);
		if (!guild || !guild.available) return;

		guild.memberSnowflakes.delete(data.user.id);
		if (!this.client.guilds.some((g) => g.memberSnowflakes.has(data.user.id))) this.client.usertags.delete(data.user.id);
		if (guild.members.has(data.user.id)) guild.members.delete(data.user.id);
		if (guild.security.raid.has(data.user.id)) guild.security.raid.delete(data.user.id);

		if (guild.settings.get(GuildSettings.Events.MemberRemove)) {
			this.handleMemberLog(guild, data);
			this.handleFarewellMessage(guild, data.user);
		}
	}

	public handleMemberLog(guild: Guild, data: WSGuildMemberRemove) {
		this.client.emit(Events.GuildMessageLog, MessageLogsEnum.Member, guild, () => new MessageEmbed()
			.setColor(0xF9A825)
			.setAuthor(`${data.user.username}#${data.user.discriminator} (${data.user.id})`, data.user.avatar
				// @ts-ignore
				? this.client.rest.cdn.Avatar(data.user.id, data.user.avatar)
				// @ts-ignore
				: this.client.rest.cdn.DefaultAvatar(data.user.discriminator % 5))
			.setFooter('Member left')
			.setTimestamp());
	}

	public handleFarewellMessage(guild: Guild, user: APIUserData) {
		const channelsDefault = guild.settings.get(GuildSettings.Channels.Default) as GuildSettings.Channels.Default;
		const messagesFarewell = guild.settings.get(GuildSettings.Messages.Farewell) as GuildSettings.Messages.Farewell;
		if (channelsDefault && messagesFarewell) {
			const channel = guild.channels.get(channelsDefault) as TextChannel;
			if (channel && channel.postable)
				channel.send(this.transformMessage(guild, user)).catch((error) => this.client.emit(Events.ApiError, error));
			else {
				guild.settings.reset(GuildSettings.Channels.Default)
					.then(({ errors }) => errors.length ? this.client.emit(Events.Wtf, errors[0]) : null)
					.catch((error) => this.client.emit(Events.Wtf, error));
			}
		}
	}

	public transformMessage(guild: Guild, user: APIUserData) {
		return (guild.settings.get(GuildSettings.Messages.Farewell) as GuildSettings.Messages.Farewell).replace(REGEXP, (match) => {
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
