// @ts-nocheck
const { Extendable } = require('../index');

module.exports = class extends Extendable {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, { appliesTo: ['MessageEmbed'], name: 'splitFields' });
	}

	extend(content) {
		if (typeof content === 'undefined') return this;

		if (Array.isArray(content)) content = content.join('\n');
		if (content.length < 2048 && typeof this.description === 'undefined') {
			this.description = content;
			return this;
		}

		let x;
		while (content.length) {
			if (content.length < 1024) return this.addField('\u200B', content);

			x = content.slice(0, 1024).lastIndexOf('\n');
			if (x === -1) x = 1024;

			this.addField('\u200B', content.slice(0, x));
			content = content.slice(x + 1);
		}
		return this;
	}

};
