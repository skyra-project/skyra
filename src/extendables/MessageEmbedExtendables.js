// @ts-nocheck
const { Extendable, MessageEmbed } = require('../index');

module.exports = class extends Extendable {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, { appliesTo: [MessageEmbed] });
	}

	splitFields(content) {
		if (typeof content === 'undefined') return this;

		if (Array.isArray(content)) content = content.join('\n');
		if (content.length < 2048 && !this.description) {
			this.description = content;
			return this;
		}

		let x;
		while (content.length) {
			if (content.length < 1024) return this.fields.push({ name: '\u200B', value: content, inline: false });

			x = content.slice(0, 1024).lastIndexOf('\n');
			if (x === -1) x = 1024;

			this.fields.push({ name: '\u200B', value: content.slice(0, x), inline: false });
			content = content.slice(x + 1);
		}
		return this;
	}

};
