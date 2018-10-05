const { Command, util: { fetch }, MessageEmbed } = require('../../index');
const url = new URL('https://randomfox.ca/floof');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('COMMAND_FOX_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_FOX_EXTENDED')
		});
		this.spam = true;
	}

	async run(msg) {
		const { image, link } = await fetch(url, 'json');
		return msg.sendEmbed(new MessageEmbed()
			.setAuthor(msg.author.username, msg.author.displayAvatarURL({ size: 64 }))
			.setImage(image)
			.setURL(link)
			.setTimestamp());
	}

};
