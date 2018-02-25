const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			bucket: 2,
			cooldown: 20,
			description: (msg) => msg.language.get('COMMAND_FEEDBACK_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_FEEDBACK_EXTENDED'),
			guarded: true,
			usage: '<message:string{8,1900}>'
		});

		this.channel = null;
	}

	async run(msg, [feedback]) {
		const embed = new this.client.methods.Embed()
			.setColor(0x06d310)
			.setAuthor(`${msg.author.tag}`, msg.author.displayAvatarURL({ size: 128 }))
			.setDescription(feedback)
			.setFooter(`${msg.author.id} | Feedback`)
			.setTimestamp();

		if (msg.deletable) msg.nuke().catch(() => null);

		await this.channel.send({ embed })
			.catch(Command.handleError);

		return msg.alert(msg.language.get('COMMAND_FEEDBACK'));
	}

	init() {
		this.channel = this.client.channels.get('257561807500214273');
	}

};
