import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import { ImageSize, Message, MessageEmbed } from 'discord.js';

const VALID_SIZES = [32, 64, 128, 256, 512, 1024, 2048];

@ApplyOptions<SkyraCommand.Options>({
	strategyOptions: { options: ['size'] },
	aliases: ['a', 'av', 'ava'],
	cooldown: 15,
	description: LanguageKeys.Commands.Tools.AvatarDescription,
	extendedHelp: LanguageKeys.Commands.Tools.AvatarExtended,
	permissions: ['EMBED_LINKS']
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const user = args.finished ? message.author : await args.pick('userName');
		if (!user.avatar) this.error(LanguageKeys.Commands.Tools.AvatarNone);

		const sizeFlag = args.getOption('size');
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
