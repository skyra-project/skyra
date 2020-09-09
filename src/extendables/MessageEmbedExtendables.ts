import { ZeroWidhSpace } from '@utils/constants';
import { MessageEmbed } from 'discord.js';
import { Extendable, ExtendableStore } from 'klasa';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [MessageEmbed] });
	}

	public addBlankField(this: MessageEmbed, inline?: boolean) {
		return this.addField(ZeroWidhSpace, ZeroWidhSpace, inline ?? false);
	}

	public splitFields(this: MessageEmbed, contentOrTitle: string | string[], rawContent?: string | string[]) {
		if (typeof contentOrTitle === 'undefined') return this;

		let title: string | undefined = undefined;
		let content: string | string[] | undefined = undefined;
		if (typeof rawContent === 'undefined') {
			title = ZeroWidhSpace;
			content = contentOrTitle;
		} else {
			title = contentOrTitle as string;
			content = rawContent;
		}

		if (Array.isArray(content)) content = content.join('\n');
		if (title === ZeroWidhSpace && !this.description && content.length < 2048) {
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
			title = ZeroWidhSpace;
		}
		return this;
	}
}
