import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { assetsFolder } from '#utils/constants';
import { fetchAvatar, sanitizeInput } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { Canvas, Image, resolveImage } from 'canvas-constructor/skia';
import { PermissionFlagsBits } from 'discord-api-types/payloads/v9';
import type { Message, User } from 'discord.js';
import { join } from 'path';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['cmm'],
	description: LanguageKeys.Commands.Fun.ChangeMyMindDescription,
	extendedHelp: LanguageKeys.Commands.Fun.ChangeMyMindExtended,
	requiredClientPermissions: [PermissionFlagsBits.AttachFiles],
	spam: true
})
export class UserCommand extends SkyraCommand {
	private kTemplate: Image = null!;

	public async run(message: Message, args: SkyraCommand.Args) {
		const text = sanitizeInput(await args.rest('string', { maximum: 50 }));
		const attachment = await this.generate(message.author, text);
		return send(message, { files: [{ attachment, name: 'ChangeMyMind.png' }] });
	}

	public async onLoad() {
		this.kTemplate = await resolveImage(join(assetsFolder, '/images/memes/ChangeMyMind.png'));
	}

	private async generate(author: User, text: string) {
		const guy = await fetchAvatar(author, 128);

		return (
			new Canvas(591, 607)
				.printImage(this.kTemplate, 0, 0, 591, 607)

				// Add user's avatar
				.printCircularImage(guy, 155, 73, 41)

				// Add text
				.setTextAlign('center')
				.setColor('rgb(23,23,23)')
				.setTextFont('42px RobotoRegular')
				.createRectangleClip(144, 345, 336, 133)
				.printWrappedText(text, 311, 375, 340)

				// Render
				.png()
		);
	}
}
