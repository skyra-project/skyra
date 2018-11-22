// @ts-nocheck
import { Client, MessageEmbed } from 'discord.js';
import { ExtendableStore } from 'klasa';

export default class extends Extendable {

	public constructor(client: Client, store: ExtendableStore, file: string[], directory: string) {
		super(client, store, file, directory, { appliesTo: [MessageEmbed] });
	}

	public splitFields(content: string | string[]): this {
		if (typeof content === 'undefined') return this;

		if (Array.isArray(content)) content = content.join('\n');
		if (content.length < 2048 && !this.description) {
			this.description = content;
			return this;
		}

		let x;
		while (content.length) {
			if (content.length < 1024) {
				this.fields.push({ name: '\u200B', value: content, inline: false });
				return this;
			}

			x = content.slice(0, 1024).lastIndexOf('\n');
			if (x === -1) x = 1024;

			this.fields.push({ name: '\u200B', value: content.slice(0, x), inline: false });
			content = content.slice(x + 1);
		}
		return this;
	}

}

declare module 'discord.js' {
	export interface MessageEmbed {
		splitFields(content: string | string[]): this;
	}
}
