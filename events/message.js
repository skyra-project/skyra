const { Event } = require('klasa');

module.exports = class extends Event {

	async run(msg) {
		if (this.client.ready) {
			if (!msg.webhookID && msg.guild && !msg.member) await msg.guild.members.fetch(msg.author.id);
			this.client.monitors.run(msg);
		}
	}

};
