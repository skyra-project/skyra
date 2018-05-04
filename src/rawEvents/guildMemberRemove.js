const { RawEvent, MessageEmbed } = require('../index');
const REGEXP = /%MEMBER%|%MEMBERNAME%|%MEMBERTAG%|%GUILD%/g;
const MATCHES = {
	MEMBER: '%MEMBER%',
	MEMBERNAME: '%MEMBERNAME%',
	MEMBERTAG: '%MEMBERTAG%',
	GUILD: '%GUILD%'
};

module.exports = class extends RawEvent {

	constructor(...args) {
		super(...args, { name: 'GUILD_MEMBER_REMOVE' });
	}

	async run({ guild, user }) {
		if (guild.members.has(user.id)) guild.members.delete(user.id);
		if (guild.security.hasRAID(user.id)) guild.security.raid.delete(user.id);
		if (guild.configs.events.memberRemove) {
			this._handleLog(guild, user).catch(error => this.client.emit('apiError', error));
			this._handleMessage(guild, user).catch(error => this.client.emit('apiError', error));
		}
	}

	async _handleLog(guild, user) {
		if (guild.configs.channels.log) {
			const channel = guild.channels.get(guild.configs.channels.log);
			if (channel && channel.postable) {
				await channel.send(new MessageEmbed()
					.setColor(0xF9A825)
					.setAuthor(`${user.tag} (${user.id})`, user.displayAvatarURL())
					.setFooter('Member left')
					.setTimestamp());
			} else { await guild.configs.reset('channels.log'); }
		}
	}

	async _handleMessage(guild, user) {
		if (guild.configs.channels.default && guild.configs.messages.farewell) {
			const channel = guild.channels.get(guild.configs.channels.default);
			if (channel && channel.postable) await channel.send(this._handleFarewell(guild, user));
			else await guild.configs.reset('channels.default');
		}
	}

	_handleFarewell(guild, user) {
		return guild.configs.messages.farewell.replace(REGEXP, match => {
			switch (match) {
				case MATCHES.MEMBER: return `<@${user.id}>`;
				case MATCHES.MEMBERNAME: return user.username;
				case MATCHES.MEMBERTAG: return user.tag;
				case MATCHES.GUILD: return guild.name;
				default: return match;
			}
		});
	}

	async process(data) {
		const guild = this.client.guilds.get(data.guild_id);
		if (!guild || !guild.available) return null;

		return { guild, user: this.client.users.add(data.user) };
	}

};
