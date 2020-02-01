import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { BrandingColors } from '@utils/constants';
import { CustomSearchType, GooleCSEItem, queryGoogleCustomSearchAPI, handleNotOK, GoogleResponseCodes } from '@utils/Google';
import { getColor } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {

	private stringArgtype = this.client.arguments.get('string')!;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['google', 'googlesearch', 'g', 'search'],
			cooldown: 10,
			description: language => language.tget('COMMAND_GSEARCH_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_GSEARCH_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			usage: '<query:query>'
		});

		this.createCustomResolver('query', (arg, possible, message) => this.stringArgtype.run(
			arg.replace(/(who|what|when|where) ?(was|is|were|are) ?/gi, '').replace(/ /g, '+'),
			possible,
			message
		));
	}

	public async run(message: KlasaMessage, [query]: [string]) {
		const [response, { items }] = await Promise.all([
			message.sendEmbed(new MessageEmbed()
				.setDescription(message.language.tget('SYSTEM_LOADING'))
				.setColor(BrandingColors.Secondary)),
			queryGoogleCustomSearchAPI<CustomSearchType.Search>(message, CustomSearchType.Search, query)
		]);

		if (!items || !items.length) throw message.language.tget(handleNotOK(GoogleResponseCodes.ZeroResults, message.client));

		const display = this.buildDisplay(message, items);

		await display.start(response, message.author.id);
		return response;
	}

	private buildDisplay(message: KlasaMessage, items: GooleCSEItem[]) {
		const display = new UserRichDisplay(new MessageEmbed()
			.setColor(getColor(message)));

		for (const item of items) {
			display.addPage((embed: MessageEmbed) => embed
				.setTitle(item.title)
				.setURL(item.link)
				.setDescription(item.snippet)
				.setImage(item.pagemap?.cse_image?.[0].src || ''));
		}

		return display;
	}

}
