import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import { ApplyOptions } from '@sapphire/decorators';
import { ImageSize, Message, MessageEmbed, User } from 'discord.js';

const VALID_SIZES = [32, 64, 128, 256, 512, 1024, 2048];

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['a', 'av', 'ava'],
	cooldown: 15,
	description: LanguageKeys.Commands.Tools.AvatarDescription,
	extendedHelp: LanguageKeys.Commands.Tools.AvatarExtended,
	requiredPermissions: ['EMBED_LINKS'],
	usage: '[user:username]',
	flagSupport: true
})
export default class extends SkyraCommand {
	public async run(message: Message, [user = message.author]: [User]) {
		if (!user.avatar) throw await message.resolveKey(LanguageKeys.Commands.Tools.AvatarNone);

		const sizeFlag = Reflect.get(message.flagArgs, 'size');
		const size = sizeFlag ? this.resolveSize(sizeFlag) : 2048;

		return message.send(
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
