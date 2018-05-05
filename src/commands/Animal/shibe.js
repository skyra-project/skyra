const { Command, MessageEmbed } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['kittenfact'],
			cooldown: 10,
			description: (msg) => msg.language.get('COMMAND_SHIBE_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_SHIBE_EXTENDED')
		});
		this.spam = true;
	}

	async run(msg) {
		const [url] = await this.fetchURL('http://shibe.online/api/shibes?count=1', 'json');
		return msg.sendEmbed(new MessageEmbed()
			.setColor(0xFFE0B2)
			.setImage(url));
	}

};
