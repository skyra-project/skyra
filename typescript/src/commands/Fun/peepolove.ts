import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { assetsFolder } from '#utils/constants';
import { getImage, radians } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Canvas, resolveImage } from 'canvas-constructor';
import type { Message } from 'discord.js';
import { join } from 'path';
import type { Image } from 'skia-canvas';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['pepelove'],
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Fun.PeepoLoveDescription,
	extendedHelp: LanguageKeys.Commands.Fun.PeepoLoveExtended,
	permissions: ['ATTACH_FILES'],
	spam: true
})
export class UserCommand extends SkyraCommand {
	private bodyImage: Image = null!;
	private handsImage: Image = null!;

	public async run(message: Message, args: SkyraCommand.Args) {
		const userAttachment = getImage(message);
		const imageBuffer = userAttachment ? await resolveImage(userAttachment) : await args.pick('image');
		const attachment = new Canvas(512, 512)
			.printImage(this.bodyImage, 0, 0, 512, 512)
			.translate(135, 410)
			.rotate(radians(-45))
			.printCircularImage(imageBuffer, 0, 0, 165, { fit: 'cover' })
			.resetTransformation()
			.printImage(this.handsImage, 0, 0, 512, 512)
			.toBuffer();

		return message.channel.send({ files: [{ attachment, name: 'peepoLove.png' }] });
	}

	public async onLoad() {
		[this.bodyImage, this.handsImage] = await Promise.all([
			resolveImage(join(assetsFolder, '/images/generation/peepoBody.png')),
			resolveImage(join(assetsFolder, '/images/generation/peepoHands.png'))
		]);
	}
}
