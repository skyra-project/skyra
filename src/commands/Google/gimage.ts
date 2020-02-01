import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { BrandingColors } from '@utils/constants';
import { CustomSearchType, GoogleCSEImageData, queryGoogleCustomSearchAPI, handleNotOK, GoogleResponseCodes } from '@utils/Google';
import { getColor } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {

	private stringArgtype = this.client.arguments.get('string')!;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['googleimage', 'img', 'i'],
			cooldown: 10,
			nsfw: true, // Google will return explicit results when seaching for explicit terms, even when safe-search is on
			description: language => language.tget('COMMAND_GIMAGE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_GIMAGE_EXTENDED'),
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
			queryGoogleCustomSearchAPI<CustomSearchType.Image>(message, CustomSearchType.Image, query)
		]);

		if (!items || !items.length) throw message.language.tget(handleNotOK(GoogleResponseCodes.ZeroResults, message.client));

		const display = this.buildDisplay(message, items);

		await display.start(response, message.author.id);
		return response;
	}

	private buildDisplay(message: KlasaMessage, items: GoogleCSEImageData[]) {
		const display = new UserRichDisplay(new MessageEmbed()
			.setColor(getColor(message)));

		for (const item of items) {
			display.addPage((embed: MessageEmbed) => embed
				.setTitle(item.title)
				.setURL(item.image.contextLink)
				.setImage(item.link));
		}

		return display;
	}

}
