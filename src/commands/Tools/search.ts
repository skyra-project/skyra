const { Command, MessageEmbed, util: { fetch } } = require('../../index');

module.exports = class extends Command {

	public constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			aliases: ['duckduckgo'],
			cooldown: 15,
			description: (language) => language.get('COMMAND_SEARCH_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_SEARCH_EXTENDED'),
			usage: '<query:string>',
			usageDelim: ' '
		});
	}

	public async run(msg, [query]) {
		const body = await fetch(`http://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`, 'json');

		if (body.Heading.length === 0)
			throw msg.language.get('COMMAND_DUCKDUCKGO_NOTFOUND');

		const embed = new MessageEmbed()
			.setAuthor(body.Heading, this.client.user.displayAvatarURL({ size: 64 }))
			.setURL(body.AbstractURL)
			.setThumbnail(body.Image)
			.setDescription(body.AbstractText);

		if (body.RelatedTopics && body.RelatedTopics.length > 0)
			embed.addField(msg.language.get('COMMAND_DUCKDUCKGO_LOOKALSO'), body.RelatedTopics[0].Text);

		msg.sendMessage({ embed });
	}

};
