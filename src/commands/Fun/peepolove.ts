import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { assetsFolder } from '#utils/constants';
import { radians } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Image, loadImage } from 'canvas';
import { Canvas } from 'canvas-constructor';
import type { Message } from 'discord.js';
import { join } from 'path';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['pepelove'],
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Fun.PeepoLoveDescription,
	extendedHelp: LanguageKeys.Commands.Fun.PeepoLoveExtended,
	requiredPermissions: ['ATTACH_FILES'],
	spam: true,
	usage: '<image:image>'
})
export default class extends SkyraCommand {
	private bodyImage: Image = null!;
	private handsImage: Image = null!;

	public async run(message: Message, [imageBuffer]: [Image]) {
		const attachment = await new Canvas(512, 512)
			.printImage(this.bodyImage, 0, 0, 512, 512)
			.translate(135, 410)
			.rotate(radians(-45))
			.printCircularImage(imageBuffer, 0, 0, 165)
			.resetTransformation()
			.printImage(this.handsImage, 0, 0, 512, 512)
			.toBufferAsync();

		return message.channel.send({ files: [{ attachment, name: 'peepoLove.png' }] });
	}

	public async onLoad() {
		[this.bodyImage, this.handsImage] = await Promise.all([
			loadImage(join(assetsFolder, '/images/generation/peepoBody.png')),
			loadImage(join(assetsFolder, '/images/generation/peepoHands.png'))
		]);
	}
}
