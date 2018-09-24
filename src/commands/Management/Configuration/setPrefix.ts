const { Command } = require('../../../index');

module.exports = class extends Command {

	public constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('COMMAND_SETPREFIX_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_SETPREFIX_EXTENDED'),
			permissionLevel: 6,
			runIn: ['text'],
			usage: '<prefix:string{1,10}>'
		});
	}

	public async run(msg, [prefix]) {
		if (msg.guild.settings.prefix === prefix) throw msg.language.get('CONFIGURATION_EQUALS');
		await msg.guild.settings.update('prefix', prefix);
		return msg.sendLocale('COMMAND_SETPREFIX_SET', [prefix]);
	}

};
