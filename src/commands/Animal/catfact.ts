import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { fetch, FetchResultTypes } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
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
		const { fact } = await fetch<CatfactResultOk>('https://catfact.ninja/fact', FetchResultTypes.JSON);
		return message.sendEmbed(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setTitle(message.language.get(LanguageKeys.Commands.Animal.CatfactTitle))
				.setDescription(fact)
		);
	}
}

export interface CatfactResultOk {
	fact: string;
	length: number;
}
