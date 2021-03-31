import { MessageEmbed, MessageEmbedOptions, MessageOptions } from 'discord.js';

type EmbedResolvable = MessageOptions['embed'];

export function applyTemplate(template: MessageOptions, options: MessageOptions): MessageOptions {
	return { ...template, ...options, embed: applyTemplateEmbed(template.embed, options.embed) };
}

function applyTemplateEmbed(template: EmbedResolvable, embed: EmbedResolvable): MessageEmbed | MessageEmbedOptions | undefined {
	if (!embed) return template;
	if (!template) return embed;
	return mergeEmbeds(template, embed);
}

function mergeEmbeds(template: MessageEmbed | MessageEmbedOptions, embed: MessageEmbed | MessageEmbedOptions): MessageEmbedOptions {
	return {
		title: embed.title ?? template.title ?? undefined,
		description: embed.description ?? template.description ?? undefined,
		url: embed.url ?? template.url ?? undefined,
		timestamp: embed.timestamp ?? template.timestamp ?? undefined,
		color: embed.color ?? template.color ?? undefined,
		fields: mergeArrays(template.fields, embed.fields),
		files: mergeArrays(template.files, embed.files),
		author: embed.author ?? template.author ?? undefined,
		thumbnail: embed.thumbnail ?? template.thumbnail ?? undefined,
		image: embed.image ?? template.image ?? undefined,
		video: embed.video ?? template.video ?? undefined,
		footer: embed.footer ?? template.footer ?? undefined
	};
}

function mergeArrays<T>(template?: T[], array?: T[]): undefined | T[] {
	if (!array) return template;
	if (!template) return array;
	return [...template, ...array];
}
