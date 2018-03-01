const { RawEvent } = require('../index');
const REGEXP = /%MEMBER%|%MEMBERNAME%|%MEMBERTAG%|%GUILD%/g;

module.exports = class extends RawEvent {

	constructor(...args) {
		super(...args, {
			name: 'GUILD_MEMBER_REMOVE'
		});
	}

	async run({ guild, user }) {
		if (!guild.available) return;
		if (guild.security.hasRAID(user.id)) guild.security.raid.delete(user.id);
		if (guild.configs.events.memberRemove) {
			this._handleLog(guild, user).catch(error => this.client.emit('error', error));
			this._handleMessage(guild, user).catch(error => this.client.emit('error', error));
		}
	}

	async _handleLog(guild, user) {
		if (guild.configs.channels.log) {
			const channel = guild.channels.get(guild.configs.channels.log);
			if (!channel) {
				await guild.configs.reset('channels.log');
				return;
			}
			await channel.send(new this.client.methods.Embed()
				.setColor(0xF9A825)
				.setAuthor(`${user.tag} (${user.id})`, user.displayAvatarURL())
				.setFooter('Member left')
				.setTimestamp());
		}
	}

	async _handleMessage(guild, user) {
		if (guild.configs.channels.default && guild.configs.messages.farewell) {
			const channel = guild.channels.get(guild.configs.channels.default);
			if (channel) await channel.send(this._handleFarewell(guild, user));
			else await guild.configs.reset('channels.default');
		}
	}

	_handleFarewell(guild, user) {
		return guild.configs.messages.farewell.replace(REGEXP, match => {
			switch (match) {
				case '%MEMBER%': return `<@${user.id}>`;
				case '%MEMBERNAME%': return user.username;
				case '%MEMBERTAG%': return user.tag;
				case '%GUILD%': return guild.name;
				default: return match;
			}
		});
	}

	process(data) {
		const guild = this.client.guilds.get(data.guild_id);
		const user = this.client.users.add(data.user);
		return { guild, user };
	}

};
