import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { ApplyOptions } from '@skyra/decorators';
import { fetch, FetchResultTypes } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['kitten', 'cat'],
	cooldown: 10,
	description: (language) => language.get('COMMAND_KITTY_DESCRIPTION'),
	extendedHelp: (language) => language.get('COMMAND_KITTY_EXTENDED'),
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
		return message.sendEmbed(embed);
	}
}
