const { Extendable } = require('../index');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: ['MessageEmbed'], name: 'splitFields' });
	}

	extend(content) {
		if (typeof content === 'undefined') return this;

		if (Array.isArray(content)) content = content.join('\n');
		if (content.length < 2048 && typeof this.description === 'undefined') {
			this.description = content;
			return this;
		}
		let init = content;
		let i;
		let x;

		for (i = 0; i < content.length / 1024; i++) {
			if (init.length < 1024) return this.addField('\u200B', init);
			x = init.slice(0, 1024).lastIndexOf('\n');
			if (x === -1) x = 1024;

			this.addField('\u200B', init.slice(0, x));
			init = init.slice(x, init.length);
		}
		return this;
	}

};
