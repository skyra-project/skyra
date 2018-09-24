const { Command } = require('../../../index');

module.exports = class extends Command {

	public constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			permissionLevel: 10,
			guarded: true,
			description: (language) => language.get('COMMAND_REBOOT_DESCRIPTION')
		});
	}

	public async run(msg) {
		await msg.sendLocale('COMMAND_REBOOT').catch((err) => this.client.emit('apiError', err));

		try {
			await this.client.destroy();
			await this.client.dispose();
			await Promise.all(this.client.providers.map((provider) => provider.shutdown()));
		} catch (error) {} // eslint-disable-line no-empty

		process.exit();
		return null;
	}

};
