import { DbSet } from '#lib/database';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { fetch, FetchResultTypes } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['kitten', 'cat'],
	cooldown: 10,
	description: LanguageKeys.Commands.Animal.KittyDescription,
	extendedHelp: LanguageKeys.Commands.Animal.KittyExtended,
	requiredPermissions: ['ATTACH_FILES', 'EMBED_LINKS'],
	spam: true
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage) {
		const embed = new MessageEmbed().setColor(await DbSet.fetchColor(message)).setTimestamp();

		try {
			const randomImageBuffer = await fetch('https://cataas.com/cat', FetchResultTypes.Buffer);
			embed.attachFiles([{ attachment: randomImageBuffer, name: 'randomcat.jpg' }]).setImage('attachment://randomcat.jpg');
		} catch {
			embed.setImage('https://wallpapercave.com/wp/wp3021105.jpg');
		}
		return message.send(embed);
	}
}
