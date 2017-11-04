const { Inhibitor } = require('../index');

module.exports = class extends Inhibitor {

	constructor(...args) {
		super(...args, { spamProtection: true });
		this.cooldowns = new Set();
	}

	async run(msg, cmd) {
		if (msg.author.id === this.client.config.ownerID) return;
		if (!cmd.cooldown || cmd.cooldown <= 0) return;

		const instance = cmd.cooldowns.get(msg.author.id);
		if (!instance) return;

		const remaining = ((cmd.cooldown * 1000) - (Date.now() - instance)) / 1000;
		if (remaining < 0) {
			cmd.cooldowns.delete(msg.author.id);
			this.cooldowns.delete(msg.author.id);
			return;
		}

		if (this.cooldowns.has(msg.author.id)) throw true;

		this.cooldowns.add(msg.author.id);
		setTimeout(() => this.cooldowns.delete(msg.author.id), Math.min(cmd.cooldown * 1000, 30000));

		throw msg.language.get('INHIBITOR_COOLDOWN', Math.ceil(remaining));
	}

};
