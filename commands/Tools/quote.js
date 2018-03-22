const { Command } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			botPerms: ['EMBED_LINKS'],
			cooldown: 10,
			description: msg => msg.language.get('COMMAND_QUOTE_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_QUOTE_EXTENDED'),
			usage: '[channel:channel] <message:string{17,21}>',
			usageDelim: ' '
		});
	}

	async run(msg, [channel = msg.channel, searchMessage]) {
		if (/[0-9]{17,21}/.test(searchMessage) === false)
			throw msg.language.get('RESOLVER_INVALID_MSG', 'Message');

		const mes = await channel.messages.fetch(searchMessage)
			.catch(() => { throw msg.language.get('SYSTEM_MESSAGE_NOT_FOUND'); });

		const attachment = mes.attachments.size
			? mes.attachments.find(att => /jpg|png|webp|gif/.test(att.url.split('.').pop()))
			: null;

		if (attachment === null && mes.content === '') throw msg.language.get('COMMAND_QUOTE_MESSAGE');

		const embed = new this.client.methods.Embed()
			.setAuthor(mes.author.tag, mes.author.displayAvatarURL({ size: 128 }))
			.setDescription(mes.content)
			.setImage(attachment ? attachment.url : null)
			.setTimestamp(mes.createdAt);

		return msg.sendMessage({ embed });
	}

};
