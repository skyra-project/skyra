import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { assetsFolder } from '#utils/constants';
import { fetchAvatar, radians } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Image, loadImage } from 'canvas';
import { Canvas } from 'canvas-constructor';
import type { Message, User } from 'discord.js';
import { join } from 'path';

@ApplyOptions<SkyraCommand.Options>({
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Fun.WhereDescription,
	extendedHelp: LanguageKeys.Commands.Fun.WhereExtended,
	permissions: ['ATTACH_FILES'],
	spam: true
})
export class UserCommand extends SkyraCommand {
	private kTemplate: Image = null!;

	public async run(message: Message, args: SkyraCommand.Args) {
		const user = await args.pick('userName');
		const attachment = await this.generate(user, message.author);
		return message.send(args.t(LanguageKeys.Commands.Fun.WhereMessage, { user: user.username }), {
			files: [{ attachment, name: 'where.png' }],
			allowedMentions: { users: [], roles: [] }
		});
	}

	public async onLoad() {
		this.kTemplate = await loadImage(join(assetsFolder, '/images/memes/where.png'));
	}

	private async generate(target: User, author: User) {
		if (target === author) author = this.context.client.user!;

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
				.toBufferAsync()
		);
	}
}
