import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { fetch, FetchResultTypes } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['kitten', 'cat'],
	cooldown: 10,
	description: LanguageKeys.Commands.Animal.KittyDescription,
	extendedHelp: LanguageKeys.Commands.Animal.KittyExtended,
	permissions: ['ATTACH_FILES', 'EMBED_LINKS'],
	spam: true
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message) {
		const embed = new MessageEmbed().setColor(await this.context.db.fetchColor(message)).setTimestamp();

		try {
			const randomImageBuffer = await fetch('https://cataas.com/cat', FetchResultTypes.Buffer);
			embed.attachFiles([{ attachment: randomImageBuffer, name: 'randomcat.jpg' }]).setImage('attachment://randomcat.jpg');
		} catch {
			embed.setImage('https://wallpapercave.com/wp/wp3021105.jpg');
		}
		return message.send(embed);
	}
}
