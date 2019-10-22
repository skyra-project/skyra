import { MessageEmbed } from 'discord.js';
import { Extendable, ExtendableStore } from 'klasa';

export default class extends Extendable {

	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [MessageEmbed] });
	}

	public splitFields(this: MessageEmbed, content: string | string[]) {
		if (typeof content === 'undefined') return this;

		if (Array.isArray(content)) content = content.join('\n');
		if (content.length < 2048 && !this.description) {
			this.description = content;
			return this;
		}

		let x: number;
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
