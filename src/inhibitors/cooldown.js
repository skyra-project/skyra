const { Inhibitor } = require('../index');

module.exports = class extends Inhibitor {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, { spamProtection: true });
	}

	async run(message, command) {
		if (message.author === this.client.owner || command.cooldown <= 0) return;
		const existing = command.cooldowns.get(message.levelID);
		if (existing && existing.limited) throw message.language.get('INHIBITOR_COOLDOWN', existing.remainingTime);
	}

};
