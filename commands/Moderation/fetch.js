const { Command } = require('../../index');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			guildOnly: true,
			permLevel: 1,
			botPerms: ['EMBED_LINKS'],
			mode: 2,
			cooldown: 30,

			usage: '<message:string{17,21}> [limit:int]',
			usageDelim: ' ',
			description: 'Discover the context of a message.'
		});
	}

	async run(msg, [message, limit = 10], settings, i18n) {
		if (!/^[0-9]{17,21}$/.test(message)) throw i18n.get('RESOLVER_INVALID_MSG', 'Message');
		const msgs = await msg.channel.messages.fetch({ limit, around: message }).then(messages => Array.from(messages.values()));
		const messages = [];

		for (let i = msgs.length - 1; i > 0; i--)
			messages.push(`${msgs[i].author.username} ❯ ${msgs[i].cleanContent || '**`IMAGE/EMBED`**'}`);

		const embed = new MessageEmbed()
			.setColor(msg.member.highestRole.color || 0xdfdfdf)
			.setTitle(`Context of ${message}`)
			.setDescription(messages)
			.setFooter(this.client.user.username, this.client.user.displayAvatarURL({ size: 128 }));

		return msg.send({ embed });
	}

};
