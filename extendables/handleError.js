const { Extendable } = require('klasa');
const { DiscordAPIError } = require('discord.js');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, ['Command'], { klasa: true });
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
