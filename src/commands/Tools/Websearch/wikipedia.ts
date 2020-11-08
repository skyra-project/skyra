import { DbSet } from '@lib/database';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { fetch, FetchResultTypes, isImageURL } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage, Language } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['wiki'],
	cooldown: 15,
	description: (language) => language.get(LanguageKeys.Commands.Tools.WikipediaDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Tools.WikipediaExtended),
	requiredPermissions: ['EMBED_LINKS'],
	usage: '<query:string>'
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [input]: [string]) {
		const language = await message.fetchLanguage();
		const text = await this.fetchText(input, language);
		// Only fetch images if the channel is NSFW permitted
		const image = Reflect.get(message.channel, 'nsfw') ? await this.fetchImage(input) : undefined;

		if (text.query.pageids[0] === '-1') {
			throw language.get(LanguageKeys.Commands.Tools.WikipediaNotfound);
		}

		const pageURL = `https://en.wikipedia.org/wiki/${this.parseURL(input)}`;
		const content = text.query.pages[text.query.pageids[0]];
		const definition = this.content(content.extract, pageURL, language);

		const embed = new MessageEmbed()
			.setTitle(content.title)
			.setURL(pageURL)
			.setColor(await DbSet.fetchColor(message))
			.setThumbnail('https://en.wikipedia.org/static/images/project-logos/enwiki.png')
			.setDescription(definition.replace(/\n{2,}/g, '\n').replace(/\s{2,}/g, ' '))
			.setFooter('© Wikipedia');

		// If there is an image and it is also a valid image URL then add it to the embed
		if (
			image &&
			image.query.pageids[0] !== '-1' &&
			image.query.pages[image.query.pageids[0]].thumbnail &&
			isImageURL(image.query.pages[image.query.pageids[0]].thumbnail.source)
		)
			embed.setImage(image.query.pages[image.query.pageids[0]].thumbnail.source);

		return message.sendEmbed(embed);
	}

	private async fetchText(input: string, language: Language) {
		try {
			const url = this.getBaseUrl(input);
			url.searchParams.append('prop', 'extracts');
			url.searchParams.append('explaintext', 'true');
			url.searchParams.append('exsectionformat', 'plain');
			url.searchParams.append('exchars', '300');

			return await fetch<WikipediaResultOk<'extracts'>>(url, FetchResultTypes.JSON);
		} catch {
			throw language.get(LanguageKeys.System.QueryFail);
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
		return encodeURIComponent(url.toLowerCase().replace(/[ ]/g, '_').replace(/\(/g, '%28').replace(/\)/g, '%29'));
	}

	private content(definition: string, url: string, language: Language) {
		if (definition.length < 300) return definition;
		return language.get(LanguageKeys.Misc.SystemTextTruncated, { definition, url });
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
