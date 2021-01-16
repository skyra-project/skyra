import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { assetsFolder } from '#utils/constants';
import { fetchAvatar, streamToBuffer } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';
import { Image, loadImage } from 'canvas';
import { Canvas, rgba } from 'canvas-constructor';
import type { Message, User } from 'discord.js';
import { join } from 'path';
import GIFEncoder = require('gifencoder');

const COORDINATES: readonly [number, number][] = [
	[-25, -25],
	[-50, -13],
	[-42, -34],
	[-14, -10]
];

@ApplyOptions<SkyraCommandOptions>({
	bucket: 2,
	cooldown: 30,
	description: LanguageKeys.Commands.Misc.TriggeredDescription,
	extendedHelp: LanguageKeys.Commands.Misc.TriggeredExtended,
	requiredPermissions: ['ATTACH_FILES'],
	spam: true,
	usage: '[user:username]'
})
export default class extends SkyraCommand {
	private kTemplate: Image = null!;

	public async run(message: Message, [user = message.author]: [User]) {
		const attachment = await this.generate(user);
		return message.channel.send({ files: [{ attachment, name: 'triggered.gif' }] });
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
