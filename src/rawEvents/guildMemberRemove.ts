import { Guild, MessageEmbed, TextChannel } from 'discord.js';
import { RawEvent } from '../lib/structures/RawEvent';
import { APIUserData, WSGuildMemberRemove } from '../lib/types/Discord';
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

		if (guild.settings.get('events.memberRemove')) {
			this.handleMemberLog(guild, data);
			this.handleFarewellMessage(guild, data.user);
		}
	}

	public handleMemberLog(guild: Guild, data: WSGuildMemberRemove): void {
		this.client.emit('guildMessageLog', MessageLogsEnum.Member, guild, () => new MessageEmbed()
			.setColor(0xF9A825)
			.setAuthor(`${data.user.username}#${data.user.discriminator} (${data.user.id})`, data.user.avatar
				// @ts-ignore
				// eslint-disable-next-line new-cap
				? this.client.rest.cdn.Avatar(data.user.id, data.user.avatar)
				// @ts-ignore
				// eslint-disable-next-line new-cap
				: this.client.rest.cdn.DefaultAvatar(data.user.discriminator % 5))
			.setFooter('Member left')
			.setTimestamp());
	}

	public handleFarewellMessage(guild: Guild, user: APIUserData): void {
		if (guild.settings.get('channels.default') && guild.settings.get('messages.farewell')) {
			const channel = guild.channels.get(guild.settings.get('channels.default') as string) as TextChannel;
			if (channel && channel.postable)
				channel.send(this.transformMessage(guild, user)).catch((error) => this.client.emit('apiError', error));
			else guild.settings.reset('channels.default');
		}
	}

	public transformMessage(guild: Guild, user: APIUserData): string {
		return (guild.settings.get('messages.farewell') as string).replace(REGEXP, (match) => {
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
