import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { assetsFolder } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, MessageEmbed } from 'discord.js';
import { readFile } from 'fs/promises';
import { join } from 'path';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['kittenfact'],
	cooldown: 10,
	description: LanguageKeys.Commands.Animal.CatfactDescription,
	extendedHelp: LanguageKeys.Commands.Animal.CatfactExtended,
	permissions: ['EMBED_LINKS'],
	spam: true
})
export class UserCommand extends SkyraCommand {
	private facts: readonly string[] = [];

	public async run(message: Message, args: SkyraCommand.Args) {
		const fact = this.facts[Math.floor(Math.random() * this.facts.length)];
		return message.send(
			new MessageEmbed()
				.setColor(await this.context.db.fetchColor(message))
				.setTitle(args.t(LanguageKeys.Commands.Animal.CatfactTitle))
				.setDescription(fact)
		);
	}

	public async onLoad() {
		const text = await readFile(join(assetsFolder, 'data', 'catfacts.json'), 'utf-8');
		this.facts = JSON.parse(text);
	}
}
