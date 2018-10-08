const { RawEvent, MessageEmbed, constants: { MESSAGE_LOGS } } = require('../index');
const REGEXP = /%MEMBER%|%MEMBERNAME%|%MEMBERTAG%|%GUILD%/g;
const MATCHES = {
	MEMBER: '%MEMBER%',
	MEMBERNAME: '%MEMBERNAME%',
	MEMBERTAG: '%MEMBERTAG%',
	GUILD: '%GUILD%'
};

module.exports = class extends RawEvent {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, { name: 'GUILD_MEMBER_REMOVE' });
	}

	async run({ guild, user }) {
		guild.memberSnowflakes.delete(user.id);
		if (!this.client.guilds.some(g => g.memberSnowflakes.has(user.id))) this.client.usernames.delete(user.id);
		if (guild.members.has(user.id)) guild.members.delete(user.id);
		if (guild.security.raid.has(user.id)) guild.security.raid.delete(user.id);
		if (guild.settings.events.memberRemove) {
			this._handleLog(guild, user).catch(error => this.client.emit('apiError', error));
			this._handleMessage(guild, user).catch(error => this.client.emit('apiError', error));
		}
	}

	async _handleLog(guild, user) {
		this.client.emit('guildMessageLog', MESSAGE_LOGS.kMember, guild, () => new MessageEmbed()
			.setColor(0xF9A825)
			.setAuthor(`${user.tag} (${user.id})`, user.displayAvatarURL())
			.setFooter('Member left')
			.setTimestamp());
	}

	async _handleMessage(guild, user) {
		if (guild.settings.channels.default && guild.settings.messages.farewell) {
			const channel = guild.channels.get(guild.settings.channels.default);
			if (channel && channel.postable) await channel.send(this._handleFarewell(guild, user));
			else await guild.settings.reset('channels.default');
		}
	}

	_handleFarewell(guild, user) {
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

	async process(data) {
		const guild = this.client.guilds.get(data.guild_id);
		if (!guild || !guild.available) return null;

		return { guild, user: this.client.users.add(data.user) };
	}

};
