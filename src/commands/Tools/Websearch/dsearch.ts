import { SkyraCommand } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { fetch, FetchResultTypes } from '#utils/util';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['duckduckgo'],
			cooldown: 15,
			description: (language) => language.get(LanguageKeys.Commands.Tools.DuckDuckGoDescription),
			extendedHelp: (language) => language.get(LanguageKeys.Commands.Tools.DuckDuckGoExtended),
			usage: '<query:string>',
			usageDelim: ' ',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	public async run(message: KlasaMessage, [query]: [string]) {
		const body = await fetch<DuckDuckGoResultOk>(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`, FetchResultTypes.JSON);

		if (body.Heading.length === 0) {
			throw await message.fetchLocale(LanguageKeys.Commands.Tools.DuckDuckGoNotfound);
		}

		const embed = new MessageEmbed().setTitle(body.Heading).setURL(body.AbstractURL).setThumbnail(body.Image).setDescription(body.AbstractText);

		if (body.RelatedTopics && body.RelatedTopics.length > 0) {
			embed.addField(await message.fetchLocale(LanguageKeys.Commands.Tools.DuckDuckGoLookalso), body.RelatedTopics[0].Text);
		}

		return message.send(embed);
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
