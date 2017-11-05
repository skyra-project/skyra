const { structures: { Event } } = require('../index');

module.exports = class extends Event {

	async run(msg) {
		if (this.client.ready) {
			const settings = await msg.guildSettings;
			const i18n = this.client.languages.get(settings.master.language);
			this.client.monitors.run(msg, settings, i18n);
		}
	}

};
