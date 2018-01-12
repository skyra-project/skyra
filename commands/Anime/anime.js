const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 10,
			botPerms: ['EMBED_LINKS'],
			usage: '<query:string>',
			description: (msg) => msg.language.get('COMMAND_ANIME_ANIME_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_ANIME_ANIME_EXTENDED')
		});
	}

	// async run(msg, [...params]) {
	// 	// This is where you place the code you want to run for your command

	// }

	// async init() {
	// 	// You can optionally define this method which will be run when the bot starts (after login, so discord data is available via this.client)
	// }

};
