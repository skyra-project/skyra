import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import { fetch, FetchResultTypes, getImageUrl } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['wiki'],
	cooldown: 15,
	description: LanguageKeys.Commands.Tools.WikipediaDescription,
	extendedHelp: LanguageKeys.Commands.Tools.WikipediaExtended,
	requiredPermissions: ['EMBED_LINKS'],
	usage: '<query:string>'
})
export default class extends SkyraCommand {
	public async run(message: Message, [input]: [string]) {
		const t = await message.fetchT();
		const text = await this.fetchText(input, t);

		// Only fetch images if the channel is NSFW permitted
		const image = Reflect.get(message.channel, 'nsfw') ? await this.fetchImage(input) : undefined;

		if (text.query.pageids[0] === '-1') {
			throw t(LanguageKeys.Commands.Tools.WikipediaNotFound);
		}

		const pageInformation = text.query.pages[text.query.pageids[0]];
		const pageUrl = `https://en.wikipedia.org/wiki/${this.parseURL(pageInformation.title)}`;
		const definition = this.content(pageInformation.extract, pageUrl, t);

		const embed = new MessageEmbed()
			.setTitle(pageInformation.title)
			.setURL(pageUrl)
			.setColor(await DbSet.fetchColor(message))
			.setThumbnail('https://en.wikipedia.org/static/images/project-logos/enwiki.png')
			.setDescription(definition.replace(/\n{2,}/g, '\n').replace(/\s{2,}/g, ' '))
			.setFooter('© Wikipedia');

		// If there is an image and it is also a valid image URL then add it to the embed
		const imageUrl =
			image &&
			image.query.pageids[0] !== '-1' &&
			image.query.pages[image.query.pageids[0]].thumbnail &&
			getImageUrl(image.query.pages[image.query.pageids[0]].thumbnail.source);

		if (imageUrl) {
			embed.setImage(imageUrl);
		}

		return message.send(embed);
	}

	private async fetchText(input: string, t: TFunction) {
		try {
			const url = this.getBaseUrl(input);
			url.searchParams.append('prop', 'extracts');
			url.searchParams.append('explaintext', 'true');
			url.searchParams.append('exsectionformat', 'plain');
			url.searchParams.append('exchars', '300');

			return await fetch<WikipediaResultOk<'extracts'>>(url, FetchResultTypes.JSON);
		} catch {
			throw t(LanguageKeys.System.QueryFail);
		}
	}

	private async fetchImage(input: string) {
		try {
			const url = this.getBaseUrl(input);
			url.searchParams.append('prop', 'pageimages');
			url.searchParams.append('pithumbsize', '1000');

			return await fetch<WikipediaResultOk<'pageimages'>>(url, FetchResultTypes.JSON);
		} catch {
			return undefined;
		}
	}

	private getBaseUrl(input: string) {
		const url = new URL('https://en.wikipedia.org/w/api.php');
		url.searchParams.append('action', 'query');
		url.searchParams.append('format', 'json');
		url.searchParams.append('indexpageids', 'true');
		url.searchParams.append('redirects', 'true');
		url.searchParams.append('converttitles', 'true');
		url.searchParams.append('exlimit', '1');
		url.searchParams.append('titles', input);

		return url;
	}

	private parseURL(url: string) {
		return encodeURIComponent(url.replace(/[ ]/g, '_').replace(/\(/g, '%28').replace(/\)/g, '%29'));
	}

	private content(definition: string, url: string, t: TFunction) {
		if (definition.length < 300) return definition;
		return t(LanguageKeys.Misc.SystemTextTruncated, { definition, url });
	}
}

interface WikipediaResultOk<T extends 'extracts' | 'pageimages'> {
	batchcomplete: string;
	query: WikipediaResultOkQuery<T>;
}

interface WikipediaResultOkQuery<T extends 'extracts' | 'pageimages'> {
	normalized: WikipediaResultOkNormalized[];
	pageids: string[];
	pages: WikipediaResultOkPages<T>;
}

interface WikipediaResultOkNormalized {
	from: string;
	to: string;
}

interface WikipediaResultOkPages<T extends 'extracts' | 'pageimages'>
	extends Record<string, T extends 'extracts' ? WikipediaExtractResultsOkPage : WikipediaPageImagesResultsOkPage> {}

interface WikipediaResultsOkPageGeneral {
	pageid: number;
	ns: number;
	title: string;
}

interface WikipediaExtractResultsOkPage extends WikipediaResultsOkPageGeneral {
	extract: string;
}

interface WikipediaPageImagesResultsOkPage extends WikipediaResultsOkPageGeneral {
	thumbnail: WikipediaPageImageThumbnail;
	pageimage: string;
}

interface WikipediaPageImageThumbnail {
	source: string;
	width: number;
	height: number;
}
