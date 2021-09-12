import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { assetsFolder } from '#utils/constants';
import { fetchAvatar, radians } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { Canvas, Image, resolveImage } from 'canvas-constructor/skia';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import type { Message } from 'discord.js';
import { join } from 'path';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Fun.WakandaDescription,
	detailedDescription: LanguageKeys.Commands.Fun.WakandaExtended,
	requiredClientPermissions: [PermissionFlagsBits.AttachFiles]
})
export class UserCommand extends SkyraCommand {
	private kTemplate: Image = null!;

	public async run(message: Message, args: SkyraCommand.Args) {
		const user = await args.pick('userName').catch(() => message.author);
		const userAvatar = await fetchAvatar(user);
		const attachment = await this.generateImage(userAvatar);

		return send(message, { files: [{ attachment, name: 'we-do-not-do-that-here.png' }] });
	}

	public async onLoad() {
		this.kTemplate = await resolveImage(join(assetsFolder, './images/memes/we-do-not-do-that-here.png'));
	}

	private generateImage(avatar: Image) {
		return new Canvas(800, 450)
			.printImage(this.kTemplate, 0, 0)
			.save()
			.translate(316, 115)
			.rotate(radians(10))
			.printCircularImage(avatar, 0, 0, 65)
			.png();
	}
}
