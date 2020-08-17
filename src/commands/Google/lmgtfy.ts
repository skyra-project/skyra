import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['letmegooglethatforyou'],
			cooldown: 10,
			description: (language) => language.get('COMMAND_LMGTFY_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_LMGTFY_EXTENDED'),
			usage: '<query:string>',
			requiredPermissions: ['EMBED_LINKS'],
			flagSupport: true
		});
	}

	public async run(message: KlasaMessage, [query]: [string]) {
		const searchEngine = this.parseSearchEngine(message.flagArgs);
		return message.sendEmbed(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setDescription(
					`[${message.language.get('COMMAND_LMGTFY_CLICK')}](https://lmgtfy.com?q=${encodeURIComponent(query)}&s=${searchEngine})`
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
