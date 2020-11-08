import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { assetsFolder } from '@utils/constants';
import { radians } from '@utils/util';
import { Image, loadImage } from 'canvas';
import { Canvas } from 'canvas-constructor';
import { KlasaMessage } from 'klasa';
import { join } from 'path';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['pepelove'],
	bucket: 2,
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Fun.PeepoloveDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Fun.PeepoloveExtended),
	requiredPermissions: ['ATTACH_FILES'],
	spam: true,
	usage: '<image:image>'
})
export default class extends SkyraCommand {
	private bodyImage: Image = null!;
	private handsImage: Image = null!;

	public async run(message: KlasaMessage, [imageBuffer]: [Image]) {
		const buffer = await new Canvas(512, 512)
			.printImage(this.bodyImage, 0, 0, 512, 512)
			.translate(135, 410)
			.rotate(radians(-45))
			.printCircularImage(imageBuffer, 0, 0, 165)
			.resetTransformation()
			.printImage(this.handsImage, 0, 0, 512, 512)
			.toBufferAsync();

		return message.channel.sendFile(buffer, 'peepoLove.png');
	}

	public async init() {
		[this.bodyImage, this.handsImage] = await Promise.all([
			loadImage(join(assetsFolder, '/images/generation/peepoBody.png')),
			loadImage(join(assetsFolder, '/images/generation/peepoHands.png'))
		]);
	}
}
