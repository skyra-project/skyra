import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage, Language } from 'klasa';
import { URL } from 'url';
import { TOKENS } from '../../../config';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { fetch } from '../../lib/util/util';

const REG_GOOGL = /^https:\/\/goo\.gl\/.+/;
const LONG_URL = new URL('https://www.googleapis.com/urlshortener/v1/url');
LONG_URL.searchParams.set('key', TOKENS.GOOGLE_API);

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['shortenurl', 'googleshorturl', 'shorten'],
			cooldown: 15,
			description: language => language.get('COMMAND_GOOGL_DESCRIPTION'),
			extendedHelp: language => language.get('COMMAND_GOOGL_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			usage: '<URL:url>'
		});
	}

	public async run(message: KlasaMessage, [url]: [string]) {
		return message.sendEmbed(new MessageEmbed()
			.setDescription(await (REG_GOOGL.test(url) ? this.short(url, message.language) : this.long(url, message.language)))
			.setTimestamp());
	}

	public async long(longUrl: string, i18n: Language) {
		const body = await fetch(LONG_URL, { method: 'POST', body: JSON.stringify({ longUrl }) }, 'json');
		return i18n.get('COMMAND_GOOGL_LONG', body.id);
	}

	public async short(shortUrl: string, i18n: Language) {
		const url = new URL('https://www.googleapis.com/urlshortener/v1/url');
		url.searchParams.append('key', TOKENS.GOOGLE_API);
		url.searchParams.append('shortURL', shortUrl);

		const body = await fetch(url, 'json');
		return i18n.get('COMMAND_GOOGL_SHORT', body.longUrl);
	}

}
