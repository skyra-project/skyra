const { Command, Color } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['setcolour'],
			botPerms: ['EMBED_LINKS'],
			bucket: 2,
			cooldown: 10,
			description: msg => msg.language.get('COMMAND_SETCOLOR_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_SETCOLOR_EXTENDED'),
			usage: '<color:string>'
		});
		this.spam = true;
	}

	async run(msg, [input]) {
		const { hex, b10 } = Color.parse(input);

		await msg.author.configs.update('color', hex.toString().slice(1));
		return msg.sendEmbed(new this.client.methods.Embed()
			.setColor(b10.value)
			.setAuthor(msg.author.tag, msg.author.displayAvatarURL({ size: 128 }))
			.setDescription(msg.language.get('COMMAND_SETCOLOR', hex)));
	}

};
