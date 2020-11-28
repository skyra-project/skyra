import { DbSet } from '#lib/database/index';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['letmegooglethatforyou'],
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Google.LmgtfyDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Google.LmgtfyExtended),
	usage: '<query:string>',
	requiredPermissions: ['EMBED_LINKS'],
	flagSupport: true
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [query]: [string]) {
		const searchEngine = this.parseSearchEngine(message.flagArgs);
		return message.sendEmbed(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setDescription(
					`[${await message.fetchLocale(LanguageKeys.Commands.Google.LmgtfyClick)}](https://lmgtfy.com?q=${encodeURIComponent(
						query
					)}&s=${searchEngine})`
				)
		);
	}

	private parseSearchEngine(flags: KlasaMessage['flagArgs']) {
		for (const key of Object.keys(flags)) {
			switch (key) {
				case 'duckduckgo':
				case 'ddg':
					return 'd';
				case 'lmgtfy':
					return 'l';
				case 'yahoo':
					return 'y';
				case 'bing':
					return 'b';
				case 'starpage':
				case 'sp':
					return 't';
				case 'ask':
					return 'k';
				case 'aol':
					return 'a';
			}
		}

		return '';
	}
}
