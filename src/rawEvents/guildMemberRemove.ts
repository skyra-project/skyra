import { RawEvent, MessageEmbed, constants: { MESSAGE_LOGS } } from '../index';
const REGEXP = /%MEMBER%|%MEMBERNAME%|%MEMBERTAG%|%GUILD%/g;
const MATCHES = {
	MEMBER: '%MEMBER%',
	MEMBERNAME: '%MEMBERNAME%',
	MEMBERTAG: '%MEMBERTAG%',
	GUILD: '%GUILD%'
};

export default class extends RawEvent {

	/**
	 *	GUILD_MEMBER_REMOVE Packet
	 *	##########################
	 *	{
	 *		user: {
	 *			username: 'username',
	 *			id: 'id',
	 *			discriminator: 'discriminator',
	 *			avatar: 'avatar'
	 *		},
	 *		guild_id: 'id'
	 *	}
	 */

	async run(data) {
		const guild = this.client.guilds.get(data.guild_id);
		if (!guild || !guild.available) return;

		guild.memberSnowflakes.delete(data.user.id);
		if (!this.client.guilds.some(g => g.memberSnowflakes.has(data.user.id))) this.client.usernames.delete(data.user.id);
		if (guild.members.has(data.user.id)) guild.members.delete(data.user.id);
		if (guild.security.raid.has(data.user.id)) guild.security.raid.delete(data.user.id);

		if (guild.settings.events.memberRemove) {
			this.handleMemberLog(guild, data);
			this.handleFarewellMessage(guild, data);
		}
	}

	handleMemberLog(guild, data) {
		this.client.emit('guildMessageLog', MESSAGE_LOGS.kMember, guild, () => new MessageEmbed()
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

	handleFarewellMessage(guild, user) {
		if (guild.settings.channels.default && guild.settings.messages.farewell) {
			const channel = guild.channels.get(guild.settings.channels.default);
			if (channel && channel.postable)
				channel.send(this.transformMessage(guild, user)).catch(error => this.client.emit('apiError', error));
			else guild.settings.reset('channels.default');
		}
	}

	transformMessage(guild, user) {
		return guild.settings.messages.farewell.replace(REGEXP, match => {
			switch (match) {
				case MATCHES.MEMBER: return `<@${user.id}>`;
				case MATCHES.MEMBERNAME: return user.username;
				case MATCHES.MEMBERTAG: return user.tag;
				case MATCHES.GUILD: return guild.name;
				default: return match;
			}
		});
	}

};
