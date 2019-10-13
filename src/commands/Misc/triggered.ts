import { Image } from 'canvas';
import { Canvas } from 'canvas-constructor';
import { readFile } from 'fs-nextra';
import * as GIFEncoder from 'gifencoder';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { join } from 'path';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { fetchAvatar, streamToBuffer } from '../../lib/util/util';
import { assetsFolder } from '../../Skyra';

const COORDINATES: readonly [number, number][] = [
	[-25, -25],
	[-50, -13],
	[-42, -34],
	[-14, -10]
];

export default class extends SkyraCommand {

	private template: Buffer | null = null;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 30,
			description: language => language.tget('COMMAND_TRIGGERED_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_TRIGGERED_EXTENDED'),
			requiredPermissions: ['ATTACH_FILES'],
			runIn: ['text'],
			spam: true,
			usage: '[user:username]'
		});
	}

	public async run(message: KlasaMessage, [user = message.author!]: [KlasaUser]) {
		const attachment = await this.generate(user);
		return message.channel.sendFile(attachment, 'triggered.gif');
	}

	public async generate(user: KlasaUser) {
		const encoder = new GIFEncoder(350, 393);
		const canvas = new Canvas(350, 393);

		const buffers = [this.template, await fetchAvatar(user, 512)];
		const [imgTitle, imgTriggered] = buffers.map(buffer => {
			const image = new Image(128, 128);
			image.src = buffer!;
			return image;
		});

		const stream = encoder.createReadStream();
		encoder.start();
		encoder.setRepeat(0);
		encoder.setDelay(50);
		encoder.setQuality(100);

		for (const [x, y] of COORDINATES) {
			encoder.addFrame(canvas
				.addImage(imgTriggered, x, y, 400, 400)
				.addImage(imgTitle, 0, 340, 350, 53)
				.setColor('rgba(255, 100, 0, 0.4)')
				.addRect(0, 0, 350, 350)
				.context);
		}

		encoder.finish();

		return streamToBuffer(stream);
	}

	public async init() {
		this.template = await readFile(join(assetsFolder, './images/memes/triggered.png'));
	}

}
