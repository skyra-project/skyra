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
	description: LanguageKeys.Commands.Fun.WhereDescription,
	detailedDescription: LanguageKeys.Commands.Fun.WhereExtended,
	requiredClientPermissions: [PermissionFlagsBits.AttachFiles]
})
export class UserCommand extends SkyraCommand {
	private kTemplate: Image = null!;

	public async messageRun(message: Message, args: SkyraCommand.Args) {
		const user = await args.pick('userName');
		const attachment = await this.generate(user, message.author);
		const content = args.t(LanguageKeys.Commands.Fun.WhereMessage, { user: user.username });
		return send(message, { content, files: [{ attachment, name: 'where.png' }], allowedMentions: { users: [], roles: [] } });
	}

	public async onLoad() {
		this.kTemplate = await resolveImage(join(assetsFolder, '/images/memes/where.png'));
	}

	private async generate(target: User, author: User) {
		if (target === author) author = this.container.client.user!;

		/* Get the buffers from both profile avatars */
		const [pieck, eren] = await Promise.all([fetchAvatar(author, 128), fetchAvatar(target, 32)]);

		return (
			new Canvas(300, 596)
				.printImage(this.kTemplate, 0, 0, 300, 596)

				// Draw Pieck
				.save()
				.translate(120, 87)
				.scale(-1, 1)
				.rotate(radians(-12.9))
				.printCircularImage(pieck, 0, 0, 50)
				.restore()

				// Draw Eren
				.save()
				.translate(162, 364)
				.scale(-1, 1)
				.rotate(radians(14.62))
				.printCircularImage(eren, 0, 0, 16)
				.restore()

				// Draw the buffer
				.png()
		);
	}
}
