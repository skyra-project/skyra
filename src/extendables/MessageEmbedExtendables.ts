import { MessageEmbed } from 'discord.js';
import { Extendable, ExtendableStore, KlasaClient } from 'klasa';

export default class extends Extendable {

	public constructor(client: KlasaClient, store: ExtendableStore, file: string[], directory: string) {
		super(client, store, file, directory, { appliesTo: [MessageEmbed] });
	}

	public splitFields(content: string | string[]) {
		const self = this as unknown as MessageEmbed;
		if (typeof content === 'undefined') return self;

		if (Array.isArray(content)) content = content.join('\n');
		if (content.length < 2048 && !self.description) {
			self.description = content;
			return self;
		}

		let x;
		while (content.length) {
			if (content.length < 1024) {
				self.fields.push({ name: '\u200B', value: content, inline: false });
				return self;
			}

			x = content.slice(0, 1024).lastIndexOf('\n');
			if (x === -1) x = 1024;

			self.fields.push({ name: '\u200B', value: content.slice(0, x), inline: false });
			content = content.slice(x + 1);
		}
		return self;
	}

}
