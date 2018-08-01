const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			description: (language) => language.get('COMMAND_DONATE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_DONATE_EXTENDED'),
			guarded: true
		});
	}

	async run(msg) {
		return msg.author.send(msg.language.get('COMMAND_DONATE_EXTENDED'))
			.then(() => { if (msg.channel.type !== 'dm') msg.alert(msg.language.get('COMMAND_DM_SENT')); })
			.catch(() => { if (msg.channel.type !== 'dm') msg.alert(msg.language.get('COMMAND_DM_NOT_SENT')); });
	}

};
