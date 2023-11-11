import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { getColor, getDisplayAvatar, getEmbedAuthor } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits, type ImageSize, type Message } from 'discord.js';

const VALID_SIZES = [16, 32, 64, 128, 256, 512, 1024, 2048, 4096] as const satisfies readonly ImageSize[];

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['a', 'av', 'ava'],
	description: LanguageKeys.Commands.Tools.AvatarDescription,
	detailedDescription: LanguageKeys.Commands.Tools.AvatarExtended,
	options: ['size'],
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks]
})
export class UserCommand extends SkyraCommand {
	public override async messageRun(message: Message, args: SkyraCommand.Args) {
		const user = args.finished ? message.author : await args.pick('userName');
		if (!user.avatar) this.error(LanguageKeys.Commands.Tools.AvatarNone);

		const sizeFlag = args.getOption('size');
		const size = sizeFlag ? this.resolveSize(sizeFlag) : 2048;

		const embed = new EmbedBuilder() //
			.setAuthor(getEmbedAuthor(user))
			.setColor(getColor(message))
			.setImage(getDisplayAvatar(user, { size }));
		return send(message, { embeds: [embed] });
	}

	private resolveSize(parameter: string): ImageSize {
		const size = Number(parameter) as ImageSize;
		if (Number.isNaN(size) || !VALID_SIZES.includes(size)) return 2048;
		return size;
	}
}
