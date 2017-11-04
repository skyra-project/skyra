const { Event, ModLog } = require('../index');

module.exports = class extends Event {

	async run(guild, user) {
		if (this.client.ready !== true || guild.available !== true) return null;
		let settings = guild.settings;
		if (settings instanceof Promise) settings = await settings;

		if (guild.settings.events.banRemove !== true) return null;
		return new ModLog(guild)
			.setAnonymous(true)
			.setUser(user)
			.setType('unban')
			.send()
			.catch(err => this.client.emit('log', err, 'error'));
	}

};
