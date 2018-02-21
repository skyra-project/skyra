const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: (msg) => msg.language.get('COMMAND_DONATE_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_DONATE_EXTENDED'),
			guarded: true
		});
	}

	async run(msg) {
		return msg.author.send(msg.language.get('COMMAND_DONATE_EXTENDED'))
			.then(() => { if (msg.channel.type !== 'dm') msg.alert(msg.language.get('COMMAND_DM_SENT')); })
			.catch(() => { if (msg.channel.type !== 'dm') msg.alert(msg.language.get('COMMAND_DM_NOT_SENT')); });
	}

};
