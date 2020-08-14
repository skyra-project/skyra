import { join } from 'path';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { ApplyOptions } from '@skyra/decorators';
import { KlasaUser, KlasaMessage } from 'klasa';
import { fetchAvatar } from '@utils/util';
import { loadImage, Image } from 'canvas';
import { Canvas } from 'canvas-constructor';
import { assetsFolder } from '@utils/constants';

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 15,
	description: (language) => language.tget('COMMAND_WAKANDA_DESCRIPTION'),
	extendedHelp: (language) => language.tget('COMMAND_WAKANDA_EXTENDED'),
	usage: '[user:username]'
})
export default class extends SkyraCommand {
	private kTemplate: Image = null!;

	public async run(message: KlasaMessage, [user = message.author]: [KlasaUser]) {
		const userAvatar = await fetchAvatar(user);
		const image = this.generateImage(userAvatar);

		return message.channel.sendFile(image.toBuffer(), "we-don't-do-that-here.png");
	}

	public async init() {
		this.kTemplate = await loadImage(join(assetsFolder, './images/memes/we-dont-do-that-here.png'));
	}

	private generateImage(avatar: Image) {
		return new Canvas(800, 450).printImage(this.kTemplate, 0, 0).printCircularImage(avatar, 316, 125, 65);
	}
}
