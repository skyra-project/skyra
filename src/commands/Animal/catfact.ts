import { DbSet } from '#lib/database';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { assetsFolder } from '#utils/constants';
import { ApplyOptions } from '@skyra/decorators';
import { Message, MessageEmbed } from 'discord.js';
import { readFile } from 'fs/promises';
import { join } from 'path';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['kittenfact'],
	cooldown: 10,
	description: LanguageKeys.Commands.Animal.CatfactDescription,
	extendedHelp: LanguageKeys.Commands.Animal.CatfactExtended,
	requiredPermissions: ['EMBED_LINKS'],
	spam: true
})
export default class extends SkyraCommand {
	private facts: readonly string[] = [];

	public async run(message: Message) {
		const fact = this.facts[Math.floor(Math.random() * this.facts.length)];
		return message.send(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setTitle(await message.resolveKey(LanguageKeys.Commands.Animal.CatfactTitle))
				.setDescription(fact)
		);
	}

	public async init() {
		const text = await readFile(join(assetsFolder, 'data', 'catfacts.json'), 'utf-8');
		this.facts = JSON.parse(text);
	}
}
