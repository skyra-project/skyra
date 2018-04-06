const { Command, Color } = require('../../index');
const { MessageEmbed } = require('discord.js');

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
		const color = hex.toString().slice(1);

		await msg.author.configs.update({ color });
		return msg.sendEmbed(new MessageEmbed()
			.setColor(b10.value)
			.setAuthor(msg.author.tag, msg.author.displayAvatarURL({ size: 128 }))
			.setDescription(msg.language.get('COMMAND_SETCOLOR', hex)));
	}

};
