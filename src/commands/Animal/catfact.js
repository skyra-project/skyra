const { Command, MessageEmbed, util: { fetch } } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['kittenfact'],
			requiredPermissions: ['EMBED_LINKS'],
			cooldown: 10,
			description: (msg) => msg.language.get('COMMAND_CATFACT_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_CATFACT_EXTENDED')
		});
		this.spam = true;
	}

	async run(msg) {
		const { fact } = await fetch('https://catfact.ninja/fact', 'json');
		return msg.sendEmbed(new MessageEmbed()
			.setColor(0xFFE0B2)
			.setTitle(msg.language.get('COMMAND_CATFACT_TITLE'))
			.setDescription(fact));
	}

};
