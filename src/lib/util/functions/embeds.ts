import { ZeroWidthSpace } from '#utils/constants';
import type { EmbedBuilder } from '@discordjs/builders';
import { isNullishOrEmpty } from '@sapphire/utilities';

export function addAutomaticFields(builder: EmbedBuilder, contentOrTitle: string | string[], rawContent?: string | string[]): EmbedBuilder {
	if (isNullishOrEmpty(contentOrTitle)) return builder;

	let title: string;
	let content: string | string[];
	if (typeof rawContent === 'undefined') {
		title = ZeroWidthSpace;
		content = contentOrTitle;
	} else {
		title = contentOrTitle as string;
		content = rawContent;
	}

	if (Array.isArray(content)) content = content.join('\n');
	if (title === ZeroWidthSpace && !builder.data.description && content.length < 4096) {
		builder.data.description = content;
		return builder;
	}

	let x: number;
	let slice: string;
	builder.data.fields ??= [];
	while (content.length) {
		if (content.length < 1024) {
			builder.data.fields.push({ name: title, value: content, inline: false });
			return builder;
		}

		slice = content.slice(0, 1024);
		x = slice.lastIndexOf('\n');
		if (x === -1) x = slice.lastIndexOf(' ');
		if (x === -1) x = 1024;

		builder.data.fields.push({ name: title, value: content.trim().slice(0, x), inline: false });
		content = content.slice(x + 1);
		title = ZeroWidthSpace;
	}

	return builder;
}
