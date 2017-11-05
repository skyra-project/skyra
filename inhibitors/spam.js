const { structures: { Inhibitor } } = require('../index');

module.exports = class extends Inhibitor {

	constructor(...args) {
		super(...args, { spamProtection: true });
		this.cooldowns = new Set();
	}

	async run(msg, cmd, settings, i18n) {
		if (msg.author.id === this.client.config.ownerID
												|| cmd.spam !== true
												|| msg.channel.type !== 'text'
												|| settings.channels.spam === msg.channel.id
												|| await msg.hasLevel(2)) return;

		if (this.cooldowns.has(msg.channel.id)) throw true;

		const channel = msg.guild.channels.get(settings.channels.spam);
		if (!channel) {
			await settings.update({ channels: { spam: null } });
			return;
		}

		this.cooldowns.add(msg.channel.id);
		setTimeout(() => this.cooldowns.delete(msg.channel.id), 30000);

		throw i18n.get('INHIBITOR_SPAM', channel);
	}

};
