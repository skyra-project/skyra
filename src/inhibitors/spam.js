const { Inhibitor } = require('../index');

module.exports = class extends Inhibitor {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, { spamProtection: true });

		/**
		 * The spam slowmode map
		 * @since 3.0.0
		 * @type {Set<string>}
		 */
		this.cooldowns = new Set();
	}

	async run(msg, cmd) {
		if (!cmd.spam
			|| !msg.guild
			|| msg.guild.configs.channels.spam === msg.channel.id
			|| await msg.hasAtLeastPermissionLevel(5)) return;

		if (this.cooldowns.has(msg.channel.id)) throw true;

		const channel = msg.guild.channels.get(msg.guild.configs.channels.spam);
		if (!channel) {
			await msg.guild.configs.reset('channels.spam');
			return;
		}

		this.cooldowns.add(msg.channel.id);
		setTimeout(() => this.cooldowns.delete(msg.channel.id), 30000);

		throw msg.language.get('INHIBITOR_SPAM', channel);
	}

};
