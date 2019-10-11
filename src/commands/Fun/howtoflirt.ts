import { Image } from 'canvas';
import { Canvas } from 'canvas-constructor';
import { readFile } from 'fs-nextra';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { join } from 'path';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { fetchAvatar } from '../../lib/util/util';
import { assetsFolder } from '../../Skyra';

const imageCoordinates = [
	[
		{ center: [211, 53], radius: 18 },
		{ center: [136, 237], radius: 53 },
		{ center: [130, 385], radius: 34 }
	], [
		{ center: [35, 25], radius: 22 },
		{ center: [326, 67], radius: 50 },
		{ center: [351, 229], radius: 43 },
		{ center: [351, 390], radius: 40 }
	]
];

export default class extends SkyraCommand {

	private template: Buffer | null = null;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['pants'],
			bucket: 2,
			cooldown: 30,
			description: language => language.get('COMMAND_HOWTOFLIRT_DESCRIPTION'),
			extendedHelp: language => language.get('COMMAND_HOWTOFLIRT_EXTENDED'),
			requiredPermissions: ['ATTACH_FILES'],
			runIn: ['text'],
			spam: true,
			usage: '<user:username>'
		});
	}

	public async run(message: KlasaMessage, [user]: [KlasaUser]) {
		const attachment = await this.generate(message, user);
		return message.channel.send({ files: [{ attachment, name: 'HowToFlirt.png' }] });
	}

	public async init() {
		this.template = await readFile(join(assetsFolder, '/images/memes/howtoflirt.png'));
	}

	private async generate(message: KlasaMessage, user: KlasaUser) {
		if (user.id === message.author!.id) user = this.client.user!;

		/* Get the buffers from both profile avatars */
		const buffers = await Promise.all([
			fetchAvatar(message.author!, 128),
			fetchAvatar(user, 128)
		]);
		const images = await Promise.all(buffers.map(buffer => new Promise<Image>((resolve, reject) => {
			const image = new Image(128, 128);
			image.src = buffer;
			image.onload = resolve;
			image.onerror = reject;
			resolve(image);
		})));

		/* Initialize Canvas */
		const canvas = new Canvas(500, 500)
			.addImage(this.template!, 0, 0, 500, 500);

		for (const index of [0, 1]) {
			const image = images[index];
			const coordinates = imageCoordinates[index];
			for (const coordinate of coordinates) {
				canvas.addCircularImage(image, coordinate.center[0], coordinate.center[1], coordinate.radius);
			}
		}

		return canvas.toBuffer();
	}

}
