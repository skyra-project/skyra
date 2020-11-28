import { ZeroWidthSpace } from '@utils/constants';
import { MessageEmbed } from 'discord.js';

export class Embed extends MessageEmbed {
	public splitFields(contentOrTitle: string | string[], rawContent?: string | string[]) {
		if (typeof contentOrTitle === 'undefined') return this;

		let title: string | undefined = undefined;
		let content: string | string[] | undefined = undefined;
		if (typeof rawContent === 'undefined') {
			title = ZeroWidthSpace;
			content = contentOrTitle;
		} else {
			title = contentOrTitle as string;
			content = rawContent;
		}

		if (Array.isArray(content)) content = content.join('\n');
		if (title === ZeroWidthSpace && !this.description && content.length < 2048) {
			this.description = content;
			return this;
		}

		let x: number | undefined = undefined;
		let slice: string | undefined = undefined;
		while (content.length) {
			if (content.length < 1024) {
				this.fields.push({ name: title, value: content, inline: false });
				return this;
			}

			slice = content.slice(0, 1024);
			x = slice.lastIndexOf('\n');
			if (x === -1) x = slice.lastIndexOf(' ');
			if (x === -1) x = 1024;

			this.fields.push({ name: title, value: content.trim().slice(0, x), inline: false });
			content = content.slice(x + 1);
			title = ZeroWidthSpace;
		}

		return this;
	}
}
