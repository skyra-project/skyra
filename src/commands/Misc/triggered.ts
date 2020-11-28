import { SkyraCommand } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { assetsFolder } from '#utils/constants';
import { fetchAvatar, streamToBuffer } from '#utils/util';
import { Image, loadImage } from 'canvas';
import { Canvas, rgba } from 'canvas-constructor';
import { User } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { join } from 'path';
import GIFEncoder = require('gifencoder');

const COORDINATES: readonly [number, number][] = [
	[-25, -25],
	[-50, -13],
	[-42, -34],
	[-14, -10]
];

export default class extends SkyraCommand {
	private kTemplate: Image = null!;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 30,
			description: (language) => language.get(LanguageKeys.Commands.Misc.TriggeredDescription),
			extendedHelp: (language) => language.get(LanguageKeys.Commands.Misc.TriggeredExtended),
			requiredPermissions: ['ATTACH_FILES'],
			spam: true,
			usage: '[user:username]'
		});
	}

	public async run(message: KlasaMessage, [user = message.author]: [User]) {
		const attachment = await this.generate(user);
		return message.channel.sendFile(attachment, 'triggered.gif');
	}

	public async generate(user: User) {
		const encoder = new GIFEncoder(350, 393);
		const canvas = new Canvas(350, 393);

		const userAvatar = await fetchAvatar(user, 512);

		const stream = encoder.createReadStream();
		encoder.start();
		encoder.setRepeat(0);
		encoder.setDelay(50);
		encoder.setQuality(100);

		for (const [x, y] of COORDINATES) {
			encoder.addFrame(
				canvas
					.printImage(userAvatar, x, y, 400, 400)
					.printImage(this.kTemplate, 0, 340, 350, 53)
					.setColor(rgba(255, 100, 0, 0.4))
					.printRectangle(0, 0, 350, 350)['context']
			);
		}

		encoder.finish();

		return streamToBuffer(stream);
	}

	public async init() {
		this.kTemplate = await loadImage(join(assetsFolder, './images/memes/triggered.png'));
	}
}
