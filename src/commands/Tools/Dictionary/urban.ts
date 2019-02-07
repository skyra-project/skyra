import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaClient, KlasaMessage, Language, util } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';
import { cutText, fetch } from '../../../lib/util/util';

const ZWS = '\u200B';

export default class extends SkyraCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['ud', 'urbandictionary'],
			cooldown: 15,
			description: (language) => language.get('COMMAND_URBAN_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_URBAN_EXTENDED'),
			nsfw: true,
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text'],
			usage: '<query:string> [page:integer{0,10}]',
			usageDelim: '#'
		});
	}

	public async run(message: KlasaMessage, [query, ind = 1]: [string, number]) {
		const index = ind - 1;
		if (index < 0)
			throw message.language.get('RESOLVER_POSITIVE_AMOUNT');

		const { list } = await fetch(`http://api.urbandictionary.com/v0/define?term=${encodeURIComponent(query)}`, 'json');

		const result = list[index];
		if (typeof result === 'undefined') {
			throw index === 0
				? message.language.get('COMMAND_URBAN_NOTFOUND')
				: message.language.get('COMMAND_URBAN_INDEX_NOTFOUND');
		}

		const definition = this.content(result.definition, result.permalink, message.language);
		return message.sendEmbed(new MessageEmbed()
			.setTitle(`Word: ${util.toTitleCase(query)}`)
			.setURL(result.permalink)
			.setColor(message.member.displayColor)
			.setThumbnail('http://i.imgur.com/CcIZZsa.png')
			.splitFields(message.language.get('COMMAND_URBAN_OUTPUT', ind, list.length, definition, result.example, result.author))
			.addField(ZWS, `\\👍 ${result.thumbs_up}`, true)
			.addField(ZWS, `\\👎 ${result.thumbs_down}`, true)
			.setFooter('© Urban Dictionary'));
	}

	public content(definition: string, permalink: string, i18n: Language) {
		if (definition.length < 750) return definition;
		return i18n.get('SYSTEM_TEXT_TRUNCATED', cutText(definition, 750), permalink);
	}

}
