const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			permissionLevel: 10,
			guarded: true,
			description: (language) => language.get('COMMAND_REBOOT_DESCRIPTION')
		});
	}

	async run(msg) {
		await msg.sendLocale('COMMAND_REBOOT').catch(err => this.client.emit('apiError', err));
		await this.client.dispose();
		process.exit();
	}

};
