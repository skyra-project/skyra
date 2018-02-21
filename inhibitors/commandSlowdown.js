const { Inhibitor } = require('klasa');

module.exports = class extends Inhibitor {

	constructor(...args) {
		super(...args, { spamProtection: true });

		/**
		 * The slowmode map
		 * @since 3.0.0
		 * @type {Map<string, NodeJS.Timer>}
		 */
		this.slowmode = new Map();

		/**
		 * The slowmode time
		 * @since 3.0.0
		 * @type {number}
		 */
		this.slowmodeTime = this.client.options.slowmodeTime || 1000;
	}

	async run(msg) {
		if (msg.author !== this.client.owner) this.getEntry(msg.author.id);
	}

	getEntry(id) {
		const entry = this.slowmode.get(id);
		if (entry) clearTimeout(entry);
		this.slowmode.set(id, setTimeout(this.slowmode.delete, this.slowmodeTime, id));
		if (entry) throw true;
	}

};
