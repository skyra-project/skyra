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
	description: LanguageKeys.Commands.Fun.ThinkDescription,
	detailedDescription: LanguageKeys.Commands.Fun.ThinkExtended,
	requiredClientPermissions: [PermissionFlagsBits.AttachFiles],
	spam: true
})
export class UserCommand extends SkyraCommand {
	private kTemplate: Image = null!;

	public async messageRun(message: Message, args: SkyraCommand.Args) {
		const user = await args.pick('userName');
		const attachment = await this.generate(user, message.author);
		const content = args.t(LanguageKeys.Commands.Fun.ThinkMessage, { user: user.username });
		return send(message, { content, files: [{ attachment, name: 'think.png' }], allowedMentions: { users: [], roles: [] } });
	}

	public async onLoad() {
		this.kTemplate = await resolveImage(join(assetsFolder, '/images/memes/think.png'));
	}

	private async generate(target: User, author: User) {
		if (target === author) author = this.container.client.user!;

		/* Get the buffers from both profile avatars */
		const [omniMan, mark] = await Promise.all([fetchAvatar(author, 128), fetchAvatar(target, 256)]);

		return (
			new Canvas(775, 395)
				.printImage(this.kTemplate, 0, 0, 775, 395)

				// Draw the Omni-Man
				.save()
				.translate(311, 135)
				.rotate(radians(7.95))
				.printCircularImage(omniMan, 0, 0, 49)
				.restore()

				// Draw Mark
				.save()
				.translate(583, 152)
				.scale(-1, 1)
				.rotate(radians(-22.86))
				.printCircularImage(mark, 0, 0, 61)
				.restore()

				// Draw the buffer
				.png()
		);
	}
}
