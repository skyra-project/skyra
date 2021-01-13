import { DbSet } from '#lib/database';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { fetch, FetchResultTypes } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 10,
	description: LanguageKeys.Commands.Animal.ShibeDescription,
	extendedHelp: LanguageKeys.Commands.Animal.ShibeExtended,
	requiredPermissions: ['EMBED_LINKS'],
	spam: true
})
export default class extends SkyraCommand {
	public async run(message: Message) {
		const urls = await fetch<[string]>('https://shibe.online/api/shibes?count=1', FetchResultTypes.JSON);
		return message.send(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setImage(urls[0])
				.setTimestamp()
		);
	}
}
