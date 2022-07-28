import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types';
import type { EmbedField, Guild, MessageAttachment, MessageEmbed, MessageEmbedFooter, MessageEmbedImage, User } from 'discord.js';
import type { TFunction } from 'i18next';
import { cleanMentions } from './util';

export function formatMessage(t: TFunction, message: GuildMessage): string {
	const header = formatHeader(t, message);
	const content = formatContents(message);
	return `${header}\n${content}`;
}

function formatHeader(t: TFunction, message: GuildMessage): string {
	return `${formatTimestamp(t, message.createdTimestamp)} ${message.system ? 'SYSTEM' : formatAuthor(message.author)}`;
}

/**
 * Formats a timestamp using {@link Intl}
 *
 * This **cannot** make use of Discord's timestamp formatting as the result
 * of this function is placed inside of a codeblock.
 */
function formatTimestamp(t: TFunction, timestamp: number): string {
	return `[${t(LanguageKeys.Globals.DateTimeValue, { value: timestamp })}]`;
}

function formatAuthor(author: User): string {
	return `${author.tag}${author.bot ? ' [BOT]' : ''}`;
}

function formatContents(message: GuildMessage): string {
	const output: string[] = [];
	if (message.content.length > 0) output.push(formatContent(message.guild, message.content));
	if (message.embeds.length > 0) output.push(message.embeds.map((embed) => formatEmbed(message.guild, embed)).join('\n'));
	if (message.attachments.size > 0) output.push(message.attachments.map((attachment) => formatAttachment(attachment)).join('\n'));
	return output.join('\n');
}

function formatContent(guild: Guild, content: string): string {
	return cleanMentions(guild, content)
		.split('\n')
		.map((line) => `> ${line}`)
		.join('\n');
}

export function formatAttachment(attachment: MessageAttachment): string {
	return `📂 [${attachment.name}: ${attachment.url}]`;
}

function formatEmbed(guild: Guild, embed: MessageEmbed): string {
	switch (embed.type) {
		case 'video':
			return formatEmbedVideo(embed);
		case 'image':
			return formatEmbedImage(embed);
		default:
			return formatEmbedRich(guild, embed);
	}
}

function formatEmbedVideo(embed: MessageEmbed): string {
	return `📹 [${embed.url}]${embed.provider ? ` (${embed.provider.name}).` : ''}`;
}

function formatEmbedImage(embed: MessageEmbed): string {
	return `🖼️ [${embed.url}]${embed.provider ? ` (${embed.provider.name}).` : ''}`;
}

function formatEmbedRich(guild: Guild, embed: MessageEmbed): string {
	if (embed.provider === null) {
		const output: string[] = [];
		if (embed.title) output.push(formatEmbedRichTitle(embed.title));
		if (embed.author) output.push(formatEmbedRichAuthor(embed.author));
		if (embed.url) output.push(formatEmbedRichUrl(embed.url));
		if (embed.description) output.push(formatEmbedRichDescription(guild, embed.description));
		if (embed.fields.length > 0) output.push(embed.fields.map((field) => formatEmbedRichField(guild, field)).join('\n'));
		if (embed.image) output.push(formatEmbedRichImage(embed.image));
		if (embed.footer) output.push(formatEmbedRichFooter(embed.footer));
		return output.join('\n');
	}

	return formatEmbedRichProvider(embed);
}

function formatEmbedRichTitle(title: string): string {
	return `># ${title}`;
}

function formatEmbedRichUrl(url: string): string {
	return `> 📎 ${url}`;
}

function formatEmbedRichAuthor(author: Exclude<MessageEmbed['author'], null>): string {
	return `> 👤 ${author.iconURL ? `[${author.iconURL}] ` : ''}${author.name || '-'}${author.url ? ` <${author.url}>` : ''}`;
}

function formatEmbedRichDescription(guild: Guild, description: string): string {
	return cleanMentions(guild, description)
		.split('\n')
		.map((line) => `> > ${line}`)
		.join('\n');
}

function formatEmbedRichField(guild: Guild, field: EmbedField): string {
	return `> #> ${field.name}\n${cleanMentions(guild, field.value)
		.split('\n')
		.map((line) => `>  > ${line}`)
		.join('\n')}`;
}

function formatEmbedRichImage(image: MessageEmbedImage): string {
	return `>🖼️ [${image.url}]`;
}

function formatEmbedRichFooter(footer: MessageEmbedFooter): string {
	return `>_ ${footer.iconURL ? `[${footer.iconURL}]${footer.text ? ' - ' : ''}` : ''}${footer.text ?? ''}`;
}

function formatEmbedRichProvider(embed: MessageEmbed): string {
	return `🔖 [${embed.url}]${embed.provider ? ` (${embed.provider.name}).` : ''}`;
}
