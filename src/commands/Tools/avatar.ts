import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { ApplyOptions } from '@skyra/decorators';
import { ImageSize, MessageEmbed } from 'discord.js';
import { KlasaMessage, KlasaUser } from 'klasa';

const VALID_SIZES = [32, 64, 128, 256, 512, 1024, 2048];

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['a', 'av', 'ava'],
	cooldown: 15,
	description: (language) => language.tget('COMMAND_AVATAR_DESCRIPTION'),
	extendedHelp: (language) => language.tget('COMMAND_AVATAR_EXTENDED'),
	requiredPermissions: ['EMBED_LINKS'],
	runIn: ['text'],
	usage: '[user:username]',
	flagSupport: true
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [user = message.author]: [KlasaUser]) {
		if (!user.avatar) throw message.language.tget('COMMAND_AVATAR_NONE');

		const sizeFlag = Reflect.get(message.flagArgs, 'size');
		const size = sizeFlag ? this.resolveSize(sizeFlag) : 2048;

		return message.sendEmbed(
			new MessageEmbed()
				.setAuthor(user.tag, user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
				.setColor(await DbSet.fetchColor(message))
				.setImage(user.displayAvatarURL({ size, format: 'png', dynamic: true }))
		);
	}

	private resolveSize(size: string): ImageSize {
		const sizeNum = Number(size);
		if (Number.isNaN(sizeNum) || !VALID_SIZES.includes(sizeNum)) return 2048;
		return sizeNum as ImageSize;
	}
}
