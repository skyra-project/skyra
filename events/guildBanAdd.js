const { structures: { Event }, management: { ModerationLog } } = require('../index');

module.exports = class extends Event {

	async run(guild, user) {
		if (this.client.ready !== true || guild.available !== true) return null;

		const settings = await guild.settings;
		if (settings.events.banAdd !== true) return null;

		return new ModerationLog(guild)
			.setAnonymous(true)
			.setUser(user)
			.setType('ban')
			.send()
			.catch(err => this.client.emit('log', err, 'error'));
	}

};
