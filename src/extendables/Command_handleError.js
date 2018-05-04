const { Extendable } = require('klasa');
const { DiscordAPIError } = require('discord.js');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, {
			appliesTo: ['Command'],
			klasa: true,
			name: 'handleError'
		});
	}

	extend(error) {
		if (error && error instanceof DiscordAPIError) {
			const tempError = new Error(error.message);
			tempError.name = error.name;
			error.stack = tempError.stack;
		}
		throw error;
	}

};
