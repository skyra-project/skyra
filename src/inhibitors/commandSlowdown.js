const { Inhibitor } = require('../index');

module.exports = class extends Inhibitor {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, { spamProtection: true });

		/**
		 * The slowmode time
		 * @since 3.0.0
		 * @type {number}
		 */
		this.slowmodeTime = this.client.options.slowmodeTime || 750;
	}

	async run(msg) {
		if (msg.author !== this.client.owner) this.getEntry(`slowdown-${msg.author.id}`);
	}

	getEntry(id) {
		const had = this.client.timeoutManager.has(id);
		this.client.timeoutManager.set(id, Date.now() + this.slowmodeTime, () => null, true);
		if (had) throw true;
	}

};
