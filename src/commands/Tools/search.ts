import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { fetch } from '../../lib/util/util';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['duckduckgo'],
			cooldown: 15,
			description: language => language.get('COMMAND_SEARCH_DESCRIPTION'),
			extendedHelp: language => language.get('COMMAND_SEARCH_EXTENDED'),
			usage: '<query:string>',
			usageDelim: ' ',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	public async run(message: KlasaMessage, [query]: [string]) {
		const body = await fetch(`http://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`, 'json');

		if (body.Heading.length === 0) {
			throw message.language.get('COMMAND_DUCKDUCKGO_NOTFOUND');
		}

		const embed = new MessageEmbed()
			.setTitle(body.Heading)
			.setURL(body.AbstractURL)
			.setThumbnail(body.Image)
			.setDescription(body.AbstractText);

		if (body.RelatedTopics && body.RelatedTopics.length > 0) {
			embed.addField(message.language.get('COMMAND_DUCKDUCKGO_LOOKALSO'), body.RelatedTopics[0].Text);
		}

		return message.sendMessage({ embed });
	}

}
