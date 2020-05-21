import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { CustomSearchType, GoogleResponseCodes, GooleCSEItem, handleNotOK, queryGoogleCustomSearchAPI } from '@utils/Google';
import { getColor, parseURL } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['google', 'googlesearch', 'g', 'search'],
	cooldown: 10,
	description: language => language.tget('COMMAND_GSEARCH_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_GSEARCH_EXTENDED'),
	requiredPermissions: ['EMBED_LINKS'],
	usage: '<query:query>'
})
export default class extends SkyraCommand {

	public async init() {
		this.createCustomResolver('query', (arg, possible, message) => this.client.arguments.get('string')!.run(
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
				.setImage(item.pagemap?.cse_image?.find(image => parseURL(image.src))?.src || ''));
		}

		return display;
	}

}
