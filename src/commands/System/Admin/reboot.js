const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permLevel: 10,
			guarded: true,
			description: (msg) => msg.language.get('COMMAND_REBOOT_DESCRIPTION')
		});
	}

	async run(msg) {
		await msg.sendMessage(msg.language.get('COMMAND_REBOOT')).catch(err => this.client.emit('apiError', err));
		await this.client.dispose();
		process.exit();
	}

};
