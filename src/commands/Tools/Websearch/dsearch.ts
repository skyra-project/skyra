import { DbSet } from '#lib/database';
import { QueryError } from '#lib/errors/QueryError';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { fetch, FetchResultTypes } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['duckduckgo'],
	cooldown: 15,
	description: LanguageKeys.Commands.Tools.DuckDuckGoDescription,
	extendedHelp: LanguageKeys.Commands.Tools.DuckDuckGoExtended,
	usage: '<query:string>',
	usageDelim: ' ',
	requiredPermissions: ['EMBED_LINKS']
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, [query]: [string]) {
		const url = new URL('https://api.duckduckgo.com');
		url.searchParams.append('q', query);
		url.searchParams.append('format', 'json');
		url.searchParams.append('no_html', '1');
		url.searchParams.append('t', 'skyra-project');

		const t = await message.fetchT();
		const body = await fetch<DuckDuckGoResultOk>(url, FetchResultTypes.JSON).catch((error) => {
			throw t(this.handleFetchError(error));
		});

		if (body.Heading.length === 0) {
			throw t(LanguageKeys.Commands.Tools.DuckDuckGoNotFound);
		}

		const embed = new MessageEmbed()
			.setColor(await DbSet.fetchColor(message))
			.setTitle(body.Heading)
			.setURL(body.AbstractURL)
			.setThumbnail(body.Image)
			.setDescription(body.AbstractText)
			.setFooter(t(LanguageKeys.Commands.Tools.DuckDuckGoPoweredBy));

		if (body.RelatedTopics && body.RelatedTopics.length > 0) {
			embed.addField(t(LanguageKeys.Commands.Tools.DuckDuckGoLookAlso), body.RelatedTopics[0].Text);
		}

		return message.send(embed);
	}

	private handleFetchError(error: Error) {
		return error instanceof QueryError //
			? LanguageKeys.Commands.Tools.DuckDuckGoNotFound
			: LanguageKeys.Commands.Tools.DuckDuckGoUnknownError;
	}
}

export interface DuckDuckGoResultOk {
	AbstractSource: string;
	Definition: string;
	meta: DuckDuckGoResultOkMeta;
	Answer: string;
	RelatedTopics: DuckDuckGoResultOkRelatedTopic[];
	ImageWidth: number;
	Image: string;
	DefinitionURL: string;
	Type: string;
	Heading: string;
	AnswerType: string;
	Infobox: string;
	Abstract: string;
	Entity: string;
	DefinitionSource: string;
	Redirect: string;
	AbstractURL: string;
	ImageIsLogo: number;
	AbstractText: string;
	ImageHeight: number;
	Results: unknown[];
}

export interface DuckDuckGoResultOkRelatedTopic {
	Text?: string;
	FirstURL?: string;
	Result?: string;
	Icon?: DuckDuckGoResultOkRelatedTopicIcon;
	Name?: string;
	Topics?: DuckDuckGoResultOkTopic[];
}

export interface DuckDuckGoResultOkRelatedTopicIcon {
	Height: string;
	Width: string;
	URL: string;
}

export interface DuckDuckGoResultOkTopic {
	Result: string;
	FirstURL: string;
	Icon: DuckDuckGoResultOkTopicIcon;
	Text: string;
}

export interface DuckDuckGoResultOkTopicIcon {
	Height: DuckDuckGoResultOkHeight;
	URL: string;
	Width: DuckDuckGoResultOkHeight;
}

export type DuckDuckGoResultOkHeight = number | string;

export interface DuckDuckGoResultOkMeta {
	src_id: number;
	dev_milestone: string;
	blockgroup: null;
	is_stackexchange: null;
	designer: null;
	name: string;
	developer: DuckDuckGoResultOkDeveloper[];
	dev_date: null;
	tab: string;
	perl_module: string;
	src_name: string;
	src_url: null;
	unsafe: number;
	attribution: null;
	maintainer: DuckDuckGoResultOkMaintainer;
	js_callback_name: string;
	live_date: null;
	producer: null;
	example_query: string;
	status: string;
	id: string;
	description: string;
	repo: string;
	src_options: DuckDuckGoResultOkSrcOptions;
	signal_from: string;
	created_date: null;
	src_domain: string;
	topic: string[];
	production_state: string;
}

export interface DuckDuckGoResultOkDeveloper {
	url: string;
	name: string;
	type: string;
}

export interface DuckDuckGoResultOkMaintainer {
	github: string;
}

export interface DuckDuckGoResultOkSrcOptions {
	language: string;
	is_fanon: number;
	skip_abstract_paren: number;
	skip_icon: number;
	src_info: string;
	is_wikipedia: number;
	min_abstract_length: string;
	is_mediawiki: number;
	skip_image_name: number;
	source_skip: string;
	skip_end: string;
	skip_qr: string;
	directory: string;
	skip_abstract: number;
}
