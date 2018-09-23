const { Command } = require('../../../index');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			requiredPermissions: ['EMBED_LINKS'],
			cooldown: 5,
			description: 'Get the information from a case by its index.',
			permissionLevel: 5,
			runIn: ['text'],
			usage: '<Case:integer>'
		});
	}

	async run(msg, [index]) {
		const modlog = await msg.guild.moderation.fetch(index);
		if (modlog) return msg.sendEmbed(await modlog.prepareEmbed());
		throw msg.language.get('COMMAND_REASON_NOT_EXISTS');
	}

};
