import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { assetsFolder } from '#utils/constants';
import { fetchAvatar } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { canReact } from '@sapphire/discord.js-utilities';
import { send } from '@sapphire/plugin-editable-commands';
import { Canvas, Image, loadImage } from 'canvas-constructor/napi-rs';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import type { Message, User } from 'discord.js';
import { join } from 'node:path';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['pray'],
	description: LanguageKeys.Commands.Misc.FDescription,
	detailedDescription: LanguageKeys.Commands.Misc.FExtended,
	requiredClientPermissions: [PermissionFlagsBits.AttachFiles]
})
export class UserCommand extends SkyraCommand {
	private kTemplate: Image = null!;

	public async messageRun(message: Message, args: SkyraCommand.Args) {
		const user = await args.pick('userName').catch(() => message.author);
		const attachment = await this.generate(user);
		const response = await send(message, { files: [{ attachment, name: 'F.png' }] });
		if (canReact(response.channel)) await response.react('🇫');
		return response;
	}

	public async generate(user: User) {
		const praised = await fetchAvatar(user, 256);

		return (
			new Canvas(960, 540)
				// Draw the avatar
				.setTransform(1, -0.1, 0.1, 1, 342, 88)
				.printImage(praised, 0, 0, 109, 109)

				// Draw the template
				.resetTransform()
				.printImage(this.kTemplate, 0, 0, 960, 540)

				// Draw the buffer
				.pngAsync()
		);
	}

	public async onLoad() {
		this.kTemplate = await loadImage(join(assetsFolder, './images/memes/f.png'));
	}
}
