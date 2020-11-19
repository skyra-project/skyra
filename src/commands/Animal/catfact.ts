import { DbSet } from '@lib/database';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { assetsFolder } from '@utils/constants';
import { MessageEmbed } from 'discord.js';
import { readFile } from 'fs/promises';
import { CommandStore, KlasaMessage } from 'klasa';
import { join } from 'path';

export default class extends SkyraCommand {
	private facts: readonly string[] = [];
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['kittenfact'],
			cooldown: 10,
			description: (language) => language.get(LanguageKeys.Commands.Animal.CatfactDescription),
			extendedHelp: (language) => language.get(LanguageKeys.Commands.Animal.CatfactExtended),
			requiredPermissions: ['EMBED_LINKS'],
			spam: true
		});
	}

	public async run(message: KlasaMessage) {
		const fact = this.facts[Math.floor(Math.random() * this.facts.length)];
		return message.sendEmbed(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setTitle(await message.fetchLocale(LanguageKeys.Commands.Animal.CatfactTitle))
				.setDescription(fact)
		);
	}

	public async init() {
		const text = await readFile(join(assetsFolder, 'data', 'catfacts.json'), 'utf-8');
		this.facts = JSON.parse(text);
	}
}
