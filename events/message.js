const { structures: { Event } } = require('../index');

module.exports = class extends Event {

	async run(msg) {
		if (this.client.ready) {
			let settings = msg.guildSettings;
			if (settings instanceof Promise) settings = await settings;

			const i18n = this.client.languages.get(settings.master.language);
			this.client.monitors.run(msg, settings, i18n);
		}
	}

};
