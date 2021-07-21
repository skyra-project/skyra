import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { assetsFolder } from '#utils/constants';
import { canReact } from '#utils/functions';
import { fetchAvatar } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Image, loadImage } from 'canvas';
import { Canvas } from 'canvas-constructor';
import type { Message, User } from 'discord.js';
import { join } from 'path';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['pray'],
	bucket: 2,
	cooldown: 30,
	description: LanguageKeys.Commands.Misc.FDescription,
	extendedHelp: LanguageKeys.Commands.Misc.FExtended,
	permissions: ['ATTACH_FILES'],
	spam: true
})
export class UserCommand extends SkyraCommand {
	private kTemplate: Image = null!;

	public async run(message: Message, args: SkyraCommand.Args) {
		const user = await args.pick('userName').catch(() => message.author);
		const attachment = await this.generate(user);
		const response = await message.send({ files: [{ attachment, name: 'F.png' }] });
		if (canReact(response)) await response.react('🇫');
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
				.resetTransformation()
				.printImage(this.kTemplate, 0, 0, 960, 540)

				// Draw the buffer
				.toBufferAsync()
		);
	}

	public async onLoad() {
		this.kTemplate = await loadImage(join(assetsFolder, './images/memes/f.png'));
	}
}
