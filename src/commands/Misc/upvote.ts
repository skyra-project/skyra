const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			aliases: ['updoot'],
			description: (language) => language.get('COMMAND_UPVOTE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_UPVOTE_EXTENDED')
		});
	}

	run(msg) {
		return msg.sendLocale('COMMAND_UPVOTE_MESSAGE');
	}

};
