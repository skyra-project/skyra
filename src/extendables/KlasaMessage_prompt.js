// @ts-nocheck
const { Extendable } = require('../index');

module.exports = class extends Extendable {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			appliesTo: ['KlasaMessage'],
			klasa: true,
			name: 'prompt'
		});
	}

	async extend(text, time = 30000) {
		const message = await this.channel.send(text);
		const responses = await this.channel.awaitMessages(msg => msg.author === this.author, { time, max: 1 });
		message.nuke();
		if (responses.size === 0) throw this.language.get('MESSAGE_PROMPT_TIMEOUT');
		return responses.first();
	}

};
