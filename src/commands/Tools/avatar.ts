import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { getColor, getDisplayAvatar, getEmbedAuthor } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import { AllowedImageSize, Message, MessageEmbed } from 'discord.js';

const VALID_SIZES = [16, 32, 64, 128, 256, 512, 1024, 2048, 4096];

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['a', 'av', 'ava'],
	description: LanguageKeys.Commands.Tools.AvatarDescription,
	detailedDescription: LanguageKeys.Commands.Tools.AvatarExtended,
	options: ['size'],
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks]
})
export class UserCommand extends SkyraCommand {
	public async messageRun(message: Message, args: SkyraCommand.Args) {
		const user = args.finished ? message.author : await args.pick('userName');
		if (!user.avatar) this.error(LanguageKeys.Commands.Tools.AvatarNone);

		const sizeFlag = args.getOption('size');
		const size = sizeFlag ? this.resolveSize(sizeFlag) : 2048;

		const embed = new MessageEmbed() //
			.setAuthor(getEmbedAuthor(user))
			.setColor(getColor(message))
			.setImage(getDisplayAvatar(user, { size }));
		return send(message, { embeds: [embed] });
	}

	private resolveSize(size: string): AllowedImageSize {
		const sizeNum = Number(size);
		if (Number.isNaN(sizeNum) || !VALID_SIZES.includes(sizeNum)) return 2048;
		return sizeNum as AllowedImageSize;
	}
}
