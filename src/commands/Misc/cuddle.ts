import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { assetsFolder } from '#utils/constants';
import { fetchAvatar, radians } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Canvas, Image, resolveImage } from 'canvas-constructor/skia';
import type { Message, User } from 'discord.js';
import { join } from 'path';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Misc.CuddleDescription,
	extendedHelp: LanguageKeys.Commands.Misc.CuddleExtended,
	requiredClientPermissions: ['ATTACH_FILES'],
	spam: true
})
export class UserCommand extends SkyraCommand {
	private kTemplate: Image = null!;

	public async run(message: Message, args: SkyraCommand.Args) {
		const user = await args.pick('userName');
		const attachment = await this.generate(message, user);
		return message.channel.send({ files: [{ attachment, name: 'cuddle.png' }] });
	}

	public async generate(message: Message, user: User) {
		if (user.id === message.author.id) user = this.container.client.user!;

		/* Get the buffers from both profile avatars */
		const [man, woman] = await Promise.all([fetchAvatar(message.author, 256), fetchAvatar(user, 256)]);

		return (
			new Canvas(636, 366)
				.printImage(this.kTemplate, 0, 0, 636, 366)

				// Draw the guy
				.save()
				.translate(248, 70)
				.rotate(radians(47.69))
				.printCircularImage(man, 0, 0, 70)
				.restore()

				// Draw the woman
				.translate(384, 120)
				.rotate(radians(35.28))
				.printCircularImage(woman, 0, 0, 69)

				// Draw the buffer
				.png()
		);
	}

	public async onLoad() {
		this.kTemplate = await resolveImage(join(assetsFolder, './images/memes/cuddle.png'));
	}
}
