const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['updoot'],
			description: msg => msg.language.get('COMMAND_UPVOTE_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_UPVOTE_EXTENDED')
		});
	}

	run(msg) {
		return msg.sendLocale('COMMAND_UPVOTE_MESSAGE');
	}

};
