import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { assetsFolder } from '#utils/constants';
import { fetchAvatar, radians } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { Canvas, Image, resolveImage } from 'canvas-constructor/skia';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import type { Message, User } from 'discord.js';
import { join } from 'path';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['heal', 'healing'],
	description: LanguageKeys.Commands.Misc.INeedHealingDescription,
	detailedDescription: LanguageKeys.Commands.Misc.INeedHealingExtended,
	requiredClientPermissions: [PermissionFlagsBits.AttachFiles],
	spam: true
})
export class UserCommand extends SkyraCommand {
	private kTemplate: Image = null!;

	public async messageRun(message: Message, args: SkyraCommand.Args) {
		const user = await args.pick('userName');
		const attachment = await this.generate(message, user);
		return send(message, { files: [{ attachment, name: 'INeedHealing.png' }] });
	}

	public async generate(message: Message, user: User) {
		if (user.id === message.author.id) user = this.container.client.user!;

		const [healer, healed] = await Promise.all([fetchAvatar(message.author, 128), fetchAvatar(user, 128)]);

		return (
			new Canvas(333, 500)
				.printImage(this.kTemplate, 0, 0, 333, 500)

				// Draw the healer
				.save()
				.translate(244, 287)
				.rotate(radians(30.42))
				.printCircularImage(healed, 0, 0, 55)
				.restore()

				// Draw the healed boy
				.translate(123, 149)
				.rotate(radians(-31.4))
				.printCircularImage(healer, 0, 0, 53)

				// Draw the buffer
				.png()
		);
	}

	public async onLoad() {
		this.kTemplate = await resolveImage(join(assetsFolder, './images/memes/ineedhealing.png'));
	}
}
