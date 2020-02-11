import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { assetsFolder } from '@utils/constants';
import { Canvas } from 'canvas-constructor';
import { readFile } from 'fs-nextra';
import { CommandStore, KlasaMessage } from 'klasa';
import { join } from 'path';
import { MessageAttachment } from 'discord.js';

export default class extends SkyraCommand {

	private bodyImage: Buffer | null = null;
	private handsImage: Buffer | null = null;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: language => language.tget('COMMAND_SHINDEIRU_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_SHINDEIRU_EXTENDED'),
			requiredPermissions: ['ATTACH_FILES'],
			runIn: ['text', 'dm'],
			usage: '<image:image>'
		});
	}

	public async run(message: KlasaMessage, [imageBuffer]: [Buffer]) {
		const imageBuff = new Canvas(512, 512)
			.addImage(this.bodyImage!, 0, 0)
			.rotate(-0.4)
			.addImage(imageBuffer, -210, 512 - 241, 330, 330, {
				type: 'round',
				radius: 330 / 2,
				restore: true
			})
			.rotate(0.4)
			.addImage(this.handsImage!, 0, 0)
			.toBufferAsync();

		const finishedImage = new MessageAttachment(await imageBuff, `peepoLove.png`);

		return message.send(finishedImage);
	}

	public async init() {
		[this.bodyImage, this.handsImage] = await Promise.all([
			readFile(join(assetsFolder, '/images/generation/peepoBody.png')),
			readFile(join(assetsFolder, '/images/generation/peepoHands.png'))
		]);
	}


}
