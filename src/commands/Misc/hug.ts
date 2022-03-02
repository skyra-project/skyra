import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { assetsFolder } from '#utils/constants';
import { fetchAvatar, radians } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { Canvas, Image, resolveImage } from 'canvas-constructor/skia';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import type { Message, User } from 'discord.js';
import { join } from 'node:path';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Misc.HugDescription,
	detailedDescription: LanguageKeys.Commands.Misc.HugExtended,
	requiredClientPermissions: [PermissionFlagsBits.AttachFiles]
})
export class UserCommand extends SkyraCommand {
	private kTemplate: Image = null!;

	public async messageRun(message: Message, args: SkyraCommand.Args) {
		const user = await args.pick('userName');
		const attachment = await this.generate(message, user);
		return send(message, { files: [{ attachment, name: 'hug.png' }] });
	}

	public async generate(message: Message, user: User) {
		if (user.id === message.author.id) user = this.container.client.user!;

		const [hugged, hugger] = await Promise.all([fetchAvatar(user, 256), fetchAvatar(message.author, 256)]);

		return (
			new Canvas(660, 403)
				.printImage(this.kTemplate, 0, 0, 660, 403)

				// Draw the woman
				.save()
				.setTransform(-1, 0, 0, 1, 178, 144)
				.rotate(radians(30))
				.printCircularImage(hugger, 0, 0, 54)
				.restore()

				// Draw the man
				.translate(292, 96)
				.rotate(radians(28.42))
				.printCircularImage(hugged, 0, 0, 49)

				// Draw the buffer
				.png()
		);
	}

	public async onLoad() {
		this.kTemplate = await resolveImage(join(assetsFolder, './images/memes/hug.png'));
	}
}
