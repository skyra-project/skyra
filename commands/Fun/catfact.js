const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['kittenfact'],
			cooldown: 10,
			description: (msg) => msg.language.get('COMMAND_CATFACT_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_CATFACT_EXTENDED')
		});
		this.spam = true;
	}

	async run(msg) {
		const { fact } = await this.fetchURL('https://catfact.ninja/fact', 'json');
		const embed = new this.client.methods.Embed()
			.setColor(0xFFE0B2)
			.setTitle(msg.language.get('COMMAND_CATFACT_TITLE'))
			.setDescription(fact);

		return msg.sendEmbed(embed);
	}

};
