import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { assetsFolder } from '#utils/constants';
import { fetchAvatar, radians, resolveImageFromFS } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { Canvas, Image } from 'canvas-constructor/napi-rs';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import type { Message, User } from 'discord.js';
import { join } from 'node:path';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Fun.ShindeiruDescription,
	detailedDescription: LanguageKeys.Commands.Fun.ShindeiruExtended,
	requiredClientPermissions: [PermissionFlagsBits.AttachFiles]
})
export class UserCommand extends SkyraCommand {
	private kTemplate: Image = null!;

	public async messageRun(message: Message, args: SkyraCommand.Args) {
		const user = await args.pick('userName');
		const attachment = await this.generate(user, message.author);
		return send(message, { files: [{ attachment, name: 'Shindeiru.png' }] });
	}

	public async onLoad() {
		this.kTemplate = await resolveImageFromFS(join(assetsFolder, '/images/memes/Shindeiru.png'));
	}

	private async generate(target: User, author: User) {
		if (target === author) author = this.container.client.user!;

		/* Get the buffers from both profile avatars */
		const [theAliveOne, theDeadOne] = await Promise.all([fetchAvatar(author, 128), fetchAvatar(target, 256)]);

		return (
			new Canvas(500, 668)
				.printImage(this.kTemplate, 0, 0, 500, 668)
				// Draw the dead guy about to attack
				.save()
				.translate(162, 77)
				.rotate(radians(8.58))
				.printCircularImage(theDeadOne, 0, 0, 56.5)
				.restore()

				// Draw Kenshiro
				.save()
				.translate(384, 218)
				.rotate(radians(11.13))
				.printCircularImage(theAliveOne, 0, 0, 64)
				.restore()

				// Draw the dead guy saying nani
				.translate(260, 514)
				.rotate(radians(8.24))
				.printCircularImage(theDeadOne, 0, 0, 128)

				// Draw the buffer
				.pngAsync()
		);
	}
}
