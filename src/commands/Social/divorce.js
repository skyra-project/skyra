const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			requiredPermissions: ['ADD_REACTIONS'],
			description: msg => msg.language.get('COMMAND_DIVORCE_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_DIVORCE_EXTENDED')
		});
	}

	async run(msg) {
		if (!msg.author.configs.marry) return msg.sendLocale('COMMAND_DIVORCE_NOTTAKEN');

		// Ask the user if they're sure
		const accept = await msg.ask(msg.language.get('COMMAND_DIVORCE_PROMPT'));
		if (!accept) return msg.sendLocale('COMMAND_DIVORCE_CANCEL');

		// Fetch the user and sync the configuration
		const user = await this.client.users.fetch(msg.author.configs.marry);
		await user.configs.waitSync();

		// Reset the values for both entries
		await Promise.all([
			msg.author.configs.reset('marry'),
			user.configs.reset('marry')
		]);

		// Tell the user about the divorce
		user.send(msg.language.get('COMMAND_DIVORCE_DM', msg.author.username)).catch(() => null);

		return msg.sendLocale('COMMAND_DIVORCE_SUCCESS', user);
	}

};
